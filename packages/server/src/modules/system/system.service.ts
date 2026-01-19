import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { DatabaseService } from '@/database/database.service';
import { UpdateSiteInfoDto } from './dto/update-site-info.dto';
import { SiteInfoResponseDto } from './dto/site-info-response.dto';
import { UpdateSmtpConfigDto, TestSmtpConfigDto } from './dto/smtp-config.dto';

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

  /**
   * Get SMTP configuration
   */
  async getSmtpConfig(): Promise<UpdateSmtpConfigDto> {
    const result = this.database.queryOne(
      'SELECT value FROM SystemConfig WHERE key = ?',
      ['smtpConfig']
    );

    if (result && result.value) {
      try {
        return JSON.parse(result.value);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  /**
   * Update SMTP configuration
   */
  async updateSmtpConfig(config: UpdateSmtpConfigDto): Promise<UpdateSmtpConfigDto> {
    const now = new Date().toISOString();
    const result = this.database.queryOne(
      'SELECT value FROM SystemConfig WHERE key = ?',
      ['smtpConfig']
    );

    let currentConfig = {};
    if (result && result.value) {
      try {
        currentConfig = JSON.parse(result.value);
      } catch (e) {
        // ignore
      }
    }

    const newConfig = { ...currentConfig, ...config };
    const value = JSON.stringify(newConfig);

    if (result) {
      this.database.run(
        'UPDATE SystemConfig SET value = ?, updatedAt = ? WHERE key = ?',
        [value, now, 'smtpConfig']
      );
    } else {
      this.database.run(
        'INSERT INTO SystemConfig (key, value, updatedAt) VALUES (?, ?, ?)',
        ['smtpConfig', value, now]
      );
    }

    return newConfig;
  }

  /**
   * Test SMTP connection
   */
  async testSmtpConnection(config: TestSmtpConfigDto): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure, // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      await transporter.verify();
      
      // If testEmail is provided, send a test email
      if (config.testEmail) {
        await transporter.sendMail({
          from: config.from,
          to: config.testEmail,
          subject: 'SMTP Test Email from Schema',
          html: '<p>This is a test email to verify your SMTP configuration.</p><p>If you received this email, your SMTP settings are working correctly!</p>',
        });
        return { success: true, message: 'Connection successful and test email sent' };
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      throw new BadRequestException(`Connection failed: ${error.message}`);
    }
  }
}