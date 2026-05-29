import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderSide, OrderType } from '@prisma/client';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('execute')
  async execute(@CurrentUser() user: RequestUser, @Body() body: { symbol: string; quantity: number; side?: OrderSide; type?: OrderType; limitPrice?: number }) {
    return ok(await this.orders.execute(user.id, body), 'Order executed');
  }

  @Get('history')
  async history(@CurrentUser() user: RequestUser) {
    return ok(await this.orders.history(user.id));
  }
}