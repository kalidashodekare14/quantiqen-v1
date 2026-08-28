import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  variant: "card" | "table" | "page"
  count?: number
}

export const LoadingSkeleton = ({
  variant,
  count = 1,
}: LoadingSkeletonProps) => {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}
