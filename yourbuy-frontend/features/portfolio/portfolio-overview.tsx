type Holding = { id: string; symbol: string; quantity: number; averagePrice: number; value: number; pnl: number };

export function PortfolioOverview({ data }: { data: { totalValue: number; cashBalance: number; holdings: Holding[] } }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total value</p><p className="mt-2 text-2xl font-semibold">${data.totalValue.toLocaleString()}</p></div>
      <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Cash</p><p className="mt-2 text-2xl font-semibold">${data.cashBalance.toLocaleString()}</p></div>
      <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Positions</p><p className="mt-2 text-2xl font-semibold">{data.holdings.length}</p></div>
    </section>
  );
}
