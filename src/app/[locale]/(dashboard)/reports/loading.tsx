export default function Loading() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3">
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
