# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Schema is a personal knowledge management system (Confluence for personal use) with a NestJS backend and Vue 3 frontend.

## Architecture

### Backend (NestJS)

**Core Structure:**
- **Database**: Better-sqlite3 with WAL mode for concurrency
- **Modules**: Each feature is a NestJS module with controller + service pattern
- **Global Components**:
  - `ResponseInterceptor` - Wraps all responses with `{ code: 0, data: ... }`
  - `HttpExceptionFilter` - Standardized error responses with error codes
  - `CurrentUser` decorator - Extracts user from JWT token

**Key Modules:**
- `auth` - JWT authentication, email verification (SMTP), password reset
- `user` - User profile management
- `page` - Core knowledge base pages with versioning, references, and hierarchical structure
- `library` - Page organization (merged into Page table as `type: 'library'`)
- `tag` - Tag management for pages
- `search` - Full-text search functionality
- `public` - Public page sharing via slug
- `upload` - File/image uploads to `./uploads` directory
- `system` - Site info and SMTP configuration management
- `health` - Health check endpoint

**Database Schema:**
- `User` - Users with email, password hash, admin status
- `Page` - Core content with type (page/library), hierarchy (parentId, libraryId), public sharing
- `PageVersion` - Version history for pages
- `PageReference` - Bidirectional references between pages
- `Tag` / `PageTag` - Tag system
- `Task` - Todo items within pages
- `Template` - Page templates
- `SystemConfig` - Key-value config storage
- `UploadedImage` - Uploaded image metadata

**API Response Format:**
```json
{
  "code": 0,  // 0 = success, non-zero = error
  "data": {}  // Response data
}
```

### Frontend (Vue 3 + Vite)

**Core Structure:**
- **State Management**: Pinia stores (`user`, `page`, `library`, etc.)
- **Routing**: Vue Router with auth guards
- **UI Framework**: Naive UI
- **Rich Text Editor**: Tiptap with extensions (tables, task lists, code blocks, mentions)
- **API Client**: Axios with interceptors for JWT auth and 401 handling

**Key Components:**
- `stores/user.ts` - Authentication state, token management
- `api/http.ts` - Axios instance with auth interceptor
- `router/index.ts` - Route definitions with auth guards
- `views/` - Main application views
- `components/` - Reusable UI components

**Authentication Flow:**
1. Login/Register → JWT token stored in localStorage (`schema_token`)
2. Token injected into API requests via Axios interceptor
3. 401 responses trigger logout and redirect to login
4. Router guards check `requiresAuth` / `requiresGuest` meta

## Development Commands

### Backend (Root Directory)

```bash
# Development server with hot reload
pnpm dev

# Build backend
pnpm build

# Run built server
pnpm start

# Lint TypeScript
pnpm lint

# Build client (separate command)
pnpm build:client
```

### Frontend (client/ Directory)

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint TypeScript/Vue
pnpm lint
```

### Database

The database is SQLite (`dev.db` in root). It's automatically initialized on startup:
- Tables created if they don't exist
- Migrations run (see `src/database/migrator.ts`)
- Default config seeded
- Integrity check performed

**Manual Database Operations:**
- View data: Use SQLite browser or CLI
- Reset: Delete `dev.db`, `dev.db-shm`, `dev.db-wal` and restart server
- Backup: Copy the `.db` files

## Configuration

### Environment Variables (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### SMTP Configuration (Runtime)

SMTP settings are stored in database (`SystemConfig` table, key `smtpConfig`):
- Configured via Settings → SMTP Configuration in the UI
- Used for email verification and password reset
- Falls back to console logging in development mode

## Key Development Patterns

### Backend Module Structure
Each module follows this pattern:
```
modules/{feature}/
├── {feature}.module.ts      # Module definition
├── {feature}.controller.ts  # API endpoints
├── {feature}.service.ts     # Business logic
├── dto/                     # Request/response DTOs
└── entities/                # Type definitions
```

### Frontend API Pattern
```typescript
// api/{feature}.ts
export const pageApi = {
  get: (id: string) => api.get<PageResponse>(`/pages/${id}`),
  create: (data: CreatePageRequest) => api.post<PageResponse>('/pages', data),
  // ...
}

// stores/{feature}.ts
export const usePageStore = defineStore('page', () => {
  // State, getters, actions
})
```

### Error Handling
- **Backend**: `HttpExceptionFilter` converts exceptions to standardized response
- **Frontend**: Axios interceptor handles 401 → logout/redirect
- **Error Codes**: See `src/common/filters/http-exception.filter.ts`

### File Uploads
- Uploaded to `./uploads` directory (configurable via `UPLOAD_DIR`)
- Served at `/uploads` prefix
- Metadata stored in `UploadedImage` table
- Files served before frontend assets (priority in `main.ts`)

## Testing

No dedicated test framework configured. Development is done via:
1. Manual testing with `pnpm dev`
2. API testing via browser/Postman
3. Frontend testing via browser

## Common Tasks

### Adding a New Module
1. Create module: `nest g module modules/{name}`
2. Add to `app.module.ts`
3. Define controller/service
4. Add to frontend API and store if needed

### Database Schema Changes
1. Update `src/database/database.service.ts` `initTables()`
2. Add migration in `src/database/migrator.ts`
3. Restart server to apply

### Frontend Component
1. Create in `client/src/components/` or `client/src/views/`
2. Import in router or parent component
3. Use Pinia store for state management

## Important Notes

- **No migrations framework**: Schema changes are applied via `initTables()` on startup
- **Single database file**: SQLite file is in root directory
- **Development mode**: SMTP emails log to console if not configured
- **Static assets**: Uploads have priority over frontend assets
- **SPA routing**: Non-API, non-file routes serve `index.html` for Vue Router
- **Admin users**: Set `isAdmin = 1` in User table manually if needed
