import { Module } from '@nestjs/common';
import { MarketsModule } from '../markets/markets.module';
import { MarketGateway } from './market.gateway';

@Module({
  imports: [MarketsModule],
  providers: [MarketGateway],
})
export class RealtimeModule {}
