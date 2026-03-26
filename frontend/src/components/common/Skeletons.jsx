export function SkeletonLoader({ count = 1, height = 'h-12', width = 'w-full' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} ${width} bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse`} />
      ))}
    </>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
              style={{ flex: Math.random() * 0.5 + 0.5 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function CardSkeleton({ title = true }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="space-y-4">
        {title && <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-40 animate-pulse" />}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
