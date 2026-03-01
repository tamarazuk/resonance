export default function LoadingPrepPage() {
  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1024px] space-y-8">
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
