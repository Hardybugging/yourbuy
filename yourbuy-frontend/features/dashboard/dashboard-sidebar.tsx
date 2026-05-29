import Link from 'next/link';
import { BarChart3, Brain, Briefcase, Home, LineChart, Receipt } from 'lucide-react';

const items = [
  ['Dashboard', '/dashboard', Home],
  ['Portfolio', '/portfolio', Briefcase],
  ['Markets', '/markets', LineChart],
  ['Orders', '/orders', Receipt],
  ['AI Insights', '/ai-insights', Brain],
];

export function DashboardSidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-8 flex items-center gap-2 font-semibold"><BarChart3 className="h-5 w-5 text-mint" />YourBuy</div>
      <nav className="space-y-1">
        {items.map(([label, href, Icon]) => (
          <Link key={String(href)} href={String(href)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <Icon className="h-4 w-4" />{String(label)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
