# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Schema** is a personal knowledge management system (single-user, no collaboration) built with TypeScript full-stack. Think Confluence for individuals—structured knowledge management without team complexity.

## Architecture

**Monorepo Structure** (pnpm workspaces):
```
packages/
├── client/    # Vue 3 + Vite + Naive UI frontend (port 5173)
├── server/    # NestJS backend with SQLite (port 3000)
└── shared/    # Shared types (@schema/shared)
```

**Key Design Decision**: Library is a special Page type (`type: 'library'`), not a separate table. Pages reference their library via `libraryId`.

**Data Flow**: Vue components → Pinia stores (`stores/*.ts`) → API layer (`api/*.ts`) → NestJS controllers → Services → `DatabaseService` → SQLite

## Development Commands

```bash
# Install dependencies (run once)
pnpm install

# Development (concurrently starts both client and server)
pnpm dev                     # Client: 5173, Server: 3000

# Individual package development
pnpm dev:server              # Server only (port 3000)
pnpm dev:client              # Client only (port 5173)

# Production build and serve
pnpm build                   # Build both client and server
pnpm start                   # Serve production build (port 3000)

# Linting
pnpm lint                    # Run linting across all packages
```

## Core Data Model

**Page table** serves both Library and Page:
```typescript
interface Page {
  type: 'library' | 'page';  // Library is a special page type
  libraryId?: string;        // null for libraries, required for pages
  parentId?: string;         // For nested page hierarchy
  content: TiptapJSON;       // { type: 'doc', content: [...] }
  isPublic: boolean;
  publicSlug?: string;       // For public sharing URLs
}
```

## Backend (NestJS + SQLite)

### Module Structure
```
modules/
├── auth/          # JWT authentication (login/register)
├── user/          # User profile management
├── library/       # Library CRUD (special page type)
├── page/          # Page CRUD with tree structure
├── tag/           # Tag management with PageTag associations
├── search/        # Full-text search
├── public/        # Public access routes
├── upload/        # Image upload handling
└── system/        # System configuration (SMTP, site info)
```

### Database Access Pattern
- Use `DatabaseService` methods: `run()`, `queryOne()`, `queryAll()`, `transaction()`
- Generate IDs: `this.database.queryOne('SELECT hex(randomblob(16)) as id').id`
- **Schema changes**: Add migrations in `packages/server/src/database/migrator.ts`

### Auth Pattern
```typescript
@UseGuards(JwtAuthGuard)  // Required on all controllers except PublicController
@Get()
findAll(@CurrentUser('id') userId: string) {
  return this.service.findAll(userId);  // ALWAYS filter by userId
}
```

### API Response Format (handled by `ResponseInterceptor`)
```typescript
// Success: { code: 0, data: T }
// Paginated: { code: 0, data: { items, total, page, pageSize, hasMore } }
// Error codes: 1001=validation, 1002=not found, 2001=unauthorized, 5001=server
```

### Database Schema (Key Tables)
- **User**: id, email, passwordHash, displayName, avatar, settings, isAdmin, isBanned
- **Page**: id, type, title, content, libraryId, parentId, isPublic, publicSlug, sortOrder, userId
- **PageVersion**: id, content, message, pageId (for version history)
- **PageReference**: sourceId, targetId (for page linking)
- **Tag**: id, name, color
- **PageTag**: pageId, tagId (many-to-many)
- **Task**: id, content, isCompleted, dueDate, pageId (task management)
- **Template**: id, title, description, content, category, isBuiltIn, userId
- **SystemConfig**: key, value (SMTP, site info)
- **UploadedImage**: id, filename, url, pageId, libraryId, userId

### Database Service Methods
```typescript
// Query methods
query(sql: string, params?: any[]): any[]          // Get all results
queryAll(sql: string, params?: any[]): any[]       // Alias for query()
queryOne(sql: string, params?: any[]): any         // Get single result
run(sql: string, params?: any[]): RunResult        // Insert/Update/Delete

// Transaction support
transaction<T>(callback: (db: Database) => T): T   // Wrap operations in transaction
```

## Frontend (Vue 3 + Tiptap)

### Component Structure
```vue
<script setup lang="ts">
// Order: imports → props/emits → state (ref/reactive) → computed → methods → lifecycle
import { pageApi } from '@/api/page'  // NEVER call APIs directly in components
import { usePageStore } from '@/stores/page'
</script>
```

### API Layer (`src/api/*.ts`)
- All HTTP calls go through `api/http.ts` (axios with JWT injection)
- Components use Pinia stores which call API functions
- Example: `pageApi.getPages()` → store action → component
- **Never** call APIs directly from components - always use stores

### Pinia Stores
- **user.ts**: Authentication state, token management, profile fetching
- **page.ts**: Page CRUD, tree building, version management
- **library.ts**: Library management
- **tag.ts**: Tag operations
- **public.ts**: Public page access
- **system.ts**: System configuration
- **admin.ts**: Admin user management

