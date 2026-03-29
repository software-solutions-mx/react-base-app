#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const TMP_DIR = path.join(ROOT_DIR, 'tmp')
const LOG_DIR = path.join(TMP_DIR, 'pre_release_check_logs')
const ISSUES_TSV = path.join(TMP_DIR, 'pre_release_check_issues.tsv')
const ISSUES_JSON = path.join(TMP_DIR, 'pre_release_check_issues.json')
const REPORT_PATH = path.join(TMP_DIR, 'pre_release_check_results.json')
const OUTPUT_CHAR_LIMIT = 8000
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

const DEFAULT_CHECK_NAMES = ['ci_check', 'e2e_tests', 'dependency_audit']
const DEFAULT_CHECK_COMMANDS = [
  'npm run ci:check',
  'npm run test:e2e',
  'npm run audit:deps',
]
const DEFAULT_SELECTED_CHECKS_CSV =
  process.env.PRECHECK_STEPS ?? process.env.PRECHECK_CHECKS ?? ''

function printUsage() {
  console.log(`Usage: scripts/prerelease_check [--checks check1,check2,...]

Options:
  --checks, --steps   Run only selected checks by name.
  -h, --help          Show this help.

Examples:
  scripts/prerelease_check
  scripts/prerelease_check --checks ci_check,e2e_tests`)
}

function parseArgs(argv) {
  let selectedChecksCsv = DEFAULT_SELECTED_CHECKS_CSV

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--checks' || arg === '--steps') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error(`Missing value for ${arg}`)
      }
      selectedChecksCsv = value
      index += 1
      continue
    }

    if (arg.startsWith('--checks=') || arg.startsWith('--steps=')) {
      const [, value] = arg.split('=', 2)
      selectedChecksCsv = value ?? ''
      continue
    }

    if (arg === '-h' || arg === '--help') {
      printUsage()
      process.exit(0)
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return selectedChecksCsv
}

function resolveSelectedChecks(selectedChecksCsv) {
  const selectedCheckNames = []
  const selectedCheckCommands = []

  if (selectedChecksCsv && selectedChecksCsv.trim().length > 0) {
    const requestedChecks = selectedChecksCsv
      .split(',')
      .map((check) => check.trim())
      .filter(Boolean)

    for (const requestedCheck of requestedChecks) {
      const matchedIndex = DEFAULT_CHECK_NAMES.findIndex(
        (name) => name === requestedCheck,
      )

      if (matchedIndex === -1) {
        throw new Error(
          `Unknown check: ${requestedCheck}\nValid checks: ${DEFAULT_CHECK_NAMES.join(', ')}`,
        )
      }

      selectedCheckNames.push(DEFAULT_CHECK_NAMES[matchedIndex])
      selectedCheckCommands.push(DEFAULT_CHECK_COMMANDS[matchedIndex])
    }
  } else {
    selectedCheckNames.push(...DEFAULT_CHECK_NAMES)
    selectedCheckCommands.push(...DEFAULT_CHECK_COMMANDS)
  }

  if (selectedCheckNames.length === 0) {
    throw new Error('No checks selected.')
  }

  return { selectedCheckNames, selectedCheckCommands }
}

function trimOutput(output) {
  if (typeof output !== 'string') {
    return ''
  }

  if (output.length <= OUTPUT_CHAR_LIMIT) {
    return output
  }

  const tail = output.slice(-OUTPUT_CHAR_LIMIT)
  return `[trimmed ${output.length - OUTPUT_CHAR_LIMIT} chars]\n${tail}`
}

