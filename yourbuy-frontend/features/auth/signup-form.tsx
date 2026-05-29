'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await AuthService.register({ ...form, skills: ['React'] });
      router.push('/onboarding');
    } catch {
      toast.error('Unable to create account');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <input className="w-full rounded-md border p-3" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input className="w-full rounded-md border p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full rounded-md border p-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full rounded-md bg-ink p-3 font-semibold text-white">Create account</button>
    </form>
  );
}
