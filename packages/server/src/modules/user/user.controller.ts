import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { displayName?: string; avatar?: string }
  ) {
    return this.userService.update(userId, body);
  }
}
