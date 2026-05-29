import { Injectable } from '@nestjs/common';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly portfolio: PortfolioService) {}

  async portfolioAnalytics(userId: string) {
    const overview = await this.portfolio.overview(userId);
    const allocation = await this.portfolio.allocation(userId);
    return {
      totalValue: overview.totalValue,
      cashWeight: overview.totalValue ? overview.cashBalance / overview.totalValue : 1,
      positions: overview.holdings.length,
      allocation,
    };
  }
}