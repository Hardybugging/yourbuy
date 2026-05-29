import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return ok(await this.notifications.list(user.id));
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: { title: string; message: string; type?: 'SYSTEM' | 'MARKET' | 'PORTFOLIO' | 'AI'; metadata?: unknown }) {
    return ok(await this.notifications.create(user.id, body), 'Notification created');
  }

  @Patch(':id/read')
  async read(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return ok(await this.notifications.markRead(user.id, id), 'Notification marked read');
  }
}