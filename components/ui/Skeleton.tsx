import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-ocean-100 via-ocean-50 to-ocean-100 bg-[length:200%_100%] animate-shimmer rounded",
        className
      )}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
    </div>
  )
}

// Pre-defined skeleton variants
export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-ocean-100 shadow-md">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonCategory() {
  return (
    <div className="w-28 lg:w-32 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-ocean-100 shadow-md overflow-hidden">
        <Skeleton className="h-20 lg:h-24 w-full" />
        <div className="p-3 text-center">
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonButton() {
  return <Skeleton className="h-10 w-full rounded-xl" />
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }
  return <Skeleton className={cn(sizeClasses[size], "rounded-full")} />
}
