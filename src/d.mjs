import ora from 'ora'

const spinner = ora('Loading unicorns').start()

setTimeout(() => {
  spinner.color = 'yellow'
}, 1000)
