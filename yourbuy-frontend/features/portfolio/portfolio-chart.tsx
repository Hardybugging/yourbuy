export function PortfolioChart({ points }: { points: { date: string; value: number }[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="flex h-56 items-end gap-1 rounded-lg bg-white p-5 shadow-sm">
      {points.map((point) => (
        <div key={point.date} className="flex-1 rounded-t bg-mint" style={{ height: `${Math.max(8, (point.value / max) * 180)}px` }} title={point.date} />
      ))}
    </div>
  );
}
