import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { EX_HIDE_STATUS_ITEM, EX_NAME, EX_TIPS } from './constants'
import { CronContext } from './CronContext'
import type { Tip } from './types'

export function activate(ctx: ExtensionContext) {
  const channel = window.createOutputChannel('tip')
  const cronContext = new CronContext(channel)

  // status bar
  const barItem = window.createStatusBarItem(StatusBarAlignment.Right, 100)
  barItem.tooltip = 'click to hide'
  barItem.command = EX_HIDE_STATUS_ITEM

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
  })

  function createCronList() {
    cronContext.dispose()

    const tips = workspace.getConfiguration(EX_NAME).get<Tip[]>('tips') || []
    tips.forEach((tip) => {
      cronContext.createCron(
        tip.cron,
        () => {
          if (tip.type === 'error') {
            window.showErrorMessage(tip.message)
          }
          else if (tip.type === 'warning') {
            window.showWarningMessage(tip.message)
          }
          else if (tip.type === 'status') {
            barItem.text = tip.message
            barItem.color = tip.color
            barItem.show()
          }
          else { window.showInformationMessage(tip.message) }
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
