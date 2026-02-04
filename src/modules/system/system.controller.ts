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
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // Public endpoint - no auth required
  @Get('site-info')
  async getSiteInfo() {
    return this.systemService.getSiteInfo();
  }

  @Put('site-info')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateSiteInfo(@Body() updateSiteInfoDto: UpdateSiteInfoDto) {
    return this.systemService.updateSiteInfo(updateSiteInfoDto);
  }

  @Get('smtp-config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getSmtpConfig() {
    return this.systemService.getSmtpConfig();
  }

  @Put('smtp-config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateSmtpConfig(@Body() updateSmtpConfigDto: UpdateSmtpConfigDto) {
    return this.systemService.updateSmtpConfig(updateSmtpConfigDto);
  }

  @Post('smtp-test')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async testSmtpConnection(@Body() testSmtpConfigDto: TestSmtpConfigDto) {
    return this.systemService.testSmtpConnection(testSmtpConfigDto);
  }
}