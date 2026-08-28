import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = () => (
  <div className="bg-card ring-foreground/10 flex w-full flex-col gap-4 rounded-xl p-5 ring-1">
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-55 w-full rounded-xl" />
  </div>
);

const AnalyticsSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <ChartSkeleton />
    </div>
  );
};

export default AnalyticsSkeleton;
