import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateLibraryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  publicSlug?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}