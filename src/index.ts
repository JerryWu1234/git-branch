import type { ProcessOutput } from 'zx'
import debug from 'debug'
import { $, question, sleep } from 'zx'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { createHash, getRealName, loader } from './utils'
$.verbose = false
const hash = createHash()
async function prompt() {
  return await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'please you select your wanted merge branch',
      choices: [
        'test',
        'release',
        'release-wl',
      ],
    },
  ])
}

let currentBranch: ProcessOutput
async function getCurrentBranch() {
  return await $`git branch`
}

async function main() {
  const v = await prompt()

  await inspectFile()

  currentBranch = await getCurrentBranch()

  const realname = getRealName(currentBranch.stdout) || ''

  const spinner = loader(`get current branch ${chalk.green('name')}`)
  await sleep(1000)
  spinner.stop()

  debug.log(`current branch name: ${chalk.bgGreen(realname)}`)

  const jira = await question('please input jira id')
  const comment = await question('please input comment')

  await commitCode(jira, comment)
  await checkoutBranch(`${hash}${v.environment}`)
  await mergeCode(realname)
  await pushCode(`${hash}${v.environment}`)
}

async function commitCode(jira: string, comment: string) {
  if (!jira && !comment) {
    debug.log(chalk.red('jira and comment are not empty'))
    await $`exit 1`
  }

  try {
    await $`git add .`
    const spinner = loader('committing code')
    await sleep(1000)
    spinner.stop()
    await $`git commit -m ${jira} # ${comment}`
  }
  catch (e) {
    debug.log(chalk.red((e as ProcessOutput).stderr))
    await $`exit 1`
  }
}

async function checkoutBranch(branch: string) {
  await $`git checkout -b ${branch}`
  const spinner = loader('checkout new branch')
  await sleep(1000)
  spinner.stop()
  await $`git checkout ${branch}`
  const spinnernext = loader('checkouted branch')
  await sleep(1000)
  spinnernext.stop()
}

async function mergeCode(currentBranch: string) {
  try {
    const spinnernext = loader('merging code')
    await $`git merge ${currentBranch}`
    await sleep(1000)
    spinnernext.stop()
  }
  catch (e) {
    debug.log(chalk.red((e as ProcessOutput).stderr))
    await $`exit 1`
  }
}
async function pushCode(bransh: string) {
  await $`git push origin ${bransh}`
  debug.log(chalk.green('push code success'))
}

async function inspectFile() {
  const val = await $`git status`
  if (val.stdout.includes('nothing to commit, working tree clean')) {
    debug.log(chalk.red('there is something to commit'))
    await $`exit 1`
  }
  else {
    await $`exit 0`
  }
}

main()

