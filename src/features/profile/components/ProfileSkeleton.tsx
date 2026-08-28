"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="bg-card flex items-center justify-between rounded-xl border p-6">
        <div className="flex items-center gap-5">
          <Skeleton className="size-16 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-card rounded-xl border p-5">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="flex flex-col">
            {Array.from({ length: 8 }).map((_, j) => (
              <div
                key={j}
                className="border-border flex items-center justify-between border-b py-3 last:border-b-0"
              >
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="flex flex-col">
            {Array.from({ length: 2 }).map((_, j) => (
              <div
                key={j}
                className="border-border flex items-center justify-between border-b py-3 last:border-b-0"
              >
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <div className="pt-4">
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
