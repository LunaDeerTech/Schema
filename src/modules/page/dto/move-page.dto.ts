import { IsOptional, IsString, IsNumber, ValidateIf } from 'class-validator';

export class MovePageDto {
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsString()
  newParentId?: string | null;

  @IsOptional()
  @IsString()
  newLibraryId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
