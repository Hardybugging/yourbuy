'use client';

import { useState } from 'react';
import { AiService } from '@/services/ai.service';

export function AiCopilot() {
  const [message, setMessage] = useState('How should I think about my portfolio risk?');
  const [answer, setAnswer] = useState('');

  async function ask() {
    const response = await AiService.ask(message);
    setAnswer(response.messages?.at(-1)?.content || '');
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="font-semibold">AI Copilot</h2>
      <textarea className="mt-3 w-full rounded-md border p-3" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={ask} className="mt-3 rounded-md bg-ink px-4 py-2 text-white">Ask</button>
      {answer ? <p className="mt-4 text-sm leading-6 text-slate-700">{answer}</p> : null}
    </div>
  );
}
