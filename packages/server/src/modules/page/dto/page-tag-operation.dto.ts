import { IsString, IsArray } from 'class-validator';

export class PageTagOperationDto {
  @IsString()
  pageId: string;

  @IsString()
  tagId: string;
}

export class PageTagsUpdateDto {
  @IsArray()
  @IsString({ each: true })
  tagIds: string[];
}