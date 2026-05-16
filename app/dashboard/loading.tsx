const C = {
  green: "#007956",
  border: "#e7e5e4",
  bgTint: "#f5f5f4",
  bgWarm: "#fafaf9",
};

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ backgroundColor: C.bgTint }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bgWarm }}
      >
        <div className="flex items-center justify-between">
          <span className="text-base font-bold" style={{ color: C.green }}>
            ヒメタネ
          </span>
          <SkeletonBox className="h-4 w-16" />
        </div>
      </header>

      {/* Greeting skeleton */}
      <div className="px-4 pb-1 pt-5 space-y-1">
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-7 w-32" />
      </div>

      {/* Credit card skeleton */}
      <div className="mx-4 mt-3">
        <SkeletonBox className="h-36 w-full rounded-2xl" />
      </div>

      {/* Shoots skeleton */}
      <div className="mt-6 px-4 space-y-2">
        <SkeletonBox className="h-4 w-24" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <SkeletonBox key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Assets skeleton */}
      <div className="mt-6 px-4 space-y-3">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-10 w-full rounded-xl" />
        <SkeletonBox className="h-9 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
