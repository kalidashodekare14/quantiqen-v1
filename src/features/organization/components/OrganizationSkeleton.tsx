import { Skeleton } from "@/components/ui/skeleton";

const OrganizationSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="bg-card flex items-center gap-5 rounded-xl border p-6">
        <Skeleton className="size-16 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="bg-card flex flex-col gap-4 rounded-xl border p-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="mb-3 h-4 w-20" />
          <div className="bg-card flex flex-col rounded-xl border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-border flex items-center justify-between border-b px-5 py-3.5 last:border-b-0"
              >
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSkeleton;
