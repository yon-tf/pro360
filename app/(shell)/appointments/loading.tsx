export default function LoadingAppointmentsPage() {
  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <div className="h-6 w-52 animate-pulse rounded-md bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-border bg-muted/40" />
    </div>
  );
}
