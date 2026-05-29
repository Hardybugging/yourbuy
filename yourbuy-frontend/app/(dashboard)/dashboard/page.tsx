import { DashboardHeader } from '@/features/dashboard/dashboard-header';
import { TradeModal } from '@/components/trade-modal';
import { AiCopilot } from '@/components/ai-copilot';

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <TradeModal />
        <AiCopilot />
      </div>
    </>
  );
}