function sanitizeStepName(stepName) {
  return stepName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function makeLogContent(result) {
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''

  if (!stdout && !stderr) {
    return ''
  }

  if (!stderr) {
    return stdout
  }

  if (!stdout) {
    return stderr
  }

  return `${stdout}\n\n[stderr]\n${stderr}`
}

async function runStep({ stepName, command, stepNumber, totalSteps }) {
  const stepPrefix = `[${String(stepNumber).padStart(2, '0')}/${String(totalSteps).padStart(2, '0')}]`
  console.log(`${stepPrefix} ${stepName}`)

  const safeName = sanitizeStepName(stepName)
  const logFile = path.join(
    LOG_DIR,
    `${String(stepNumber).padStart(2, '0')}_${safeName}.log`,
  )

  const startedAt = Date.now()
  const result = spawnSync(command, {
    shell: true,
    cwd: ROOT_DIR,
    encoding: 'utf-8',
    env: process.env,
  })
  const endedAt = Date.now()
  const exitCode = result.status ?? 1

  await writeFile(logFile, makeLogContent(result), 'utf-8')

  if (exitCode === 0) {
    console.log(`  ${GREEN}OK${RESET}`)
  } else {
    console.log(`  ${RED}FAILED${RESET} (exit ${exitCode}). Log: ${logFile}`)
  }

  return {
    stepName,
    command,
    status: exitCode === 0 ? 'passed' : 'failed',
    exitCode,
    durationMs: endedAt - startedAt,
    logFile,
    stdout: trimOutput(result.stdout ?? ''),
    stderr: trimOutput(result.stderr ?? ''),
  }
}

async function main() {
  const selectedChecksCsv = parseArgs(process.argv.slice(2))
  const { selectedCheckNames, selectedCheckCommands } =
    resolveSelectedChecks(selectedChecksCsv)

  await mkdir(TMP_DIR, { recursive: true })
  await mkdir(LOG_DIR, { recursive: true })
  await mkdir('/tmp/test-results', { recursive: true })
  await writeFile(ISSUES_TSV, '', 'utf-8')

  const selectedChecks = selectedCheckNames.map((name, index) => ({
    name,
    command: selectedCheckCommands[index],
  }))

  const steps = [
    {
      stepName: 'Restore cache (local no-op)',
      command: "echo 'restore_cache is CI-only and is skipped locally.'",
    },
    {
      stepName: 'Install dependencies',
      command: 'npm ci',
    },
    {
      stepName: 'Save cache (local no-op)',
      command: "echo 'save_cache is CI-only and is skipped locally.'",
    },
    ...selectedChecks.map((check) => ({
      stepName: `Run ${check.name}`,
      command: check.command,
    })),
    {
      stepName: 'Store test results path',
      command: 'mkdir -p /tmp/test-results',
    },
  ]

  const checkResults = []
  for (const [index, step] of steps.entries()) {
    const result = await runStep({
      stepName: step.stepName,
      command: step.command,
      stepNumber: index + 1,
      totalSteps: steps.length,
    })
    checkResults.push(result)
  }

  const failedChecks = checkResults.filter((check) => check.status === 'failed')
  const issuesTsvRows = failedChecks
    .map(
      (check) =>
        `${check.stepName}\t${check.command}\t${check.exitCode}\t${check.logFile}`,
    )
    .join('\n')

  await writeFile(ISSUES_TSV, `${issuesTsvRows}${issuesTsvRows ? '\n' : ''}`, 'utf-8')

  const issuesPayload = {
    status: failedChecks.length > 0 ? 'failed' : 'passed',
    generated_at: new Date().toISOString(),
    issues: failedChecks.map((check) => ({
      step: check.stepName,
      command: check.command,
      exit_code: check.exitCode,
      log_file: check.logFile,
    })),
  }
  await writeFile(ISSUES_JSON, `${JSON.stringify(issuesPayload, null, 2)}\n`, 'utf-8')

  const detailedReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: steps.length,
      passed: checkResults.length - failedChecks.length,
      failed: failedChecks.length,
      status: failedChecks.length === 0 ? 'passed' : 'failed',
    },
    selectedChecks: selectedCheckNames,
    logsDirectory: LOG_DIR,
    issuesTsvFile: ISSUES_TSV,
    issuesJsonFile: ISSUES_JSON,
    steps: checkResults,
  }

  await writeFile(REPORT_PATH, `${JSON.stringify(detailedReport, null, 2)}\n`, 'utf-8')

  if (failedChecks.length === 0) {
    console.log(`${GREEN}All Good!!!${RESET}`)
    process.exit(0)
  }

  const failureReport = {
    message: 'Pre-release checks failed',
    reportFile: ISSUES_JSON,
    logsDirectory: LOG_DIR,
    issues: failedChecks.map((check) => ({
      name: check.stepName,
      command: check.command,
      exitCode: check.exitCode,
      durationMs: check.durationMs,
      logFile: check.logFile,
      stderr: check.stderr,
      stdout: check.stdout,
    })),
  }

  console.log(JSON.stringify(failureReport, null, 2))
  process.exit(1)
}

main().catch(async (error) => {
  await mkdir(TMP_DIR, { recursive: true })
  const failureReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: DEFAULT_CHECK_NAMES.length,
      passed: 0,
      failed: DEFAULT_CHECK_NAMES.length,
      status: 'failed',
    },
    fatalError: error instanceof Error ? error.message : String(error),
  }

  await writeFile(REPORT_PATH, `${JSON.stringify(failureReport, null, 2)}\n`, 'utf-8')
  console.log(
    JSON.stringify(
      {
        message: 'Pre-release check script failed unexpectedly',
        reportFile: REPORT_PATH,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : String(error),
      },
      null,
      2,
    ),
  )
  process.exit(1)
})
