import { IsEmail, IsString, MinLength, IsOptional, Length } from 'class-validator';

export class RegisterWithCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsString()
  @Length(6, 6)
  verificationCode: string;
}
