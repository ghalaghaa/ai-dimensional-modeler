export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 flex-1 max-w-xs" />
          <Skeleton className="h-4 flex-1 max-w-[120px] hidden sm:block" />
          <Skeleton className="h-4 flex-1 max-w-[120px] hidden md:block" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="p-5 space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}
