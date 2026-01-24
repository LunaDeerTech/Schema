import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendVerificationDto } from './dto/send-verification.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RegisterWithCodeDto } from './dto/register-with-code.dto';
import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.displayName,
    );
  }

  @Post('send-verification')
  async sendVerification(@Body() sendVerificationDto: SendVerificationDto) {
    return this.authService.sendVerificationCode(sendVerificationDto.email);
  }

  @Post('verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyVerificationCode(
      verifyCodeDto.email,
      verifyCodeDto.code,
    );
  }

  @Post('register-with-code')
  async registerWithCode(@Body() registerWithCodeDto: RegisterWithCodeDto) {
    return this.authService.registerWithCode(
      registerWithCodeDto.email,
      registerWithCodeDto.password,
      registerWithCodeDto.displayName,
      registerWithCodeDto.verificationCode,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('send-reset-password')
  async sendResetPassword(@Body() sendResetPasswordDto: SendResetPasswordDto) {
    return this.authService.sendVerificationCode(sendResetPasswordDto.email, 'reset-password');
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordWithCode(
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
      resetPasswordDto.verificationCode,
    );
  }
}