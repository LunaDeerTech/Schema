import { IsString } from 'class-validator';

export class PageTagDto {
  @IsString()
  pageId: string;

  @IsString()
  tagId: string;
}