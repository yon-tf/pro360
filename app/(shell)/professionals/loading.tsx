export default function LoadingProfessionalsPage() {
  return (
    <div className="space-y-4 p-2">
      <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      <div className="flex gap-3">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-border bg-muted/40" />
    </div>
  );
}
