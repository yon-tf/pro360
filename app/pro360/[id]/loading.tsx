export default function LoadingProfessionalPerformancePage() {
  return (
    <div className="space-y-4 p-2">
      <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
      <div className="h-28 animate-pulse rounded-xl border border-border bg-muted/40" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl bg-muted/50" />
        <div className="h-72 animate-pulse rounded-xl bg-muted/50 lg:col-span-2" />
      </div>
    </div>
  );
}
