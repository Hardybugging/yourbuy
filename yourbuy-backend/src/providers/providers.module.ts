import { Global, Module } from '@nestjs/common';
import { FinnhubProvider } from './market/finnhub.provider';
import { TwelveDataProvider } from './market/twelvedata.provider';
import { OpenRouterProvider } from './ai/openrouter.provider';
import { GroqProvider } from './ai/groq.provider';
import { NewsApiProvider } from './news/newsapi.provider';

@Global()
@Module({
  providers: [FinnhubProvider, TwelveDataProvider, OpenRouterProvider, GroqProvider, NewsApiProvider],
  exports: [FinnhubProvider, TwelveDataProvider, OpenRouterProvider, GroqProvider, NewsApiProvider],
})
export class ProvidersModule {}
