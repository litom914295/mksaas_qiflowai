export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Root Home OK</h1>
      <p className="mt-2 text-muted-foreground">
        If you can see this, App Router is active.
      </p>
      <a
        href="/simple"
        className="mt-4 inline-block text-primary hover:underline"
      >
        Go to /simple
      </a>
    </main>
  );
}
