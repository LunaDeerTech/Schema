# Schema - AI Agent Development Guidelines

## Project Overview

Schema is a **personal knowledge management system** (single-user, no collaboration) built with TypeScript full-stack. Think Confluence for individuals—structured knowledge management without team complexity.

## Architecture

**Monorepo Structure** (pnpm workspaces):
```
packages/
├── client/    # Vue 3 + Vite + Naive UI frontend
├── server/    # NestJS backend with SQLite (better-sqlite3)
└── shared/    # Shared types (@schema/shared) - import from here for shared types
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
```

## Frontend Patterns (Vue 3 + Composition API)

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

### Styling
- Naive UI components with iOS-like clean design
- SCSS variables in `src/assets/styles/variables.scss`
- Prefer class bindings over inline styles

## Backend Patterns (NestJS)

### Module Structure
```
modules/page/
├── page.module.ts
├── page.controller.ts      # Routes, uses @CurrentUser('id') for userId
├── page.service.ts         # Business logic, injects DatabaseService
└── dto/                    # class-validator DTOs
```

### Database Access
- Use `DatabaseService` methods: `run()`, `queryOne()`, `queryAll()`, `transaction()`
- Generate IDs: `this.database.queryOne('SELECT hex(randomblob(16)) as id').id`
- **Schema changes**: Add migrations in `packages/server/src/database/migrator.ts`

### Auth Pattern
```typescript
@UseGuards(JwtAuthGuard)  // Required on all controllers except PublicController
@Get()
findAll(@CurrentUser('id') userId: string) {  // Get authenticated user ID
  return this.service.findAll(userId);  // ALWAYS filter by userId
}
```

### API Response Format (handled by `ResponseInterceptor`)
```typescript
// Success: { code: 0, data: T }
// Paginated: { code: 0, data: { items, total, page, pageSize, hasMore } }
// Error codes: 1001=validation, 1002=not found, 2001=unauthorized, 5001=server
```

## Critical Domain Rules

1. **Single-user model**: All queries MUST filter by `userId` - no multi-tenancy
2. **Content format**: Always Tiptap JSON: `{ type: 'doc', content: [...] }`
3. **Page hierarchy**: `parentId` creates tree within a library; use `libraryId` to scope
4. **Public access**: Set `isPublic=1` + generate `publicSlug` for sharing

## Core Data Model (Page table serves both Library and Page)

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

## Editor Integration (Tiptap)

Custom extensions in `client/src/components/editor/extensions/`:
- `slash-command.ts` - "/" command palette
- `page-reference.ts` - `@` mentions for page linking
- `image-block.ts` - Image uploads via `uploadApi`

## Testing & Verification

- Run dev servers in background with logs: `pnpm dev > dev.log 2>&1 &`
- Unit tests in `__tests__` folders alongside source files

## Reference Docs

- [Guidelines.md](../docs/Guidelines.md) - Full API design, DB schema
- [InterfaceDesign.md](../docs/InterfaceDesign.md) - UI layouts, components
- `docs/StepsMilestone*.md` - Implementation guides (follow 1→6 sequentially)
