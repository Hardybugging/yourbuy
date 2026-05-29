import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MarketsService } from '../markets/markets.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService, private readonly markets: MarketsService) {}

  async getOrCreate(userId: string) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { holdings: true },
    });
  }

  async overview(userId: string) {
    const portfolio = await this.getOrCreate(userId);
    const holdings = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const quote = (await this.markets.quote(holding.symbol)) as { price: number; changePercent: number };
        const quantity = Number(holding.quantity);
        const avg = Number(holding.averagePrice);
        const value = quantity * quote.price;
        return { ...holding, quantity, averagePrice: avg, lastPrice: quote.price, value, pnl: value - quantity * avg, changePercent: quote.changePercent };
      }),
    );
    const holdingsValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const cashBalance = Number(portfolio.cashBalance);
    return { id: portfolio.id, cashBalance, totalValue: cashBalance + holdingsValue, holdingsValue, holdings };
  }

  async performance(userId: string) {
    const overview = await this.overview(userId);
    return Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10),
      value: Number((overview.totalValue * (1 + Math.sin(index / 5) / 50)).toFixed(2)),
    }));
  }

  async allocation(userId: string) {
    const overview = await this.overview(userId);
    return overview.holdings.map((holding) => ({
      symbol: holding.symbol,
      value: holding.value,
      weight: overview.holdingsValue ? holding.value / overview.holdingsValue : 0,
    }));
  }

  async requirePortfolio(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    return portfolio;
  }
}