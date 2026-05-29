import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ok } from '../../common/api-response';
import { PrismaService } from '../../database/prisma.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    const users = await this.prisma.user.count();
    const orders = await this.prisma.order.count();
    return ok({ users, orders, status: 'ready' });
  }
}