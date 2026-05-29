import { DashboardHeader } from '@/features/dashboard/dashboard-header';

export default function PortfolioPage() {
  return (
    <>
      <DashboardHeader title="Portfolio" />
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">Portfolio overview loads from /api/v1/portfolio/overview after login.</div>
      </div>
    </>
  );
}
