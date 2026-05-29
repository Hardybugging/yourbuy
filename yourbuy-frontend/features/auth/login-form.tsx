'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await AuthService.login({ email, password });
      router.push('/dashboard');
    } catch {
      toast.error('Unable to log in');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <input className="w-full rounded-md border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-md border p-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded-md bg-ink p-3 font-semibold text-white">Log in</button>
    </form>
  );
}
