import { Controller, Patch, Body, UseGuards, Get, Query, Delete, Param, BadRequestException } from '@nestjs/common';
import { UserService, UserListQuery } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { AdminGuard } from '@/modules/auth/admin.guard';
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
    const user = await this.userService.update(userId, body);
    return UserResponseDto.fromUser(user);
  }

  @Get()
  @UseGuards(AdminGuard)
  async listUsers(@Query() query: UserListQuery) {
    const result = await this.userService.list(query);
    return {
      ...result,
      items: result.items.map(UserResponseDto.fromUser)
    };
  }

  @Patch(':id/ban')
  @UseGuards(AdminGuard)
  async toggleBan(
    @CurrentUser('id') currentUserId: string,
    @Param('id') id: string,
    @Body() body: { isBanned: boolean }
  ) {
    if (currentUserId === id) {
      throw new BadRequestException('You cannot ban yourself');
    }
    const user = await this.userService.toggleBan(id, body.isBanned);
    return UserResponseDto.fromUser(user);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteUser(
    @CurrentUser('id') currentUserId: string,
    @Param('id') id: string
  ) {
    if (currentUserId === id) {
      throw new BadRequestException('You cannot delete yourself');
    }
    await this.userService.delete(id);
    return { success: true };
  }
}
