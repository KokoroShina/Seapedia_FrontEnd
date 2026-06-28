'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { Wallet, WalletTransaction, TopupPayload, TopupResponse } from '@/types/wallet'
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react'

interface PaymentMethod {
  code: string
  name: string
  image: string
  fee: number
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000]

export default function WalletPage() {
  const queryClient = useQueryClient()
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [topupAmount, setTopupAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [topupResult, setTopupResult] = useState<TopupResponse | null>(null)

  // Fetch wallet data
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Wallet>>('/wallet')
      return res.data.data
    },
  })

  // Fetch payment methods from API
  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaymentMethod[]>>('/payment-methods')
      return res.data.data
    },
  })

  const formatPrice = (price: string | number | null | undefined) => {
    const num = typeof price === 'string' ? parseFloat(price) || 0 : (price || 0)
    if (isNaN(num)) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return { icon: ArrowDownLeft, color: 'text-green-500', bg: 'bg-green-100' }
      case 'payment':
      case 'checkout':
        return { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-100' }
      case 'refund':
        return { icon: ArrowDownLeft, color: 'text-blue-500', bg: 'bg-blue-100' }
      case 'earning':
        return { icon: ArrowDownLeft, color: 'text-green-500', bg: 'bg-green-100' }
      default:
        return { icon: WalletIcon, color: 'text-ocean-500', bg: 'bg-ocean-100' }
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'topup':
        return 'Topup'
      case 'payment':
        return 'Pembayaran'
      case 'checkout':
        return 'Pembayaran Order'
      case 'refund':
        return 'Refund'
      case 'earning':
        return 'Pendapatan'
      default:
        return type
    }
  }

  const handleQuickAmount = (amount: number) => {
    setCustomAmount(amount.toString())
    setTopupAmount(amount)
  }

  const handleCustomAmountChange = (value: string) => {
    const num = parseInt(value.replace(/\D/g, '')) || 0
    setCustomAmount(value)
    setTopupAmount(num)
  }

  const handleTopup = async () => {
    if (!topupAmount || topupAmount < 10000) {
      alert('Minimum topup adalah Rp 10.000')
      return
    }
    if (!selectedMethod) {
      alert('Pilih metode pembayaran')
      return
    }

    setIsProcessing(true)
    try {
      const payload: TopupPayload = {
        amount: topupAmount,
        payment_method: selectedMethod,
      }
      const res = await api.post<ApiResponse<TopupResponse>>('/wallet/topup', payload)
      const data = res.data.data

      if (data?.paymentUrl) {
        setTopupResult(data)
        // Open payment URL in new tab
        window.open(data.paymentUrl, '_blank')
      } else if (data?.vaNumber) {
        setTopupResult(data)
      } else {
        alert('Topup berhasil! Saldo akan bertambah setelah pembayaran.')
        setShowTopupModal(false)
        queryClient.invalidateQueries({ queryKey: ['wallet'] })
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memproses topup')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetTopup = () => {
    setShowTopupModal(false)
    setSelectedMethod('')
    setTopupAmount(0)
    setCustomAmount('')
    setTopupResult(null)
  }

  return (
    <div className="min-h-screen bg-ocean-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-ocean-800">
              Dompet Digital
            </h1>
            <p className="text-ocean-500 mt-1">
              Kelola saldo dan riwayat transaksi
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-ocean-100 text-sm">Saldo Tersedia</p>
                  <p className="text-3xl md:text-4xl font-bold">
                    {isLoading ? 'Loading...' : formatPrice(wallet?.balance || 0)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(true)}
                className="flex items-center gap-2 bg-white text-ocean-600 px-4 py-2 rounded-xl font-semibold hover:bg-ocean-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Topup
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopupModal(true)}
                className="flex-1 py-3 bg-white/20 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Topup
              </button>
              <button className="flex-1 py-3 bg-white/20 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                Transfer
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl border border-ocean-100 overflow-hidden">
            <div className="p-4 border-b border-ocean-100">
              <h2 className="text-lg font-bold text-ocean-800">Riwayat Transaksi</h2>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ocean-100 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-ocean-100 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-ocean-50 rounded w-24 animate-pulse mt-1" />
                    </div>
                    <div className="h-5 bg-ocean-100 rounded w-20 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !wallet?.transactions || wallet.transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WalletIcon className="w-10 h-10 text-ocean-400" />
                </div>
                <p className="text-ocean-500">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="divide-y divide-ocean-100">
                {wallet.transactions.map((tx: WalletTransaction) => {
                  const { icon: Icon, color, bg } = getTransactionIcon(tx.type)
                  const isPositive = tx.type === 'topup' || tx.type === 'refund' || tx.type === 'earning'

                  return (
                    <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-ocean-50 transition-colors">
                      <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-ocean-800">{getTransactionLabel(tx.type)}</p>
                        <p className="text-sm text-ocean-500">{formatDate(tx.created_at)}</p>
                        {tx.description && (
                          <p className="text-xs text-ocean-400 mt-0.5">{tx.description}</p>
                        )}
                      </div>
                      <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'} {formatPrice(Math.abs(tx.amount))}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-ocean-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-ocean-800">
                {topupResult ? 'Konfirmasi Topup' : 'Topup Saldo'}
              </h2>
              <button
                onClick={resetTopup}
                className="p-2 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-ocean-500" />
              </button>
            </div>

            <div className="p-6">
              {topupResult ? (
                // Success State
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-ocean-800 mb-2">Topup Diproses!</h3>
                  <p className="text-ocean-500 mb-6">
                    Selesaikan pembayaran sebelum {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}
                  </p>

                  <div className="bg-ocean-50 rounded-xl p-4 mb-6 text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-ocean-500">Jumlah</span>
                      <span className="font-bold text-ocean-800">{formatPrice(topupAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ocean-500">Metode</span>
                      <span className="font-medium text-ocean-700">{selectedMethod}</span>
                    </div>
                  </div>

                  {topupResult.vaNumber && (
                    <div className="bg-ocean-50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-ocean-500 mb-1">Nomor Virtual Account</p>
                      <p className="text-2xl font-bold text-ocean-800 tracking-wider">
                        {topupResult.vaNumber}
                      </p>
                    </div>
                  )}

                  {topupResult.qrString && (
                    <div className="bg-ocean-50 rounded-xl p-4 mb-6 text-center">
                      <p className="text-sm text-ocean-500 mb-2">QR Code</p>
                      <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center rounded-lg border border-ocean-200">
                        {/* QR placeholder - in real app would render QR code */}
                        <p className="text-ocean-400 text-sm">QR Code</p>
                      </div>
                    </div>
                  )}

                  {topupResult.paymentUrl && (
                    <a
                      href={topupResult.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-ocean-500 text-white text-center rounded-xl font-semibold hover:bg-ocean-600 transition-colors mb-4"
                    >
                      Buka Halaman Pembayaran
                    </a>
                  )}

                  <button
                    onClick={resetTopup}
                    className="w-full py-3 border border-ocean-200 text-ocean-600 rounded-xl font-semibold hover:bg-ocean-50 transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              ) : (
                // Topup Form
                <>
                  {/* Amount Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Pilih Nominal
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {QUICK_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleQuickAmount(amount)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            customAmount === amount.toString()
                              ? 'bg-ocean-500 text-white'
                              : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                          }`}
                        >
                          {formatPrice(amount)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={customAmount ? `Rp ${parseInt(customAmount).toLocaleString('id-ID')}` : ''}
                      onChange={(e) => handleCustomAmountChange(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="Masukkan jumlah lain"
                      className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-lg"
                    />
                    <p className="text-xs text-ocean-400 mt-1">Minimum: Rp 10.000</p>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Metode Pembayaran
                    </label>
                    {!paymentMethods ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-16 bg-ocean-100 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.code}
                            onClick={() => setSelectedMethod(method.code)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                              selectedMethod === method.code
                                ? 'border-ocean-500 bg-ocean-50'
                                : 'border-ocean-100 hover:border-ocean-200'
                            }`}
                          >
                            <img
                              src={method.image}
                              alt={method.name}
                              className="w-10 h-10 object-contain rounded"
                              onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            <div className="flex-1 text-left">
                              <span className="text-sm font-medium text-ocean-700 block">
                                {method.name}
                              </span>
                              {method.fee === 0 && (
                                <span className="text-xs text-green-500">Tanpa biaya admin</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {topupAmount >= 10000 && selectedMethod && paymentMethods && (
                    <div className="bg-ocean-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-ocean-500">Jumlah Topup</span>
                        <span className="font-bold text-ocean-800">{formatPrice(topupAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ocean-500">Metode</span>
                        <span className="font-medium text-ocean-700">
                          {paymentMethods.find((m) => m.code === selectedMethod)?.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleTopup}
                    disabled={isProcessing || topupAmount < 10000 || !selectedMethod}
                    className="w-full py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Bayar Sekarang
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
