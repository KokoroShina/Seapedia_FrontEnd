interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-ocean-100 rounded ${className}`}
    />
  )
}

// Pre-defined skeleton variants
export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCategory() {
  return <Skeleton className="min-w-[72px] h-[72px] rounded-lg" />
}
