import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('insights')
  async insights(@CurrentUser() user: RequestUser) {
    return ok(await this.ai.insights(user.id));
  }

  @Get('news')
  async news() {
    return ok(await this.ai.newsIntelligence());
  }

  @Post('assistant')
  async assistant(@CurrentUser() user: RequestUser, @Body() body: { message: string; context?: unknown }) {
    return ok(await this.ai.assistant(user.id, body.message, body.context));
  }
}