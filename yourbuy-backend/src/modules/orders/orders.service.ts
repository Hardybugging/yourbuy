import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderSide, OrderType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MarketsService } from '../markets/markets.service';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolio: PortfolioService,
    private readonly markets: MarketsService,
  ) {}

  async execute(userId: string, body: { symbol: string; quantity: number; side?: OrderSide; type?: OrderType; limitPrice?: number }) {
    const side = body.side || (body as { type?: OrderSide }).type || OrderSide.BUY;
    const quantity = Number(body.quantity);
    if (!body.symbol || quantity <= 0) throw new BadRequestException('Symbol and positive quantity are required');
    const portfolio = await this.portfolio.requirePortfolio(userId);
    const quote = (await this.markets.quote(body.symbol)) as { price: number; name?: string };
    const price = body.limitPrice || quote.price;
    const notional = quantity * price;

    if (side === OrderSide.BUY && Number(portfolio.cashBalance) < notional) {
      throw new BadRequestException('Insufficient cash balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          portfolioId: portfolio.id,
          symbol: body.symbol.toUpperCase(),
          side,
          type: body.type || OrderType.MARKET,
          quantity,
          limitPrice: body.limitPrice,
          executedPrice: price,
          metadata: { simulated: true },
        },
      });

      const existing = await tx.holding.findUnique({
        where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: order.symbol } },
      });

      if (side === OrderSide.BUY) {
        const oldQty = existing ? Number(existing.quantity) : 0;
        const oldAvg = existing ? Number(existing.averagePrice) : 0;
        const newQty = oldQty + quantity;
        const averagePrice = (oldQty * oldAvg + notional) / newQty;
        await tx.holding.upsert({
          where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: order.symbol } },
          create: { portfolioId: portfolio.id, symbol: order.symbol, name: quote.name, quantity, averagePrice, lastPrice: price },
          update: { quantity: newQty, averagePrice, lastPrice: price },
        });
        await tx.portfolio.update({ where: { id: portfolio.id }, data: { cashBalance: { decrement: notional } } });
      } else {
        if (!existing || Number(existing.quantity) < quantity) throw new BadRequestException('Insufficient holdings');
        const remaining = Number(existing.quantity) - quantity;
        if (remaining === 0) await tx.holding.delete({ where: { id: existing.id } });
        else await tx.holding.update({ where: { id: existing.id }, data: { quantity: remaining, lastPrice: price } });
        await tx.portfolio.update({ where: { id: portfolio.id }, data: { cashBalance: { increment: notional } } });
      }
      return order;
    });
  }

  history(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}