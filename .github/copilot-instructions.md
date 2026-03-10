# Schema — AI Coding Agent Instructions

## Project Overview

**Schema** is a personal knowledge management system (Confluence for personal use).

| Layer | Stack |
|-------|-------|
| Backend | NestJS 10 + better-sqlite3 (WAL mode) — root `/` |
| Frontend | Vue 3.4 + Vite + Pinia + Naive UI 2.43 — `client/` |
| Editor | Tiptap 3.14 with custom extensions |
| Auth | JWT (passport-jwt) — token in localStorage `schema_token` |

### Data Flow
```
Login → JWT → localStorage → Axios interceptor → Authorization header
  → NestJS JwtAuthGuard → CurrentUser decorator → Service → DatabaseService
  → ResponseInterceptor wraps { code: 0, data } → Pinia store → UI
```

## Critical Developer Workflows

### Development Commands

#### Backend (Root Directory)
```bash
pnpm dev           # Start with hot reload (watches src/)
pnpm build         # Compile to dist/
pnpm start         # Run compiled (node dist/main.js)
pnpm lint          # ESLint on all .ts files
pnpm build:client  # Build frontend via monorepo filter
pnpm pack          # Custom packaging script (pack.js)
```

#### Frontend (`client/` Directory)
```bash
pnpm dev           # Vite dev server on :5173, proxies /api + /uploads → :3003
pnpm build         # TypeScript check + Vite production build → dist/
pnpm preview       # Preview production build
pnpm lint          # ESLint on .ts/.vue files
```

**No test framework** — verify manually via browser/Postman.

### Database

SQLite file `dev.db` in project root. Auto-initializes on startup:
1. `initTables()` creates tables if missing (10 tables, 16 indexes)
2. `migrator.ts` runs pending migrations (transaction-wrapped, tracked in `_migrations` table)
3. Default config seeded, integrity check performed

**Schema Changes:**
1. For new tables/columns on fresh DB: update `initTables()` in `src/database/database.service.ts`
2. For existing DB compatibility: add migration in `src/database/migrator.ts`
3. Restart server — both run automatically

**Migration Pattern:**
```typescript
// src/database/migrator.ts — add to migrations array
{
  name: '001_add_column',
  up: (dbService: DatabaseService) => {
    const columns = dbService.getTableColumns('TableName');
    if (!columns.some(col => col.name === 'newCol')) {
      dbService.run("ALTER TABLE TableName ADD COLUMN newCol TEXT");
    }
  }
}
```

**Reset:** Delete `dev.db`, `dev.db-shm`, `dev.db-wal` and restart.

## Project-Specific Conventions

### Backend Module Pattern

```
src/modules/{feature}/
├── {feature}.module.ts      # @Module({ imports: [DatabaseModule], ... })
├── {feature}.controller.ts  # @Controller('{feature}s') @UseGuards(JwtAuthGuard)
├── {feature}.service.ts     # Business logic, throws NestJS exceptions
├── dto/                     # class-validator decorated DTOs
└── entities/                # TypeScript interfaces
```

**Controller conventions:**
- `@UseGuards(JwtAuthGuard)` on the class (all routes protected)
- `@CurrentUser('id')` to get user ID, `@CurrentUser()` for full user object
- DTOs validated automatically (global ValidationPipe with `whitelist: true`, `forbidNonWhitelisted: true`)

**DTO conventions (class-validator):**
```typescript
export class CreatePageDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isPublic?: boolean;
  @IsOptional() @IsObject() content?: Record<string, unknown>; // Tiptap JSON
}
```

**Service conventions — error handling:**
```typescript
throw new NotFoundException('Library not found');
throw new ConflictException('User with this email already exists');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Not authorized');
```

**Database query methods:**
```typescript
this.database.queryOne('SELECT * FROM Page WHERE id = ?', [id]);    // Single row or null
this.database.query('SELECT * FROM Page WHERE userId = ?', [userId]); // Array
this.database.run('INSERT INTO Page (...) VALUES (...)', [values]);   // Insert/Update/Delete
this.database.transaction(() => { /* multiple operations */ });       // Transaction
```

### API Response Format & Error Codes

**Success** (via `ResponseInterceptor`):
```json
{ "code": 0, "data": { ... } }
```

**Errors** (via `HttpExceptionFilter`):

| HTTP Status | Error Code | Meaning |
|-------------|-----------|---------|
| 400 | 1001 | Validation error |
| 404 | 1002 | Not found |
| 409 | 1003 | Conflict |
| 401 | 2001 | Unauthorized |
| 403 | 2003 | Forbidden |
| 500 | 5001 | Internal server error |

### Frontend Patterns

**API layer** (`client/src/api/`):
```typescript
// http.ts — Axios instance, baseURL '/api/v1', timeout 10s
// Interceptor adds Bearer token from localStorage 'schema_token'
// 401 on non-public routes → logout + redirect to /login

// api/{feature}.ts — method objects
export const pageApi = {
  getPages: (params?) => api.get<ApiResponse<PaginatedResponse<Page>>>('/pages', { params }),
  getPage: (id: string) => api.get<ApiResponse<Page>>(`/pages/${id}`),
  createPage: (data) => api.post<ApiResponse<Page>>('/pages', data),
}
```

