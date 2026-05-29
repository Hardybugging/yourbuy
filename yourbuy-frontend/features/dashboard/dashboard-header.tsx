export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
    </header>
  );
}
