import { IsString, IsOptional, IsUUID, IsBoolean, IsObject } from 'class-validator';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsUUID()
  libraryId: string;

  @IsOptional()
  @IsUUID()
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