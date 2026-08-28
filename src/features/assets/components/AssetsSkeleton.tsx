import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS = [
  { width: "w-32" },
  { width: "w-28" },
  { width: "w-24" },
  { width: "w-24" },
  { width: "w-20" },
  { width: "w-20" },
  { width: "w-24" },
];

const AssetsSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="bg-card ring-foreground/10 rounded-xl ring-1">
        <div className="border-border flex items-center gap-4 border-b px-5 py-3">
          {COLUMNS.map((col, i) => (
            <Skeleton key={i} className={`${col.width} h-4 rounded`} />
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="border-border flex items-center gap-4 border-b px-5 py-3.5 last:border-b-0"
          >
            {COLUMNS.map((col, colIdx) => (
              <Skeleton key={colIdx} className={`${col.width} h-3.5 rounded`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsSkeleton;
