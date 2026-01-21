# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Schema** is a personal knowledge management system (single-user, no collaboration) built with TypeScript full-stack. Think Confluence for individuals—structured knowledge management without team complexity.

## Architecture

**Monorepo Structure** (pnpm workspaces):
```
packages/
├── client/    # Vue 3 + Vite + Naive UI frontend
├── server/    # NestJS backend with SQLite (better-sqlite3)
└── shared/    # Shared types (@schema/shared)
```

**Key Design Decision**: Library is a special Page type (`type: 'library'`), not a separate table. Pages reference their library via `libraryId`.

**Data Flow**: Vue components → Pinia stores (`stores/*.ts`) → API layer (`api/*.ts`) → NestJS controllers → Services → `DatabaseService` → SQLite

## Development Commands

```bash
pnpm install                 # Install all dependencies
pnpm dev                     # Start client (5173) + server (3000) concurrently
pnpm dev:server              # Server only
pnpm dev:client              # Client only
pnpm build && pnpm start     # Production: server serves built Vue app on :3000
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
- **User**: id, email, passwordHash, displayName, avatar, settings
- **Page**: id, type, title, content, libraryId, parentId, isPublic, publicSlug, sortOrder, userId
- **PageVersion**: id, content, message, pageId (for version history)
- **PageReference**: sourceId, targetId (for page linking)
- **Tag**: id, name, color
- **PageTag**: pageId, tagId (many-to-many)
- **UploadedImage**: id, filename, url, pageId, libraryId, userId

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

### Pinia Stores
- **user.ts**: Authentication state, token management
- **page.ts**: Page CRUD, tree building, version management
- **library.ts**: Library management
- **tag.ts**: Tag operations
- **public.ts**: Public page access

### Editor (Tiptap)
Custom extensions in `client/src/components/editor/extensions/`:
- `slash-command.ts` - "/" command palette
- `page-reference.ts` - `@` mentions for page linking
- `image-block.ts` - Image uploads via `uploadApi`
- Table support with `@tiptap/extension-table*`

### Router Structure
- `/login`, `/register` - Auth pages (guest only)
- `/home` - Dashboard/home view
- `/library/:id` - Library view (shows page tree)
- `/page/:id` - Page editor view
- `/settings/*` - Settings pages (profile, security, libraries, etc.)
- `/public/pages/:slug`, `/public/libraries/:slug` - Public access routes

## Critical Domain Rules

1. **Single-user model**: All queries MUST filter by `userId` - no multi-tenancy
2. **Content format**: Always Tiptap JSON: `{ type: 'doc', content: [...] }`
3. **Page hierarchy**: `parentId` creates tree within a library; use `libraryId` to scope
4. **Public access**: Set `isPublic=1` + generate `publicSlug` for sharing
5. **Library as Page**: Libraries are Pages with `type='library'` and `libraryId=null`

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
```

### Adding a New API Endpoint
1. Create DTO in `modules/xxx/dto/`
2. Add service method in `modules/xxx/xxx.service.ts`
3. Add controller route in `modules/xxx/xxx.controller.ts`
4. Update `app.module.ts` if adding new module

### Adding a New Frontend Feature
1. Create API function in `src/api/`
2. Create/update Pinia store in `src/stores/`
3. Create component in `src/components/`
4. Add route in `src/router/index.ts`

## Environment Variables

Required in `.env`:
```env
NODE_ENV=development
PORT=3000
DB_PATH=file:./dev.db
JWT_SECRET=your-secret-key
```

## Key Files Reference

- `packages/server/src/database/database.service.ts` - SQLite wrapper
- `packages/server/src/app.module.ts` - NestJS module configuration
- `packages/client/src/api/http.ts` - Axios instance with JWT
- `packages/client/src/stores/` - Pinia state management
- `packages/shared/src/types.ts` - Shared TypeScript interfaces
- `packages/shared/src/constants.ts` - Shared constants and error codes
