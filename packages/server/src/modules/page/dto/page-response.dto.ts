export class PageResponseDto {
  id: string;
  title: string;
  content: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  isPublic: boolean;
  publicSlug?: string;
  sortOrder: number;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
  userId: string;
  libraryId: string;
  parentId?: string;
  // Additional fields for tree structure
  parent?: PageResponseDto | null;
  children?: PageResponseDto[];
  // Tags associated with the page
  tags?: Array<{
    id: string;
    name: string;
    color?: string;
    createdAt: string;
  }>;
}