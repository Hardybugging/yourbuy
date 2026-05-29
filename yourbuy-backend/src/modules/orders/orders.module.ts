import { Module } from '@nestjs/common';
import { MarketsModule } from '../markets/markets.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [MarketsModule, PortfolioModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
