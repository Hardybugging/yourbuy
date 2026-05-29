'use client';

import { useRouter } from 'next/navigation';

export function OnboardingFlow() {
  const router = useRouter();
  return (
    <main className="mx-auto mt-24 max-w-2xl rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Set up YourBuy</h1>
      <p className="mt-3 text-slate-600">Your account starts with a simulated cash balance, a default watchlist, and access to all API-backed modules.</p>
      <button onClick={() => router.push('/dashboard')} className="mt-6 rounded-md bg-ink px-5 py-3 font-semibold text-white">Enter dashboard</button>
    </main>
  );
}
