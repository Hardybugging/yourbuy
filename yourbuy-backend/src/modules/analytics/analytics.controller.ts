import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('portfolio')
  async portfolio(@CurrentUser() user: RequestUser) {
    return ok(await this.analytics.portfolioAnalytics(user.id));
  }
}