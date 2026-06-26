"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface AuthCardProps {
  children: ReactNode;
  showBackToHome?: boolean;
}

export function AuthCard({ children, showBackToHome = true }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full bg-seapedia-navy flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top right blob */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-seapedia-teal/10 rounded-full blur-3xl" />
        {/* Bottom left blob */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-seapedia-teal/10 rounded-full blur-3xl" />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-seapedia-teal/5 rounded-full blur-3xl" />
      </div>

      {/* Card Container - Fixed min height for consistency */}
      <div className="relative w-full max-w-5xl animate-scale-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
          {children}
        </div>
      </div>

      {/* Back to home link */}
      {showBackToHome && (
        <Link
          href="/"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-sm transition-colors"
        >
          ← Kembali ke Beranda
        </Link>
      )}
    </div>
  );
}
