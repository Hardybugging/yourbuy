import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
@UseGuards(AuthGuard('jwt'))
export class WatchlistController {
  constructor(private readonly watchlist: WatchlistService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return ok(await this.watchlist.list(user.id));
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: { name: string }) {
    return ok(await this.watchlist.create(user.id, body.name), 'Watchlist created');
  }

  @Post(':id/assets')
  async add(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: { symbol: string; name?: string }) {
    return ok(await this.watchlist.addAsset(user.id, id, body), 'Asset added');
  }

  @Delete('assets/:assetId')
  async remove(@Param('assetId') assetId: string) {
    return ok(await this.watchlist.removeAsset(assetId), 'Asset removed');
  }
}