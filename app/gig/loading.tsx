export default function LoadingGigPage() {
  return (
    <div className="space-y-4 p-2">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
      <div className="flex gap-3">
        <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-56 animate-pulse rounded-xl bg-muted/50" />
        <div className="h-56 animate-pulse rounded-xl bg-muted/50" />
        <div className="h-56 animate-pulse rounded-xl bg-muted/50" />
      </div>
    </div>
  );
}
