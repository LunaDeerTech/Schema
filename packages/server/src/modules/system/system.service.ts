import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { UpdateSiteInfoDto } from './dto/update-site-info.dto';
import { SiteInfoResponseDto } from './dto/site-info-response.dto';

@Injectable()
export class SystemService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * 获取网站信息
   */
  async getSiteInfo(): Promise<SiteInfoResponseDto> {
    const titleResult = this.database.queryOne(
      'SELECT value, updatedAt FROM SystemConfig WHERE key = ?',
      ['siteTitle']
    );

    const descriptionResult = this.database.queryOne(
      'SELECT value, updatedAt FROM SystemConfig WHERE key = ?',
      ['siteDescription']
    );

    const title = titleResult ? titleResult.value : 'Schema';
    const description = descriptionResult ? descriptionResult.value : 'Personal Knowledge Management System';
    const updatedAt = titleResult?.updatedAt || descriptionResult?.updatedAt || new Date().toISOString();

    return {
      title,
      description,
      updatedAt
    };
  }

  /**
   * 更新网站信息
   */
  async updateSiteInfo(updateSiteInfoDto: UpdateSiteInfoDto): Promise<SiteInfoResponseDto> {
    const now = new Date().toISOString();

    if (updateSiteInfoDto.title !== undefined) {
      const existing = this.database.queryOne(
        'SELECT key FROM SystemConfig WHERE key = ?',
        ['siteTitle']
      );

      if (existing) {
        this.database.run(
          'UPDATE SystemConfig SET value = ?, updatedAt = ? WHERE key = ?',
          [updateSiteInfoDto.title, now, 'siteTitle']
        );
      } else {
        this.database.run(
          'INSERT INTO SystemConfig (key, value, updatedAt) VALUES (?, ?, ?)',
          ['siteTitle', updateSiteInfoDto.title, now]
        );
      }
    }

    if (updateSiteInfoDto.description !== undefined) {
      const existing = this.database.queryOne(
        'SELECT key FROM SystemConfig WHERE key = ?',
        ['siteDescription']
      );

      if (existing) {
        this.database.run(
          'UPDATE SystemConfig SET value = ?, updatedAt = ? WHERE key = ?',
          [updateSiteInfoDto.description, now, 'siteDescription']
        );
      } else {
        this.database.run(
          'INSERT INTO SystemConfig (key, value, updatedAt) VALUES (?, ?, ?)',
          ['siteDescription', updateSiteInfoDto.description, now]
        );
      }
    }

    return this.getSiteInfo();
  }
}