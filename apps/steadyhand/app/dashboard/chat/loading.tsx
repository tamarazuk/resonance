import { Skeleton } from "@resonance/ui/components/skeleton";

export default function DashboardChatLoading() {
  return (
    <div className="flex h-full" aria-busy="true">
      <span className="sr-only">Loading career coach</span>

      <div className="flex w-3/5 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/50 bg-card/90 px-8 py-5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-8">
          <div className="space-y-4">
            <div className="flex justify-start">
              <Skeleton className="h-24 w-4/5 rounded-xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-16 w-3/5 rounded-xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-2/3 rounded-xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-16 w-1/2 rounded-xl" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Skeleton className="h-11 w-full rounded-md" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-2/5 flex-col bg-secondary">
        <div className="flex items-center justify-between px-8 py-6">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>

        <div className="flex gap-4 border-b border-primary/20 px-8 pb-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-sm border border-border bg-card/60 p-4"
            >
              <Skeleton className="mb-3 h-4 w-1/2" />
              <Skeleton className="mb-2 h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
          ))}
        </div>

        <div className="px-8 pb-6">
          <div className="rounded-sm border border-primary/20 bg-card/50 p-4">
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="mb-2 h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
