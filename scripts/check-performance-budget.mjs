import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const ASSETS_DIR = path.resolve('dist/assets')

const budgets = {
  jsEntryGzipMax: Number(process.env.BUDGET_JS_ENTRY_GZIP_MAX ?? 170 * 1024),
  cssEntryGzipMax: Number(process.env.BUDGET_CSS_ENTRY_GZIP_MAX ?? 30 * 1024),
  totalAssetsGzipMax: Number(process.env.BUDGET_TOTAL_ASSETS_GZIP_MAX ?? 270 * 1024),
}

function toKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`
}

async function getAssetSizes() {
  const files = await readdir(ASSETS_DIR)
  const assetFiles = files.filter((file) => file.endsWith('.js') || file.endsWith('.css'))

  if (assetFiles.length === 0) {
    throw new Error(`No CSS or JS assets found in ${ASSETS_DIR}. Build first.`)
  }

  const assets = await Promise.all(
    assetFiles.map(async (fileName) => {
      const fullPath = path.join(ASSETS_DIR, fileName)
      const content = await readFile(fullPath)
      return {
        fileName,
        type: fileName.endsWith('.js') ? 'js' : 'css',
        rawBytes: content.length,
        gzipBytes: gzipSync(content).length,
      }
    }),
  )

  return assets
}

function pickLargestByType(assets, type) {
  return assets
    .filter((asset) => asset.type === type)
    .sort((a, b) => b.gzipBytes - a.gzipBytes)[0]
}

function reportMetric(label, value, max) {
  const status = value <= max ? 'PASS' : 'FAIL'
  console.log(`${status} ${label}: ${toKb(value)} / budget ${toKb(max)}`)
  return status === 'PASS'
}

async function main() {
  const assets = await getAssetSizes()
  const largestJs = pickLargestByType(assets, 'js')
  const largestCss = pickLargestByType(assets, 'css')
  const totalAssetsGzip = assets.reduce((sum, asset) => sum + asset.gzipBytes, 0)

  const checks = [
    reportMetric(
      'Largest JS asset (gzip)',
      largestJs?.gzipBytes ?? 0,
      budgets.jsEntryGzipMax,
    ),
    reportMetric(
      'Largest CSS asset (gzip)',
      largestCss?.gzipBytes ?? 0,
      budgets.cssEntryGzipMax,
    ),
    reportMetric(
      'Total JS+CSS assets (gzip)',
      totalAssetsGzip,
      budgets.totalAssetsGzipMax,
    ),
  ]

  console.log('')
  console.log('Largest JS:', largestJs?.fileName ?? 'n/a')
  console.log('Largest CSS:', largestCss?.fileName ?? 'n/a')

  if (checks.some((passed) => !passed)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(`[perf-budget] ${error.message}`)
  process.exitCode = 1
})
