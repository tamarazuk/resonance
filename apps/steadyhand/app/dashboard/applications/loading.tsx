import { Skeleton } from "@resonance/ui/components/skeleton";

export default function DashboardApplicationsLoading() {
  return (
    <div
      className="flex flex-1 flex-col items-center px-6 py-10 sm:px-12"
      aria-busy="true"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">Loading application form</span>

      <div className="w-full max-w-2xl">
        <Skeleton className="mb-8 h-4 w-40" />

        <div className="mb-10 flex flex-col items-center">
          <Skeleton className="mb-3 h-9 w-72 max-w-full" />
          <Skeleton className="mb-2 h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex h-28 items-end p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-36" />
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex flex-col gap-8">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row">
                <Skeleton className="h-10 w-full rounded-md sm:flex-1" />
                <Skeleton className="h-10 w-36 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  );
}
