import type { ProcessOutput } from 'zx'
import debug from 'debug'
import { $, sleep } from 'zx'
import chalk from 'chalk'
import { getRealName, loader } from './utils'
$.verbose = false

let currentBranch: ProcessOutput
async function getCurrentBranch() {
  return await $`git branch`
}

async function main() {
  currentBranch = await getCurrentBranch()
  const realname = getRealName(currentBranch.stdout)
  const spinner = loader(`get current branch ${chalk.green('name')}`)
  await sleep(1000)
  spinner.stop()
  debug.log(`current branch name: ${chalk.bgGreen(realname)}`)
}

main()

