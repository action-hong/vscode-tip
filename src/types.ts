export type Tip = TipMessage | TipStatus

interface TipBase {
  cron: string
  message: string
}

interface TipMessage extends TipBase {
  type: 'info' | 'warning' | 'error'
}

interface TipStatus extends TipBase {
  type: 'status'
  color?: string
}
