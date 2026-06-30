"use client";

import { Skeleton } from "@/components/ui/skeleton";

const NotificationsSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-5 w-52" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="flex w-full flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card flex items-start gap-4 rounded-xl border px-5 py-4"
          >
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16 shrink-0" />
              </div>
              <Skeleton className="h-4 w-24 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
            <Skeleton className="mt-1 size-2 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsSkeleton;
