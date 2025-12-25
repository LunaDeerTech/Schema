export class LibraryResponseDto {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isPublic: boolean;
  publicSlug?: string;
  metadata: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}