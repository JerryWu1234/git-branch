import type { ProcessOutput } from 'zx'
import debug from 'debug'
import { $, question, sleep } from 'zx'
import chalk from 'chalk'
import cac from 'cac'
import { createHash, getRealName, loader } from './utils'

$.verbose = false
const cli = cac('bt-git')
const hash = createHash()
async function prompt() {
  cli.command(' bt-git \n\n -m, --major, plaese input major branch name \n -t, --target plaese input merged target name \n -u, --url plaese input project url').option('-m, --major', 'plaese input major branch name')
    .option('-t, --target', 'plaese input merged target name')
    .option('-u, --url', 'plaese input project url')
  cli.help()
  const parsed = cli.parse()

  return parsed
}

let currentBranch: ProcessOutput
async function getCurrentBranch() {
  return await $`git branch`
}

export async function main() {
  const parsed = await prompt()
  const marjorBranch = parsed.options.major || parsed.options.m
  const mergedBranch = parsed.options.t || parsed.options.target
  const url = parsed.options.u || parsed.options.url

  if (!marjorBranch && !mergedBranch)
    return
  currentBranch = await getCurrentBranch()
  const realname = getRealName(currentBranch.stdout) || ''

  if (realname.includes('|')) {
    debug.log(chalk.red(`current ${realname} branch is not your development  branch`))
    await $`exit 1`
  }

  const spinner = loader(`get current branch ${chalk.green('name')}`)
  await sleep(1000)
  spinner.stop()

  debug.log(`current branch name: ${chalk.bgGreen(realname)}`)

  const jira = await question('please input jira id:')
  const comment = await question('please input comment:')

  await commitCode(jira, comment, marjorBranch, realname)
  await checkoutBranch(`${hash}|${mergedBranch}`)
  await mergeCode(realname)
  await pushCode(`${hash}|${mergedBranch}`, url)
}

async function commitCode(jira: string, comment: string, marjor: string, realname: string) {
  if (!jira && !comment) {
    debug.log(chalk.red('jira and comment are not empty'))
    await $`exit 1`
  }

  try {
    await $`git add .`
    const spinner = loader('committing code')
    await sleep(1000)
    spinner.stop()
    await $`git commit -m "${jira} # ${comment}"`
    debug.log(chalk.green(`current commit jiraId: ${jira} # comment: ${comment}`))
    await $`git merge origin/${marjor}`.catch((e) => {
      debug.log(chalk.red((e as ProcessOutput).stderr))
    })
    debug.log(chalk.green(`current branch:${realname},is pulling code from ${marjor}`))
    await $`git pull origin ${realname}`
    await sleep(1000)
    if (!await inspectFile())
      await $`exit 1`

    debug.log(chalk.green(`current branch:${realname},is pushing code`))
    await $`git push origin ${realname}`
    await sleep(1000)
  }
  catch (e) {
    if ((e as ProcessOutput).stdout.includes('nothing to commit, working tree clean')) {
      await $`git merge origin/${marjor}`.catch((e) => {
        debug.log(chalk.red((e as ProcessOutput).stderr))
      })
    }
    else {
      debug.log(chalk.red((e as ProcessOutput).stderr))
      await $`exit 1`
    }
  }
}

async function checkoutBranch(branch: string) {
  await $`git checkout -b ${branch}`
  debug.log(chalk.green(`created new branch: ${branch}`))
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
    if (!await inspectFile())
      await $`exit 1`
    await sleep(1000)
    spinnernext.stop()
  }
  catch (e) {
    debug.log(chalk.red((e as ProcessOutput).stderr))
    await $`exit 1`
  }
}
async function pushCode(bransh: string, url?: string) {
  try {
    await $`git push origin ${bransh}`
    debug.log(chalk.green('push code success, please merging code in gilab'))
    url && debug.log(chalk.green(chalk.bgGreen(`open merge url: ${url}`)))
  }
  catch (e) {
    debug.log(chalk.red((e as ProcessOutput).stderr))
    await $`exit 1`
  }
}

async function inspectFile() {
  const val = await $`git status`
  if (val.stdout.includes('nothing to commit, working tree clean')) {
    return true
  }
  else {
    debug.log(chalk.red('there is something to commit'))
    return false
  }
}

main()

