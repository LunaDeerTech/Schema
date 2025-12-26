import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  libraryId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}