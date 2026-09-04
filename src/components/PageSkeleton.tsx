import { Skeleton } from "@/components/ui/skeleton";

export default function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="mb-4 h-9 w-64" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
