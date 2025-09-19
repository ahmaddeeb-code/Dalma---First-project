import { Skeleton } from "@/components/ui/skeleton";

export default function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-md border">
          <div className="w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-10 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
