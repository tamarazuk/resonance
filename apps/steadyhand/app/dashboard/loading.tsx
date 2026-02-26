import { Skeleton } from "@resonance/ui/components/skeleton";

export default function DashboardLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10"
      aria-busy="true"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">Loading dashboard</span>

      <div className="mb-10 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="flex flex-col gap-10">
        <section>
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-80 max-w-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left">
                      <Skeleton className="h-3 w-20" />
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Skeleton className="h-3 w-16" />
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Skeleton className="h-3 w-16" />
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Skeleton className="h-3 w-20" />
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Skeleton className="h-3 w-12" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="px-5 py-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-5 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-5 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-5 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="ml-auto w-fit">
                          <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
