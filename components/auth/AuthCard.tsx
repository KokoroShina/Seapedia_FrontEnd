'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AuthCardProps {
  illustrationSide: 'left' | 'right'
  illustrationSrc: string
  illustrationAlt: string
  illustrationCaption: string
  children: ReactNode
}

export default function AuthCard({
  illustrationSide,
  illustrationSrc,
  illustrationAlt,
  illustrationCaption,
  children,
}: AuthCardProps) {
  const isIllustrationLeft = illustrationSide === 'left'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-[20px] border border-[#D6E8F5] max-w-[900px] w-[95%] min-h-[480px] flex overflow-hidden shadow-sm"
    >
      {/* Illustration Panel */}
      <motion.div
        initial={{ opacity: 0, x: isIllustrationLeft ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className={`hidden md:flex flex-col items-center justify-center p-8 bg-[#EBF5FC] ${
          isIllustrationLeft ? 'md:w-1/2' : 'md:w-1/2 order-2'
        }`}
      >
        <div className="relative w-full max-w-[280px] h-[280px]">
          <Image
            src={illustrationSrc}
            alt={illustrationAlt}
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="text-[14px] text-[#4A7A9B] text-center max-w-[200px] mt-4">
          {illustrationCaption}
        </p>
      </motion.div>

      {/* Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: isIllustrationLeft ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className={`flex-1 flex flex-col justify-center p-8 md:p-10 ${
          isIllustrationLeft ? '' : 'md:order-1'
        }`}
      >
        {children}
      </motion.div>

      {/* Mobile Back Link */}
      <Link
        href="/"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#4A7A9B] text-xs hover:text-[#1B8AC4] transition-colors md:hidden"
      >
        ← Kembali ke Beranda
      </Link>
    </motion.div>
  )
}
