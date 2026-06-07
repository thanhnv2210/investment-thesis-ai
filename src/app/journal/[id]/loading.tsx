export default function JournalDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      </div>

      <div className="border-t border-border" />

      {/* Counterarguments skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            <div className="flex gap-2">
              <div className="h-7 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-7 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-7 w-32 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border" />

      {/* Decision skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  )
}
