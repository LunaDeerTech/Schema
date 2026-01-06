import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { SystemService } from './system.service';
import { UpdateSiteInfoDto } from './dto/update-site-info.dto';

@Controller('system')
@UseGuards(JwtAuthGuard)
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
}