import hash_sum from 'hash-sum'
import ora from 'ora'
export function getRealName(name: string) {
  const value = name.match(/\*[\n\s](.+)[\n\s]/ig)
  return value?.[0].split('*')[1].trim()
}

export function loader(text: string) {
  const spinner = ora(text).start()
  spinner.color = 'red'
  return spinner
}

export function createHash() {
  const date = new Date().getTime()
  return hash_sum(date)
}
