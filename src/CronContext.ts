import Cron from 'croner'
import type { OutputChannel } from 'vscode'

export class CronContext {
  crons: Array<Cron> = []

  constructor(private channel: OutputChannel) {}

  createCron(...args: Parameters<typeof Cron>) {
    try {
      const cron = Cron(...args)
      this.crons.push(cron)
      return cron
    }
    catch (error) {
      if (error instanceof Error)
        this.channel.appendLine(error.message)
    }
  }

  dispose() {
    this.crons.forEach(f => f.stop())
    this.crons.length = 0
  }
}
