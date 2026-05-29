'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { OrdersService } from '@/services/orders.service';

export function TradeModal() {
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);

  async function buy() {
    await OrdersService.execute({ symbol, quantity, side: 'BUY' });
    toast.success('Simulated order executed');
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Quick trade</h2>
      <div className="mt-4 flex gap-2">
        <input className="w-28 rounded-md border p-2" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        <input className="w-24 rounded-md border p-2" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <button onClick={buy} className="rounded-md bg-ink px-4 text-white">Buy</button>
      </div>
    </div>
  );
}
