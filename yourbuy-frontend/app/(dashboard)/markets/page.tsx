import { DashboardHeader } from '@/features/dashboard/dashboard-header';

export default function MarketsPage() {
  return (
    <>
      <DashboardHeader title="Markets" />
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">Market search, quotes, movers, candles, and sectors are available through the backend API.</div>
      </div>
    </>
  );
}
