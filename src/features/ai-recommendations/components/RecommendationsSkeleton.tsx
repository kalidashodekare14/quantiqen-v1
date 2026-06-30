"use client";

import { Skeleton } from "@/components/ui/skeleton";

const RecommendationsSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-60" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card ring-foreground/10 flex flex-col gap-4 rounded-xl p-4 ring-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
            <Skeleton className="h-7 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSkeleton;
