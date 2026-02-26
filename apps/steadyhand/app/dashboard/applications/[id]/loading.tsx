import { Skeleton } from "@resonance/ui/components/skeleton";

export default function ApplicationDetailLoading() {
  return (
    <div
      className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <span className="sr-only">Loading application details</span>

      <div className="w-full max-w-[1024px] space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="flex items-start gap-6">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-9 w-72 max-w-full" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="border-b border-border px-2">
            <div className="-mb-px flex space-x-8 py-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-8">
                <Skeleton className="mb-6 h-6 w-36" />
                <Skeleton className="mb-4 h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
              <div className="rounded-2xl border border-border bg-card p-8">
                <Skeleton className="mb-6 h-6 w-44" />
                <Skeleton className="mb-3 h-4 w-full" />
                <Skeleton className="mb-3 h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl border border-border bg-card p-8">
                <Skeleton className="mb-6 h-6 w-36" />
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="mb-4 flex items-start gap-3">
                    <Skeleton className="mt-0.5 h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-card p-8">
                <Skeleton className="mb-6 h-6 w-32" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
