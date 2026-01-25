import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { UserService } from '../user/user.service';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  controllers: [SystemController],
  providers: [SystemService, UserService, AdminGuard],
  exports: [SystemService],
})
export class SystemModule {}