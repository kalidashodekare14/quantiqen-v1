import { Skeleton } from "@/components/ui/skeleton";

const MonitoringSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-7 w-40 rounded-full" />
      </div>

      <div className="flex items-center gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 flex-1 rounded-xl" />
        ))}
      </div>

      <div className="bg-card ring-foreground/10 rounded-xl ring-1">
        <div className="flex items-center justify-between px-5 py-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
        </div>

        <div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-border flex items-start gap-3 border-b px-5 py-3 last:border-b-0"
            >
              <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-72" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringSkeleton;
