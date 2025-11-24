export function GroupBuySkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 rounded-xl bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-32 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-6 w-2/3 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-4 w-40 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded-full bg-gray-100 animate-pulse" />
          <div className="h-2 w-full rounded-full bg-gray-100 animate-pulse" />
          <div className="h-3 w-1/3 rounded-full bg-gray-100 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-full bg-gray-100 animate-pulse self-end" />
      </div>
    </div>
  );
}

