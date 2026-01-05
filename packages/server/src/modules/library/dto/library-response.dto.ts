import { TagResponseDto } from '../../tag/dto/tag-response.dto';

export class LibraryResponseDto {
  id: string;
  type?: string;
  title: string;
  content: any;
  description?: string;
  icon?: string;
  sortOrder: number;
  isPublic: boolean;
  publicSlug?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
  pageCount?: number;
  tags?: TagResponseDto[];
}