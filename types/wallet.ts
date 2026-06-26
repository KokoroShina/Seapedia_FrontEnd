export type TransactionType = 'topup' | 'payment' | 'refund' | 'earning'

export interface WalletTransaction {
  id: number
  user_id: number
  type: TransactionType
  amount: number
  description: string
  created_at: string
}

export interface Wallet {
  balance: number
  transactions: WalletTransaction[]
}

export interface TopupPayload {
  amount: number
  payment_method: string
}

export interface TopupResponse {
  merchantOrderId: string
  paymentUrl?: string
  vaNumber?: string
  qrString?: string
}
