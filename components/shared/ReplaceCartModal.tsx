'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, AlertTriangle, ArrowRight } from 'lucide-react'

interface ReplaceCartModalProps {
  isOpen: boolean
  onClose: () => void
  onReplace: () => void
  onKeep: () => void
  currentStore: {
    name: string
  }
  newStore: {
    name: string
  }
}

export default function ReplaceCartModal({
  isOpen,
  onClose,
  onReplace,
  onKeep,
  currentStore,
  newStore,
}: ReplaceCartModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-800">Keranjang Toko Berbeda</h2>
                    <p className="text-sm text-amber-600">Anda memiliki item dari toko lain</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🏪</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Keranjang Saat Ini</p>
                        <p className="font-semibold text-slate-700">{currentStore.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-ocean-500 rotate-90" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-ocean-50 rounded-xl border border-ocean-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-ocean-500" />
                      </div>
                      <div>
                        <p className="text-xs text-ocean-500">Item Baru</p>
                        <p className="font-semibold text-ocean-700">{newStore.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 text-center">
                  Keranjang Anda saat ini berisi item dari <strong>{currentStore.name}</strong>.
                  Ingin melanjutkan?
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={onKeep}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Tetep di {currentStore.name}
                </button>
                <button
                  onClick={onReplace}
                  className="flex-1 px-4 py-3 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors"
                >
                  Ganti ke {newStore.name}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
