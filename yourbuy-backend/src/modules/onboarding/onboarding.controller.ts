import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { UsersService } from '../users/users.service';

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private readonly users: UsersService) {}

  @Post('complete')
  async complete(@CurrentUser() user: RequestUser, @Body() body: { skills?: string[]; riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; settings?: unknown }) {
    return ok(await this.users.updateProfile(user.id, body), 'Onboarding completed');
  }
}