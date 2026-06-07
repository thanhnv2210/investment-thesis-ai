export default function HomeLoading() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between px-8 mb-6">
        <div className="h-5 w-36 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
      <div className="border-t border-border" />
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-8 py-5">
            <div className="h-5 w-16 bg-muted animate-pulse rounded shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              <div className="h-3 bg-muted animate-pulse rounded w-24 mt-1" />
            </div>
            <div className="h-5 w-14 bg-muted animate-pulse rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
