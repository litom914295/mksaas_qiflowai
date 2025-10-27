export default function RootPage() {
  // This page should never be reached due to middleware redirect
  // But we'll keep it as a fallback
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Root Fallback</h1>
      <p className="mt-2 text-muted-foreground">
        This page should not be reachable. Middleware should handle the
        redirect.
      </p>
    </main>
  );
}
