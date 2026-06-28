export type TransactionType = 'topup' | 'payment' | 'checkout' | 'refund' | 'earning'

export interface WalletTransaction {
  id: number
  wallet_id: number
  type: TransactionType
  amount: string | number
  status: string
  description: string | null
  created_at: string
}

export interface Wallet {
  id: number
  balance: string | number
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
