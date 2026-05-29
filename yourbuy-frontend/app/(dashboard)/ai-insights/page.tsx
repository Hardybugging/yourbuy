import { AiCopilot } from '@/components/ai-copilot';
import { DashboardHeader } from '@/features/dashboard/dashboard-header';

export default function AiInsightsPage() {
  return (
    <>
      <DashboardHeader title="AI Insights" />
      <div className="p-6"><AiCopilot /></div>
    </>
  );
}
