# Schema - AI Coding Agent Instructions

## Project Overview

**Schema** is a personal knowledge management system (Confluence for personal use) built with:
- **Backend**: NestJS + SQLite (better-sqlite3)
- **Frontend**: Vue 3 + Vite + Pinia + Naive UI
- **Rich Text Editor**: Tiptap with custom extensions

## Architecture Overview

### Backend Structure (Root `/`)
- **NestJS Modules** in `src/modules/` following controller/service pattern
- **SQLite Database** (`dev.db` in root) with WAL mode for concurrency
- **No migration framework**: Schema changes via `initTables()` in `database.service.ts`
- **Global Components**:
  - `ResponseInterceptor`: Wraps all responses with `{ code: 0, data: ... }`
  - `HttpExceptionFilter`: Standardized error responses
  - `CurrentUser` decorator: Extracts user from JWT token

### Frontend Structure (`client/`)
- **State Management**: Pinia stores (`user`, `page`, `library`, etc.)
- **Routing**: Vue Router with auth guards (`requiresAuth` / `requiresGuest`)
- **API Client**: Axios with JWT interceptor (token stored in localStorage as `schema_token`)
- **Rich Editor**: Tiptap with custom extensions (tables, task lists, code blocks, admonitions, page references)

### Key Data Flow
```
User Login → JWT Token → localStorage (schema_token)
           ↓
    API Request → Axios Interceptor adds Authorization header
           ↓
    NestJS → JwtAuthGuard validates token → CurrentUser extracts user ID
           ↓
    Database Query → Service Layer → Controller → ResponseInterceptor
           ↓
    Frontend → Pinia Store Update → UI Update
```

## Critical Developer Workflows

### Development Commands

