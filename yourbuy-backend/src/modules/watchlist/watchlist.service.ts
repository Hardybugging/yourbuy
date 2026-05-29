import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.watchlist.findMany({ where: { userId }, include: { assets: true }, orderBy: { createdAt: 'asc' } });
  }

  create(userId: string, name: string) {
    return this.prisma.watchlist.create({ data: { userId, name }, include: { assets: true } });
  }

  addAsset(userId: string, watchlistId: string, body: { symbol: string; name?: string }) {
    return this.prisma.watchlistAsset.create({
      data: { watchlistId, symbol: body.symbol.toUpperCase(), name: body.name },
    });
  }

  removeAsset(assetId: string) {
    return this.prisma.watchlistAsset.delete({ where: { id: assetId } });
  }
}