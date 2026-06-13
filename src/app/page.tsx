export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand p-8 text-brand-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">urRoute</h1>
        <p className="mt-2 text-brand-foreground/80">
          Empowering Operators, Ensuring Safe Journeys
        </p>
      </div>
      <div className="rounded-lg bg-action px-6 py-3 font-medium text-action-foreground">
        Foundation ready — auth & dashboards coming next
      </div>
    </main>
  );
}
