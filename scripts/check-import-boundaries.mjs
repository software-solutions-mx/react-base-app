import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC_ROOT = path.resolve('src')
const FEATURE_ROOT = path.join(SRC_ROOT, 'features')
const SHARED_ROOTS = ['components', 'lib', 'config', 'seo', 'i18n', 'analytics'].map(
  (segment) => path.join(SRC_ROOT, segment),
)
const APP_ROOT = path.join(SRC_ROOT, 'app')
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']
const IMPORT_PATTERN =
  /(?:import|export)\s+[\s\S]*?\sfrom\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g

function isInside(childPath, parentPath) {
  return childPath === parentPath || childPath.startsWith(`${parentPath}${path.sep}`)
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return collectSourceFiles(resolvedPath)
      }

      if (!FILE_EXTENSIONS.includes(path.extname(entry.name))) {
        return []
      }

      if (resolvedPath.includes(`${path.sep}node_modules${path.sep}`)) {
        return []
      }

      return [resolvedPath]
    }),
  )

  return files.flat()
}

async function resolveImportPath(sourceFilePath, specifier) {
  if (specifier.startsWith('@/')) {
    return resolveFile(path.join(SRC_ROOT, specifier.slice(2)))
  }

  if (specifier.startsWith('src/')) {
    return resolveFile(path.join(path.resolve('.'), specifier))
  }

  if (specifier.startsWith('.')) {
    const sourceDir = path.dirname(sourceFilePath)
    return resolveFile(path.resolve(sourceDir, specifier))
  }

  return null
}

async function resolveFile(basePath) {
  const extension = path.extname(basePath)
  if (extension) {
    try {
      const fileStats = await stat(basePath)
      return fileStats.isFile() ? basePath : null
    } catch {
      return null
    }
  }

  for (const candidateExtension of FILE_EXTENSIONS) {
    const candidatePath = `${basePath}${candidateExtension}`
    try {
      const fileStats = await stat(candidatePath)
      if (fileStats.isFile()) {
        return candidatePath
      }
    } catch {
      // Continue checking candidate paths.
    }
  }

  for (const candidateExtension of FILE_EXTENSIONS) {
    const indexPath = path.join(basePath, `index${candidateExtension}`)
    try {
      const fileStats = await stat(indexPath)
      if (fileStats.isFile()) {
        return indexPath
      }
    } catch {
      // Continue checking candidate paths.
    }
  }

  return null
}

function getFeatureName(filePath) {
  if (!isInside(filePath, FEATURE_ROOT)) {
    return null
  }

  const relativeFeaturePath = path.relative(FEATURE_ROOT, filePath)
  const [featureName] = relativeFeaturePath.split(path.sep)
  return featureName ?? null
}

function isFeaturePublicEntry(filePath) {
  const featureName = getFeatureName(filePath)
  if (!featureName) {
    return false
  }

  const fileName = path.basename(filePath)
  return fileName === 'index.js' || fileName === 'index.jsx'
}

function isSharedLayer(filePath) {
  return SHARED_ROOTS.some((sharedRoot) => isInside(filePath, sharedRoot))
}

function formatPath(filePath) {
  return path.relative(path.resolve('.'), filePath)
}

async function getImportSpecifiers(filePath) {
  const content = await readFile(filePath, 'utf8')
  const specifiers = []
  let match = IMPORT_PATTERN.exec(content)

  while (match) {
    const [, importFrom, dynamicImport] = match
    const specifier = importFrom ?? dynamicImport
    if (specifier) {
      specifiers.push(specifier)
    }
    match = IMPORT_PATTERN.exec(content)
  }

  return specifiers
}

async function main() {
  const sourceFiles = await collectSourceFiles(SRC_ROOT)
  const violations = []

  for (const sourceFilePath of sourceFiles) {
    const importSpecifiers = await getImportSpecifiers(sourceFilePath)
    const sourceFeature = getFeatureName(sourceFilePath)
    const sourceIsShared = isSharedLayer(sourceFilePath)

    for (const specifier of importSpecifiers) {
      const resolvedTargetPath = await resolveImportPath(sourceFilePath, specifier)
      if (!resolvedTargetPath || !isInside(resolvedTargetPath, SRC_ROOT)) {
        continue
      }

      const targetFeature = getFeatureName(resolvedTargetPath)
      const targetIsApp = isInside(resolvedTargetPath, APP_ROOT)

      if (sourceFeature && targetIsApp) {
        violations.push(
          `${formatPath(sourceFilePath)} -> ${specifier}: feature modules cannot import app layer files.`,
        )
      }

      if (sourceIsShared && (targetFeature || targetIsApp)) {
        violations.push(
          `${formatPath(sourceFilePath)} -> ${specifier}: shared modules cannot depend on features/app layers.`,
        )
      }

      if (
        targetFeature &&
        sourceFeature !== targetFeature &&
        !isFeaturePublicEntry(resolvedTargetPath)
      ) {
        violations.push(
          `${formatPath(sourceFilePath)} -> ${specifier}: cross-feature imports must target the feature public API (index.js).`,
        )
      }
    }
  }

  if (violations.length > 0) {
    console.error('Import boundary violations found:')
    violations.forEach((violation, index) => {
      console.error(`${index + 1}. ${violation}`)
    })
    process.exitCode = 1
    return
  }

  console.log('PASS import boundaries')
}

main().catch((error) => {
  console.error(`[boundaries] ${error.message}`)
  process.exitCode = 1
})
