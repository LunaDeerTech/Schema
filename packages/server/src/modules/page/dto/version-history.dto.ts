import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  message?: string;
}

export class RestoreVersionDto {
  @IsString()
  versionId: string;
}

export class CleanupVersionsDto {
  @IsEnum(['day', 'week', 'month'])
  period: 'day' | 'week' | 'month';
}

export class UpdatePageSettingsDto {
  @IsOptional()
  @IsNumber()
  versionRetentionLimit?: number;
}
