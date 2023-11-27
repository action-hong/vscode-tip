import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { DEFAULT_TIME_FORMAT, EX_HIDE_STATUS_ITEM, EX_NAME, EX_SHOWTIME, EX_TIME_FORMAT, EX_TIPS } from './constants'
import { CronContext } from './CronContext'
import type { Tip } from './types'
import { getCurrentTime } from './utils'

export function activate(ctx: ExtensionContext) {
  const channel = window.createOutputChannel('tip')
  const cronContext = new CronContext(channel)

  // status bar
  const barItem = window.createStatusBarItem(StatusBarAlignment.Right, 100)
  barItem.tooltip = 'click to hide'
  barItem.command = EX_HIDE_STATUS_ITEM

  let showTime = workspace.getConfiguration(EX_NAME).get<boolean>('showTime') || false
  let format = workspace.getConfiguration(EX_NAME).get<string>('timeFormat') || DEFAULT_TIME_FORMAT

  ctx.subscriptions.push(
    cronContext,
    channel,
    barItem,
    commands.registerCommand(EX_HIDE_STATUS_ITEM, () => {
      barItem.hide()
    }),
  )

  workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(EX_TIPS))
      createCronList()
    else if (e.affectsConfiguration(EX_SHOWTIME))
      showTime = workspace.getConfiguration(EX_NAME).get<boolean>('showTime') || false
    else if (e.affectsConfiguration(EX_TIME_FORMAT))
      format = workspace.getConfiguration(EX_NAME).get<string>('timeFormat') || DEFAULT_TIME_FORMAT
  })

  function createCronList() {
    cronContext.dispose()

    const tips = workspace.getConfiguration(EX_NAME).get<Tip[]>('tips') || []
    tips.forEach((tip) => {
      cronContext.createCron(
        tip.cron,
        () => {
          let message = `${tip.message}`
          if (showTime)
            message += `- ${getCurrentTime(format)}`

          if (tip.type === 'error') {
            window.showErrorMessage(message)
          }
          else if (tip.type === 'warning') {
            window.showWarningMessage(message)
          }
          else if (tip.type === 'status') {
            barItem.text = tip.message
            barItem.color = tip.color
            barItem.show()
          }
          else { window.showInformationMessage(message) }
        },
      )
    })

    // current status bar
    const item = tips.find(item => item.type === 'status' && item.message === barItem.text)
    if (item && item.type === 'status')
      barItem.color = item.color
  }

  createCronList()
}