#### Backend (Root Directory)
```bash
# Start backend with hot reload
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

#### Frontend (`client/` Directory)
```bash
# Start frontend dev server (proxies to backend)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint TypeScript/Vue
pnpm lint
```

### Database Management

**Important**: The database is SQLite (`dev.db` in root). It auto-initializes on startup:
- Tables created if they don't exist
- Migrations run (see `src/database/migrator.ts`)
- Default config seeded
- Integrity check performed

**Manual Operations:**
- **Reset database**: Delete `dev.db`, `dev.db-shm`, `dev.db-wal` and restart server
- **View data**: Use SQLite browser or CLI
- **Backup**: Copy the `.db` files

**Schema Changes:**
1. Update `src/database/database.service.ts` `initTables()`
2. Add migration in `src/database/migrator.ts` (if needed)
3. Restart server to apply

### Testing
No dedicated test framework. Development is manual:
1. Run `pnpm dev` for backend
2. Run `pnpm dev` in `client/` for frontend
3. Test via browser/Postman
4. Check database directly with SQLite

## Project-Specific Conventions

### Backend Module Pattern
Each module follows this structure:
```
modules/{feature}/
├── {feature}.module.ts      # Module definition
├── {feature}.controller.ts  # API endpoints (with @UseGuards(JwtAuthGuard))
├── {feature}.service.ts     # Business logic
├── dto/                     # Request/response DTOs with validation
└── entities/                # Type definitions
```

**Example: Page Module**
- Controller: `POST /pages`, `GET /pages`, `PUT /pages/:id`
- Service: Handles hierarchy (parentId, libraryId), versioning, references
- Database: `Page` table stores both libraries and pages (`type: 'library' | 'page'`)

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

### Authentication Flow
1. Login/Register → JWT token stored in localStorage (`schema_token`)
2. Token injected into API requests via Axios interceptor
3. 401 responses trigger logout and redirect to login
4. Router guards check `requiresAuth` / `requiresGuest` meta

### Rich Text Editor (Tiptap)
Custom extensions in `client/src/components/editor/extensions/`:
- **Admonition**: Info/Warning/Success/Danger callout blocks
- **Slash Command**: `/` menu for inserting headings, lists, tables, code blocks, etc.
- **Image Block**: Custom image handling with upload
- **Page Reference**: Link to other pages
- **Table**: Full table support

**Editor Events:**
- `open-image-uploader`: Opens image uploader popover
- `open-markdown-importer`: Opens markdown importer

### File Uploads
- **Location**: `./uploads` directory (configurable via `UPLOAD_DIR`)
- **Served at**: `/uploads` prefix
- **Priority**: Uploads served before frontend assets (see `src/main.ts`)
- **Metadata**: Stored in `UploadedImage` table

### API Response Format
All responses follow this format:
```json
{
  "code": 0,  // 0 = success, non-zero = error
  "data": {}  // Response data
}
```

### Error Codes
- `5001`: Internal server error
- `401`: Unauthorized (JWT validation failed)
- `404`: Not found
- `409`: Conflict (e.g., user already exists)
- See `src/common/filters/http-exception.filter.ts`

### Public Sharing
- Pages and libraries can be marked as `isPublic`
- Public pages have `publicSlug` for URL sharing
- Public access is read-only
- Child pages follow parent's public status
- Public pages are served at `/public/:slug`

### Versioning
- Every page save creates a `PageVersion` entry
- Version history accessible via UI
- Cleanup options: keep versions for day/week/month

## Key Files to Reference

### Backend
- `src/main.ts`: Server setup, static assets, SPA fallback
- `src/app.module.ts`: All module imports
- `src/database/database.service.ts`: Database initialization, queries
- `src/common/interceptors/response.interceptor.ts`: Response format
- `src/common/filters/http-exception.filter.ts`: Error handling
- `src/modules/auth/jwt-auth.guard.ts`: Authentication guard

### Frontend
- `client/src/main.ts`: Vue app setup
- `client/src/api/http.ts`: Axios instance with interceptors
- `client/src/router/index.ts`: Route definitions with guards
- `client/src/stores/user.ts`: Auth state management
- `client/src/components/editor/TiptapEditor.vue`: Rich text editor
- `client/src/components/editor/extensions/`: Custom Tiptap extensions

### Configuration
- `.env`: Environment variables (PORT, JWT_SECRET, etc.)
- `client/vite.config.ts`: Proxy settings, port 5173 → 3003
- `nest-cli.json`: NestJS CLI config
- `tsconfig.json`: TypeScript config with path aliases (`@/*`)

## Integration Points

### SMTP Configuration
- Stored in database (`SystemConfig` table, key `smtpConfig`)
- Configured via Settings → SMTP Configuration in UI
- Used for email verification and password reset
- Falls back to console logging in development mode

### External Dependencies
- **better-sqlite3**: Database (no external server needed)
- **nodemailer**: Email sending
- **bcrypt**: Password hashing
- **passport-jwt**: JWT authentication
- **axios**: HTTP client (frontend)
- **naive-ui**: UI components
- **tiptap**: Rich text editor

### Cross-Component Communication
- **Custom Events**: `open-image-uploader`, `open-markdown-importer`
- **Pinia Stores**: Shared state across components
- **Vue Router**: Navigation with auth guards
- **Query Parameters**: Used for filtering/sorting (e.g., `?libraryId=...&page=1`)

## Important Notes

### Development Mode
- SMTP emails log to console if not configured
- Hot reload enabled for both backend and frontend
- CORS enabled on backend
- Body parser limit increased to 50MB for large page content

### Production Considerations
- **JWT Secret**: Change `JWT_SECRET` in production
- **SMTP**: Configure real SMTP server for email features
- **Uploads**: Ensure `UPLOAD_DIR` is writable and persistent
- **Database**: SQLite file should be backed up regularly
- **CORS**: Adjust for production domain

### Admin Users
- No UI for making users admin
- Set `isAdmin = 1` in User table manually if needed
- Use SQLite CLI or browser

### SPA Routing
- Non-API, non-file routes serve `index.html` (see `src/main.ts`)
- Vue Router handles client-side routing
- Uploads have priority over frontend assets

### Common Pitfalls
1. **Database locked**: WAL mode enabled, but concurrent writes may block reads
2. **Token expired**: 401 triggers logout automatically
3. **Large content**: Body parser limit is 50MB, adjust if needed
4. **CORS issues**: Ensure frontend proxy matches backend port

## Quick Reference

### Adding a New Module
1. `nest g module modules/{name}`
2. Add to `app.module.ts`
3. Define controller/service
4. Add frontend API and store if needed

### Adding a New Frontend Component
1. Create in `client/src/components/` or `client/src/views/`
2. Import in router or parent component
3. Use Pinia store for state management
4. Add TypeScript types in `client/src/types/index.ts`

### Debugging
- Backend: Check NestJS console output
- Frontend: Check browser console (Vite dev server logs)
- Database: Use SQLite CLI or DB browser
- API: Use browser DevTools Network tab or Postman

### Environment Variables
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## Key Architecture Decisions

1. **Merged Library/Page**: Libraries are stored in Page table with `type: 'library'` for simplicity
2. **No Migration Framework**: Schema changes via `initTables()` for simplicity
3. **JWT in localStorage**: Simple but requires XSS protection
4. **Single SQLite File**: Easy deployment, no external database server
5. **Server-Side SPA**: NestJS serves both API and frontend for simplicity
6. **Custom Tiptap Extensions**: For advanced features like admonitions and page references

## Testing Checklist

When making changes, verify:
- [ ] Backend starts without errors (`pnpm dev`)
- [ ] Frontend builds without errors (`pnpm build` in `client/`)
- [ ] API endpoints work (use Postman or browser)
- [ ] Database schema is compatible (check `dev.db`)
- [ ] JWT auth still works (login/logout flow)
- [ ] File uploads work (images, documents)
- [ ] Rich text editor functions (tables, task lists, admonitions)
- [ ] Public sharing works (toggle public status)
- [ ] Version history tracks changes
- [ ] Search functionality works

## Common Patterns

### Database Queries
```typescript
// Use DatabaseService for all queries
const result = this.database.queryOne('SELECT * FROM Page WHERE id = ?', [id]);
const results = this.database.queryAll('SELECT * FROM Page WHERE userId = ?', [userId]);
this.database.run('INSERT INTO Page (...) VALUES (...)', [values]);
```

### API Response Handling
```typescript
// Frontend API calls
const response = await pageApi.getPage(id);
if (response.code === 0) {
  // Success - response.data contains the page
} else {
  // Error - handle accordingly
}
```

### Pinia Store Actions
```typescript
export const usePageStore = defineStore('page', () => {
  const pages = ref<Page[]>([])
  
  async function fetchPage(id: string) {
    const response = await pageApi.getPage(id)
    if (response.code === 0) {
      pages.value.push(response.data)
    }
  }
  
  return { pages, fetchPage }
})
```

## Getting Started

### First Time Setup
1. Install dependencies: `pnpm install`
2. Create `.env` file (copy from `.env.example` if exists)
3. Initialize database: `pnpm dev` (auto-initializes)
4. Start backend: `pnpm dev`
5. Start frontend: `pnpm dev` in `client/`
6. Open browser: `http://localhost:5173`

### Common Tasks
- **Reset everything**: Delete `dev.db*`, `uploads/`, restart server
- **View database**: Use SQLite browser or CLI
- **Add admin user**: Set `isAdmin = 1` in User table
- **Test SMTP**: Configure in Settings → SMTP, emails log to console

## Summary

Schema is a monorepo-style project with:
- Backend: NestJS + SQLite (root directory)
- Frontend: Vue 3 + Vite (client/ directory)
- Authentication: JWT with localStorage
- Rich Editor: Tiptap with custom extensions
- No tests, manual development
- Simple deployment: single SQLite file

**Key Files**: `src/main.ts`, `src/database/database.service.ts`, `client/src/api/http.ts`, `client/src/stores/user.ts`, `client/src/components/editor/TiptapEditor.vue`
