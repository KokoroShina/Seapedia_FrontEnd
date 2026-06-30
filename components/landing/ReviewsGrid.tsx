'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Send, Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'

interface Review {
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

interface ReviewsResponse {
  data: {
    data: Review[]
  }
}

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hover || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const formattedDate = new Date(review.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-ocean-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-ocean-800">{review.reviewer_name}</h4>
          <p className="text-xs text-ocean-400">{formattedDate}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-ocean-600 text-sm leading-relaxed">{review.comment}</p>
    </div>
  )
}

function ReviewForm({ onSuccess }: { onSuccess: () => void }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const submitMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const res = await api.post('/reviews', data)
      return res.data
    },
    onSuccess: () => {
      setRating(0)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] })
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating > 0 && comment.trim()) {
      submitMutation.mutate({ rating, comment: comment.trim() })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ocean-50 rounded-xl p-5 border border-ocean-100">
      <h4 className="font-semibold text-ocean-800 mb-4">Tulis Ulasan Kamu</h4>

      <div className="mb-4">
        <label className="block text-sm text-ocean-600 mb-2">Rating</label>
        <StarRating rating={rating} interactive onRate={setRating} />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-ocean-600 mb-2">Komentar</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagaimana pengalamanmu menggunakan aplikasi ini?"
          className="w-full px-4 py-3 rounded-lg border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 outline-none resize-none text-ocean-800 placeholder-ocean-400"
          rows={3}
        />
      </div>

      {submitMutation.isError && (
        <p className="text-red-500 text-sm mb-3">Gagal mengirim ulasan. Silakan coba lagi.</p>
      )}

      <button
        type="submit"
        disabled={rating === 0 || !comment.trim() || submitMutation.isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-ocean-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-ocean-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Kirim Ulasan
      </button>
    </form>
  )
}

export default function ReviewsGrid() {
  const { isAuthenticated } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews', { params: { page: 1 } })
      return res.data
    },
  })

  const reviews = data?.data?.data ?? []

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-ocean-500 to-cyan-500 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-ocean-800">
            Ulasan Pengguna
          </h2>
        </div>

        {!isAuthenticated ? (
          <a
            href="/auth/login"
            className="text-sm text-ocean-600 hover:text-ocean-800 font-medium underline underline-offset-4"
          >
            Login untuk menulis ulasan
          </a>
        ) : showForm ? (
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-ocean-600 hover:text-ocean-800 font-medium"
          >
            Tutup form
          </button>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 bg-ocean-500 text-white rounded-lg font-medium hover:bg-ocean-600 transition-colors"
          >
            Tulis Ulasan
          </button>
        )}
      </div>

      {/* Submit Success Message */}
      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          Terima kasih! Ulasanmu berhasil dikirim.
        </div>
      )}

      {/* Review Form */}
      {isAuthenticated && showForm && (
        <ReviewForm onSuccess={() => {
          setSubmitSuccess(true)
          setShowForm(false)
          setTimeout(() => setSubmitSuccess(false), 5000)
        }} />
      )}

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-ocean-500">
          Gagal memuat ulasan. Silakan refresh halaman.
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-ocean-500">
          Belum ada ulasan. Jadilah yang pertama!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
