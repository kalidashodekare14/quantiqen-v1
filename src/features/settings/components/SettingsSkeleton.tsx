"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SettingsSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-44" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border p-5">
          <Skeleton className="mb-4 h-4 w-32" />
          {Array.from({ length: i === 1 ? 5 : 3 }).map((_, j) => (
            <div
              key={j}
              className="border-border flex items-center justify-between border-b py-3 last:border-b-0"
            >
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SettingsSkeleton;
