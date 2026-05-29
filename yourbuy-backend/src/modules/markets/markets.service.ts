import { Injectable } from '@nestjs/common';
import { RedisService } from '../../cache/redis.service';
import { FinnhubProvider } from '../../providers/market/finnhub.provider';
import { TwelveDataProvider } from '../../providers/market/twelvedata.provider';

const FALLBACK_QUOTES: Record<string, { name: string; price: number; change: number; changePercent: number; sector: string }> = {
  AAPL: { name: 'Apple Inc.', price: 193.42, change: 1.12, changePercent: 0.58, sector: 'Technology' },
  MSFT: { name: 'Microsoft Corp.', price: 425.22, change: -0.84, changePercent: -0.2, sector: 'Technology' },
  TSLA: { name: 'Tesla Inc.', price: 178.08, change: 3.64, changePercent: 2.09, sector: 'Consumer Cyclical' },
  NVDA: { name: 'NVIDIA Corp.', price: 920.0, change: 12.75, changePercent: 1.4, sector: 'Technology' },
  AMZN: { name: 'Amazon.com Inc.', price: 184.3, change: 0.67, changePercent: 0.36, sector: 'Consumer Cyclical' },
};

@Injectable()
export class MarketsService {
  constructor(
    private readonly cache: RedisService,
    private readonly twelveData: TwelveDataProvider,
    private readonly finnhub: FinnhubProvider,
  ) {}

  async quote(symbol: string) {
    const normalized = symbol.toUpperCase();
    const cacheKey = `quote:${normalized}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    let quote = await this.fromProviders(normalized);
    if (!quote) {
      const fallback = FALLBACK_QUOTES[normalized] ?? { name: normalized, price: 100, change: 0, changePercent: 0, sector: 'Unknown' };
      quote = { symbol: normalized, ...fallback, timestamp: new Date().toISOString(), source: 'fallback' };
    }
    await this.cache.set(cacheKey, quote, 60);
    return quote;
  }

  async search(query: string) {
    const q = query.toUpperCase();
    const provider = await this.twelveData.search(q).catch(() => null);
    const providerResults = provider?.data?.map((item: { symbol: string; instrument_name: string }) => ({ symbol: item.symbol, name: item.instrument_name })) ?? [];
    const fallback = Object.entries(FALLBACK_QUOTES)
      .filter(([symbol, data]) => symbol.includes(q) || data.name.toUpperCase().includes(q))
      .map(([symbol, data]) => ({ symbol, name: data.name, sector: data.sector }));
    return providerResults.length ? providerResults : fallback;
  }

  async candles(symbol: string) {
    const base = (await this.quote(symbol)) as { price: number };
    return Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10),
      close: Number((base.price * (1 + Math.sin(index / 4) / 30)).toFixed(2)),
    }));
  }

  movers() {
    return Object.entries(FALLBACK_QUOTES)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }

  sectors() {
    return [
      { sector: 'Technology', changePercent: 0.82 },
      { sector: 'Healthcare', changePercent: -0.15 },
      { sector: 'Financials', changePercent: 0.34 },
      { sector: 'Energy', changePercent: -0.48 },
    ];
  }

  private async fromProviders(symbol: string) {
    const twelve = await this.twelveData.quote(symbol).catch(() => null);
    if (twelve?.close) {
      return {
        symbol,
        name: twelve.name || symbol,
        price: Number(twelve.close),
        change: Number(twelve.change || 0),
        changePercent: Number(twelve.percent_change || 0),
        sector: 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'twelvedata',
      };
    }
    const finnhub = await this.finnhub.quote(symbol).catch(() => null);
    if (finnhub?.c) {
      return {
        symbol,
        name: symbol,
        price: Number(finnhub.c),
        change: Number(finnhub.d || 0),
        changePercent: Number(finnhub.dp || 0),
        sector: 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'finnhub',
      };
    }
    return null;
  }
}