#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPORT_PATH = path.join(__dirname, 'prerelease_check_results.json')
const OUTPUT_CHAR_LIMIT = 8000

const checks = [
  {
    name: 'ci_check',
    command: 'npm run ci:check',
  },
  {
    name: 'e2e_tests',
    command: 'npm run test:e2e',
  },
  {
    name: 'dependency_audit',
    command: 'npm run audit:deps',
  },
]

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

function runCommand(command) {
  const startedAt = Date.now()
  const result = spawnSync(command, {
    shell: true,
    encoding: 'utf-8',
    env: process.env,
  })
  const endedAt = Date.now()

  return {
    command,
    status: result.status === 0 ? 'passed' : 'failed',
    exitCode: result.status ?? 1,
    durationMs: endedAt - startedAt,
    stdout: trimOutput(result.stdout ?? ''),
    stderr: trimOutput(result.stderr ?? ''),
  }
}

async function main() {
  const checkResults = checks.map((check) => ({
    name: check.name,
    ...runCommand(check.command),
  }))

  const failedChecks = checkResults.filter((check) => check.status === 'failed')
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: checkResults.length,
      passed: checkResults.length - failedChecks.length,
      failed: failedChecks.length,
      status: failedChecks.length === 0 ? 'passed' : 'failed',
    },
    checks: checkResults,
  }

  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf-8')

  if (failedChecks.length === 0) {
    console.log('All Good!!!')
    process.exit(0)
  }

  const failureReport = {
    message: 'Pre-release checks failed',
    reportFile: REPORT_PATH,
    issues: failedChecks.map((check) => ({
      name: check.name,
      command: check.command,
      exitCode: check.exitCode,
      durationMs: check.durationMs,
      stderr: check.stderr,
      stdout: check.stdout,
    })),
  }

  console.log(JSON.stringify(failureReport, null, 2))
  process.exit(1)
}

main().catch(async (error) => {
  const failureReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: checks.length,
      passed: 0,
      failed: checks.length,
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
