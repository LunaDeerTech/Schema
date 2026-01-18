import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateSmtpConfigDto {
  @IsString()
  @IsOptional()
  host?: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  pass?: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsBoolean()
  @IsOptional()
  secure?: boolean;

  @IsString()
  @IsOptional()
  registerSubject?: string;

  @IsString()
  @IsOptional()
  registerTemplate?: string;

  @IsString()
  @IsOptional()
  resetPasswordSubject?: string;

  @IsString()
  @IsOptional()
  resetPasswordTemplate?: string;
}

export class TestSmtpConfigDto {
  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  user: string;

  @IsString()
  pass: string;

  @IsString()
  from: string;

  @IsBoolean()
  secure: boolean;
}
