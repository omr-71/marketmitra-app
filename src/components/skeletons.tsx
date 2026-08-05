export function Shimmer({ className = "" }: { className?: string }) {
  return <span className={`shimmer block rounded-xl ${className}`} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card-surface space-y-3 p-5">
      <Shimmer className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} className={`h-3 ${i % 2 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface space-y-2.5 p-4">
          <Shimmer className="h-3 w-1/2" />
          <Shimmer className="h-6 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="card-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5"
        >
          <Shimmer className="size-10 rounded-2xl" />
          <div className="space-y-2">
            <Shimmer className="h-3.5 w-2/5" />
            <Shimmer className="h-2.5 w-3/5" />
          </div>
          <Shimmer className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
