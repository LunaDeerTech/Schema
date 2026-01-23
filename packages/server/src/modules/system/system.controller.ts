import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { AdminGuard } from '@/modules/auth/admin.guard';
import { SystemService } from './system.service';
import { UpdateSiteInfoDto } from './dto/update-site-info.dto';
import { UpdateSmtpConfigDto, TestSmtpConfigDto } from './dto/smtp-config.dto';

@Controller('system')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('site-info')
  async getSiteInfo() {
    return this.systemService.getSiteInfo();
  }

  @Put('site-info')
  async updateSiteInfo(@Body() updateSiteInfoDto: UpdateSiteInfoDto) {
    return this.systemService.updateSiteInfo(updateSiteInfoDto);
  }

  @Get('smtp-config')
  async getSmtpConfig() {
    return this.systemService.getSmtpConfig();
  }

  @Put('smtp-config')
  async updateSmtpConfig(@Body() updateSmtpConfigDto: UpdateSmtpConfigDto) {
    return this.systemService.updateSmtpConfig(updateSmtpConfigDto);
  }

  @Post('smtp-test')
  async testSmtpConnection(@Body() testSmtpConfigDto: TestSmtpConfigDto) {
    return this.systemService.testSmtpConnection(testSmtpConfigDto);
  }
}