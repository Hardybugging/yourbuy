import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OpenRouterProvider } from '../../providers/ai/openrouter.provider';
import { NewsApiProvider } from '../../providers/news/newsapi.provider';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openRouter: OpenRouterProvider,
    private readonly news: NewsApiProvider,
    private readonly portfolio: PortfolioService,
  ) {}

  async insights(userId: string) {
    const overview = await this.portfolio.overview(userId);
    return {
      summary: 'YourBuy Intelligence is tracking portfolio concentration, cash usage, and market movement.',
      riskNotes: overview.holdings.length ? ['Review position sizing before adding concentrated exposure.'] : ['Portfolio is cash-heavy; consider building a diversified watchlist first.'],
      opportunities: ['Use simulated orders to test thesis quality before committing capital.'],
      generatedAt: new Date().toISOString(),
    };
  }

  async assistant(userId: string, message: string, context?: unknown) {
    const fallback = `I can help analyze your portfolio, watchlist, and market context. For: "${message}", start by checking valuation, trend, risk, and position sizing.`;
    const ai = await this.openRouter.complete(`You are YourBuy Intelligence. Give educational, non-promissory market guidance. User asked: ${message}`).catch(() => null);
    const conversation = await this.prisma.aIConversation.create({
      data: {
        userId,
        title: message.slice(0, 80),
        context: context as object,
        messages: {
          create: [
            { role: 'user', content: message },
            { role: 'assistant', content: ai || fallback },
          ],
        },
      },
      include: { messages: true },
    });
    return conversation;
  }

  async newsIntelligence() {
    const articles = await this.news.marketNews();
    return { articles, explanation: 'News is summarized for education only and should be cross-checked before trading.' };
  }
}