**Pinia stores** (Composition API style):
```typescript
export const usePageStore = defineStore('page', () => {
  const pages = ref<Page[]>([])
  const loading = ref(false)

  const fetchPages = async (libraryId?: string) => {
    loading.value = true
    try {
      const response = await pageApi.getPages({ libraryId })
      if (response.code === 0) pages.value = response.data.items
    } finally { loading.value = false }
  }

  return { pages, loading, fetchPages }
})
```

**Stores available:** `user`, `page`, `library`, `admin`, `system`, `public`

**Shared types** in `client/src/types/index.ts`:
- `ApiResponse<T>`, `PaginatedResponse<T>`, `User`, `Page`, `Library`, `PageVersion`, `Tag`, `Task`, `SearchParams`

**Router guards:** `requiresAuth` and `requiresGuest` meta flags; public routes (`/public/*`) skip auth.

### Rich Text Editor (Tiptap)

Custom extensions in `client/src/components/editor/extensions/`:
- `slash-command.ts` — `/` menu (headings, lists, tables, code, admonitions, images, references)
- `admonition.ts` — Callout blocks (info, warning, success, danger)
- `image-block.ts` — Custom image handling with upload
- `page-reference.ts` — Bidirectional page linking

**Editor events:** `open-image-uploader`, `open-markdown-importer`

### File Uploads

- Directory: `./uploads` (env `UPLOAD_DIR`)
- Served at `/uploads` prefix, **priority over frontend assets**
- Metadata in `UploadedImage` table

## Server Bootstrap Sequence (`src/main.ts`)

1. Create NestJS app (Express)
2. Body parser limit: 50MB
3. CORS enabled
4. API prefix: `/api/v1`
5. Static files: `/uploads` first, then frontend build
6. Global: ValidationPipe → HttpExceptionFilter → ResponseInterceptor
7. SPA fallback: non-API routes without file extensions → `index.html`
8. Listen on `PORT` (default 3000)

## Environment Variables

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## Key Architecture Decisions

1. **Merged Library/Page** — Libraries stored in Page table (`type: 'library'`)
2. **Migration via migrator.ts** — Transaction-wrapped, idempotent, tracked in `_migrations`
3. **JWT in localStorage** — Simple; XSS protection required
4. **Single SQLite file** — No external DB server; WAL mode for concurrent reads
5. **NestJS serves SPA** — API + frontend from one process
6. **Custom Tiptap extensions** — Admonitions, page references, slash commands

## Common Pitfalls

1. **Page tree rebuilding** — After any page mutation in store, call `buildPageTree(pages.value)` to rebuild hierarchy
2. **Public route exception** — `/public/*` and `/system/site-info` bypass 401 interceptor; don't add auth checks there
3. **Home page hides sidebar** — Route name `'Home'` triggers sidebar-less layout
4. **API response unwrapping** — `api.get()` returns the `ApiResponse` envelope (Axios `.data` already unwrapped); check `code === 0`
5. **Responsive breakpoint** — Desktop ≥1024px (`breakpointsTailwind.lg`); sidebar state: `collapsed` on desktop, `mobileSidebarOpen` on mobile
6. **Settings placeholders** — Many settings routes render `SettingsPlaceholder.vue`; only profile, assets, site-info, SMTP, users are implemented
7. **SMTP fallback** — If no SMTP configured, emails log to console (dev mode)
8. **Body parser limit** — 50MB for large page content; adjust in `src/main.ts` if needed

## Quick Reference

### Adding a New Backend Module
1. Create files in `src/modules/{name}/` (module, controller, service, dto/)
2. Import in `src/app.module.ts`
3. Add `@UseGuards(JwtAuthGuard)` to controller
4. Use `@CurrentUser('id')` for user context
5. Inject `DatabaseService` for queries

### Adding a New Frontend Feature
1. Add API methods in `client/src/api/{feature}.ts`
2. Create Pinia store in `client/src/stores/{feature}.ts`
3. Add types in `client/src/types/index.ts`
4. Create views/components in `client/src/views/` or `client/src/components/`
5. Add routes in `client/src/router/index.ts`

### Key Files

| Purpose | File |
|---------|------|
| Server setup | `src/main.ts` |
| DB schema & queries | `src/database/database.service.ts` |
| DB migrations | `src/database/migrator.ts` |
| Response format | `src/common/interceptors/response.interceptor.ts` |
| Error handling | `src/common/filters/http-exception.filter.ts` |
| Auth guard | `src/modules/auth/jwt-auth.guard.ts` |
| Axios + interceptors | `client/src/api/http.ts` |
| Route definitions | `client/src/router/index.ts` |
| Auth state | `client/src/stores/user.ts` |
| Rich text editor | `client/src/components/editor/TiptapEditor.vue` |
| Editor extensions | `client/src/components/editor/extensions/` |
| Shared types | `client/src/types/index.ts` |
| Vite config + proxy | `client/vite.config.ts` |

### Verification Checklist

After changes, verify:
- [ ] `pnpm dev` starts backend without errors
- [ ] `cd client && pnpm build` succeeds
- [ ] `pnpm lint` (root) and `cd client && pnpm lint` pass
- [ ] Affected API endpoints respond correctly
- [ ] Auth flow works (login/logout)
- [ ] UI renders correctly in browser
