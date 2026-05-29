import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ok } from '../../common/api-response';
import { MarketsService } from './markets.service';

@Controller('markets')
@UseGuards(AuthGuard('jwt'))
export class MarketsController {
  constructor(private readonly markets: MarketsService) {}

  @Get('search')
  async search(@Query('q') query = '') {
    return ok(await this.markets.search(query));
  }

  @Get('quotes/:symbol')
  async quote(@Param('symbol') symbol: string) {
    return ok(await this.markets.quote(symbol));
  }

  @Get('candles/:symbol')
  async candles(@Param('symbol') symbol: string) {
    return ok(await this.markets.candles(symbol));
  }

  @Get('movers')
  movers() {
    return ok(this.markets.movers());
  }

  @Get('sectors')
  sectors() {
    return ok(this.markets.sectors());
  }
}