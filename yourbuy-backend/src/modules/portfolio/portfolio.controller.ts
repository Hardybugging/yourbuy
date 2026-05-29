import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
@UseGuards(AuthGuard('jwt'))
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get('overview')
  async overview(@CurrentUser() user: RequestUser) {
    return ok(await this.portfolio.overview(user.id));
  }

  @Get('holdings')
  async holdings(@CurrentUser() user: RequestUser) {
    return ok((await this.portfolio.overview(user.id)).holdings);
  }

  @Get('performance')
  async performance(@CurrentUser() user: RequestUser) {
    return ok(await this.portfolio.performance(user.id));
  }

  @Get('allocation')
  async allocation(@CurrentUser() user: RequestUser) {
    return ok(await this.portfolio.allocation(user.id));
  }
}