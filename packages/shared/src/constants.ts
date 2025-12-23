// API Constants
export const API_PREFIX = '/api/v1';
export const API_TIMEOUT = 30000;

// Auth Constants
export const JWT_EXPIRES_IN = '7d';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Error Codes
export const ERROR_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1001,
  NOT_FOUND: 1002,
  ALREADY_EXISTS: 1003,
  UNAUTHORIZED: 2001,
  TOKEN_EXPIRED: 2002,
  FORBIDDEN: 2003,
  SERVER_ERROR: 5001,
  DATABASE_ERROR: 5002
} as const;

// Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Content Types
export const CONTENT_TYPES = {
  DOC: 'doc',
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  BULLET_LIST: 'bulletList',
  ORDERED_LIST: 'orderedList',
  LIST_ITEM: 'listItem',
  CODE_BLOCK: 'codeBlock',
  QUOTE: 'blockquote',
  TASK_LIST: 'taskList',
  TASK_ITEM: 'taskItem',
  LINK: 'link',
  IMAGE: 'image'
} as const;

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

// Template Categories
export const TEMPLATE_CATEGORIES = [
  'note',
  'meeting',
  'research',
  'project',
  'personal'
] as const;

// Public Access
export const PUBLIC_ACCESS = {
  PRIVATE: 'private',
  PUBLIC: 'public'
} as const;

// File Upload Limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Search Constants
export const SEARCH_LIMIT = 50;
export const SEARCH_HIGHLIGHT_TAG = '<mark>';

// Rate Limiting
export const RATE_LIMIT = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 }
};