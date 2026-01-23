import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SystemService } from '../system/system.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  // 验证码存储：email -> { code, expiresAt }
  private verificationCodes: Map<string, { code: string; expiresAt: number }> = new Map();
  private readonly CODE_EXPIRY_MS = 10 * 60 * 1000; // 10分钟

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly systemService: SystemService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user data without password
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    };
  }

  async register(email: string, password: string, displayName?: string) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = await this.userService.create({
      email,
      password,
      displayName,
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    };
  }

  async validateUserById(userId: string) {
    return this.userService.findById(userId);
  }

  /**
   * 发送邮箱验证码
   */
  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    // 检查用户是否已存在
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('该邮箱已注册');
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + this.CODE_EXPIRY_MS;

    // 存储验证码
    this.verificationCodes.set(email, { code, expiresAt });

    // 获取SMTP配置
    const smtpConfig = await this.systemService.getSmtpConfig();

    // 如果没有配置SMTP，返回成功但不实际发送邮件（用于开发测试）
    if (!smtpConfig.host || !smtpConfig.port) {
      console.log(`[开发模式] 验证码: ${code} (10分钟内有效)`);
      return { success: true, message: '验证码已生成（开发模式）' };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });

      // 获取邮件主题和模板，如果没有配置则使用默认值
      const subject = smtpConfig.registerSubject || 'Schema - 邮箱验证码';
      const template = smtpConfig.registerTemplate || this.getDefaultRegisterTemplate();

      // 替换模板中的占位符
      const html = template.replace(/{{code}}/g, code);

      await transporter.sendMail({
        from: smtpConfig.from,
        to: email,
        subject: subject,
        html: html,
      });

      return { success: true, message: '验证码已发送' };
    } catch (error) {
      throw new BadRequestException(`邮件发送失败: ${error.message}`);
    }
  }

  /**
   * 获取默认的注册邮件模板
   */
  private getDefaultRegisterTemplate(): string {
    return `
      Your verification code is: {{code}}
    `;
  }

  /**
   * 验证邮箱验证码
   */
  async verifyVerificationCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const stored = this.verificationCodes.get(email);

    if (!stored) {
      throw new BadRequestException('验证码已过期或未发送');
    }

    if (stored.expiresAt < Date.now()) {
      this.verificationCodes.delete(email);
      throw new BadRequestException('验证码已过期');
    }

    if (stored.code !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 验证成功后删除验证码
    this.verificationCodes.delete(email);

    return { success: true, message: '验证码验证成功' };
  }

  /**
   * 使用验证码注册
   */
  async registerWithCode(email: string, password: string, displayName?: string, verificationCode?: string) {
    // 检查用户是否已存在
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('该邮箱已注册');
    }

    // 创建新用户
    const user = await this.userService.create({
      email,
      password,
      displayName,
    });

    // 生成JWT token
    const payload = {
      sub: user.id,
      email: user.email
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    };
  }
}