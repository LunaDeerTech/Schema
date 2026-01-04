// User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  id: string;
  email: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Page Types
export interface Page {
  id: string;
  type: 'library' | 'page';
  title: string;
  content: any; // Tiptap JSON
  description?: string;
  icon?: string;
  coverImage?: string;
  isPublic: boolean;
  publicSlug?: string;
  sortOrder: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;
  userId: string;
  libraryId?: string;
  parentId?: string;
}

// Library is now a special type of Page
export type Library = Page;

export interface CreateLibraryRequest {
  title: string;
  content: any;
  description?: string;
  icon?: string;
}

export interface UpdateLibraryRequest {
  title?: string;
  content?: any;
  description?: string;
  icon?: string;
  isPublic?: boolean;
  sortOrder?: number;
}

export interface CreatePageRequest {
  title: string;
  libraryId: string;
  parentId?: string;
  content?: any;
  icon?: string;
}

export interface UpdatePageRequest {
  title?: string;
  content?: any;
  icon?: string;
  parentId?: string;
  description?: string;
}