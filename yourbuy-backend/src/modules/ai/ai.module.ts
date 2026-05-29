import { Module } from '@nestjs/common';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [PortfolioModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
