import { DashboardHeader } from '@/features/dashboard/dashboard-header';
import { TradeModal } from '@/components/trade-modal';

export default function OrdersPage() {
  return (
    <>
      <DashboardHeader title="Orders" />
      <div className="p-6"><TradeModal /></div>
    </>
  );
}
