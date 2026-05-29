import Link from 'next/link';
import { BarChart3, Brain, ShieldCheck } from 'lucide-react';

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-mint">YourBuy Intelligence</p>
          <h1 className="text-5xl font-semibold leading-tight text-ink md:text-7xl">YourBuy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A production-shaped investing workspace with simulated orders, portfolio analytics, market data, watchlists, notifications, and contextual AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white">Create account</Link>
            <Link href="/login" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-ink">Log in</Link>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[['Markets', BarChart3], ['AI Context', Brain], ['Secure APIs', ShieldCheck]].map(([label, Icon]) => (
            <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-mint" />
              <p className="mt-4 font-semibold">{String(label)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
