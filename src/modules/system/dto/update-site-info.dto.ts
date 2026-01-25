import { IsString, IsOptional } from 'class-validator';

export class UpdateSiteInfoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}