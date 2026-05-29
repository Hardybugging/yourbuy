import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    return ok(await this.users.getProfile(user.id));
  }

  @Patch('me')
  async update(@CurrentUser() user: RequestUser, @Body() body: { username?: string; skills?: string[]; settings?: unknown; riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' }) {
    return ok(await this.users.updateProfile(user.id, body), 'Profile updated');
  }
}