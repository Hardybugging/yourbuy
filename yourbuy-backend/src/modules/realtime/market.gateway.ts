import { Logger } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MarketsService } from '../markets/markets.service';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MarketGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MarketGateway.name);

  constructor(private readonly markets: MarketsService) {}

  @SubscribeMessage('market:subscribe')
  async subscribe(@MessageBody() body: { symbol: string }) {
    const quote = await this.markets.quote(body.symbol);
    this.logger.debug(`Subscribed to ${body.symbol}`);
    return { event: 'market:quote', data: quote };
  }
}