### Editor (Tiptap)
Custom extensions in `client/src/components/editor/extensions/`:
- `slash-command.ts` - "/" command palette
- `page-reference.ts` - `@` mentions for page linking
- `image-block.ts` - Image uploads via `uploadApi`
- Table support with `@tiptap/extension-table*`

### Router Structure
- `/login`, `/register` - Auth pages (guest only)
- `/forget-password` - Password reset (guest only)
- `/home` - Dashboard/home view
- `/library/:id` - Library view (shows page tree)
- `/page/:id` - Page editor view
- `/settings/*` - Settings pages (profile, security, libraries, pages, assets, templates, site-info, smtp, users)
- `/public/pages/:slug`, `/public/libraries/:slug` - Public access routes

### HTTP Client (`api/http.ts`)
- Axios instance with automatic JWT token injection
- Request interceptor adds `Authorization: Bearer <token>` header
- Response interceptor handles 401 errors (logout + redirect to login)
- Base URL: `/api/v1`
- Timeout: 10 seconds

## Critical Domain Rules

1. **Single-user model**: All queries MUST filter by `userId` - no multi-tenancy
2. **Content format**: Always Tiptap JSON: `{ type: 'doc', content: [...] }`
3. **Page hierarchy**: `parentId` creates tree within a library; use `libraryId` to scope
4. **Public access**: Set `isPublic=1` + generate `publicSlug` for sharing
5. **Library as Page**: Libraries are Pages with `type='library'` and `libraryId=null`
6. **Admin users**: Users have `isAdmin` flag for admin features (user management, system config)

## Common Development Tasks

### Running a Single Test
```bash
# Server tests (if using Jest)
cd packages/server && npm test -- --testPathPattern=page.service

# Client tests (if using Vitest)
cd packages/client && npm test -- --run page.spec
```

### Database Operations
```bash
# Initialize database
cd packages/server && npm run db:init

# Run migrations
cd packages/server && npm run db:migrate

# Test database restructure
cd packages/server && npm run db:test-restructure
```

### Adding a New API Endpoint
1. Create DTO in `modules/xxx/dto/` (e.g., `create-xxx.dto.ts`)
2. Add service method in `modules/xxx/xxx.service.ts`
3. Add controller route in `modules/xxx/xxx.controller.ts`
4. Update `app.module.ts` if adding new module
5. Add corresponding API function in `packages/client/src/api/xxx.ts`
6. Update Pinia store in `packages/client/src/stores/xxx.ts`

### Adding a New Frontend Feature
1. Create API function in `src/api/`
2. Create/update Pinia store in `src/stores/`
3. Create component in `src/components/`
4. Add route in `src/router/index.ts`
5. Add view in `src/views/` if needed

### Adding a New Tiptap Extension
1. Create extension in `packages/client/src/components/editor/extensions/`
2. Import and add to editor configuration in `packages/client/src/components/editor/Editor.vue`

## Environment Variables

Required in `.env`:
```env
NODE_ENV=development
PORT=3000
DB_PATH=file:./dev.db
JWT_SECRET=your-secret-key

# Optional: SMTP configuration for email verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@schema.com
```

## Key Files Reference

### Backend
- `packages/server/src/database/database.service.ts` - SQLite wrapper with query methods
- `packages/server/src/database/migrator.ts` - Database migrations
- `packages/server/src/app.module.ts` - NestJS module configuration
- `packages/server/src/main.ts` - Server startup and middleware configuration
- `packages/server/src/common/interceptors/response.interceptor.ts` - API response format
- `packages/server/src/common/filters/http-exception.filter.ts` - Error handling

### Frontend
- `packages/client/src/api/http.ts` - Axios instance with JWT injection
- `packages/client/src/stores/` - Pinia state management
- `packages/client/src/router/index.ts` - Vue Router configuration
- `packages/client/src/constants.ts` - Application constants
- `packages/client/src/main.ts` - Vue app entry point

### Shared
- `packages/shared/src/types.ts` - Shared TypeScript interfaces
- `packages/shared/src/constants.ts` - Shared constants and error codes

## Development Workflow

### Starting Development
1. Run `pnpm install` to install dependencies
2. Run `pnpm dev` to start both client and server
3. Client will be available at `http://localhost:5173`
4. Server will be available at `http://localhost:3000`
5. API requests from client are proxied to server

### Production Build
1. Run `pnpm build` to build both client and server
2. Run `pnpm start` to serve the production build
3. Server serves the built Vue app on port 3000
4. All API requests go to `/api/v1` prefix

### Debugging
- Server logs show database path and connection status
- Check browser console for frontend errors
- Use `console.log` in services for backend debugging
- Check network tab in browser for API request/response details

## Important Notes

- The project uses **better-sqlite3** for database (no external database required)
- JWT tokens are stored in localStorage (`schema_token`)
- User data is stored in localStorage (`schema_user`)
- File uploads are stored in `uploads/` directory (created automatically)
- Images in pages are uploaded via the upload API and stored in the database
- Page content is stored as Tiptap JSON format
- Libraries are just pages with `type='library'` and `libraryId=null`
- All data is scoped to the current user (single-user model)
