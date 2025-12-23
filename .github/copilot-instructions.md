# Schema - AI Agent Development Guidelines

## Project Overview

Schema is a **personal knowledge management system** (single-user, no collaboration) built with TypeScript full-stack. Think Confluence for individuals—structured knowledge management without team complexity.

**Current Status**: Planning/documentation phase. Follow `docs/StepsMilestone*.md` sequentially (1→6) when implementing.

## Architecture

**Monorepo Structure** (pnpm workspaces):
```
packages/
├── client/    # Vue 3 + Vite frontend
├── server/    # NestJS backend  
└── shared/    # Shared types, constants, utilities
```

**Deployment**: Single Docker container. NestJS serves Vue build as static files on port 3000. All APIs prefixed `/api/v1/`.

**Data Flow**: Vue → Pinia stores → `services/api/` → NestJS controllers → Services → Prisma → SQLite

## Development Commands

```bash
pnpm install                              # Install all dependencies
pnpm dev                                  # Start client (5173) + server (3000)
pnpm --filter server prisma migrate dev   # Run database migrations
pnpm --filter server prisma generate      # Regenerate Prisma client
```

## Coding Conventions

### Frontend (Vue 3)
```vue
<script setup lang="ts">
// Order: imports → props → emits → state/computed → methods → lifecycle
</script>
```
- Files: `PascalCase.vue`, composables: `useCamelCase.ts`
- **Never call APIs directly in components**—use `services/api/*.ts`

### Backend (NestJS)
- Module structure: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `entities/`
- All routes require `JwtAuthGuard` except `/api/v1/public/*`
- Get user ID via `@CurrentUser('id')` decorator
- DTOs use `class-validator`; services own business logic

### API Response Format
```typescript
// Success: { code: 0, data: T }
// Paginated: { code: 0, data: { items, total, page, pageSize, hasMore } }
// Error: { code: number, message: string }
// Codes: 1001=validation, 1002=not found, 2001=unauthorized, 5001=server error
```

## Critical Patterns

1. **Single-user**: No multi-tenancy. All queries MUST filter by `userId`.
2. **Content format**: Always Tiptap JSON: `{ type: 'doc', content: [...] }`
3. **Public access**: Use `isPublic` flag + `publicSlug` for sharing.
4. **Hierarchical pages**: `parentId` creates tree structure within libraries.

## Core Data Models

Key entities (see `docs/Guidelines.md` §3.2 for full Prisma schema):
- **Library**: Knowledge base container with optional `publicSlug` for sharing
- **Page**: Hierarchical content (`parentId`), JSON content (Tiptap/ProseMirror format)
- **PageReference**: Bidirectional links (`sourceId` ↔ `targetId`)
- **PageVersion**: Auto-versioning on edits

## Implementation Guide

Follow milestones in order:
1. **Milestone 1**: Monorepo setup, Prisma/SQLite, JWT auth
2. **Milestone 2**: Library & Page CRUD, tree structure
3. **Milestone 3**: Tiptap editor, slash commands, page references
4. **Milestone 4**: Versions, full-text search, templates
5. **Milestone 5**: Public access, Markdown/PDF export
6. **Milestone 6**: Responsive UI, shortcuts, Docker production

## Reference Docs

- [Guidelines.md](../docs/Guidelines.md) - Full technical spec, API design, Prisma schema
- [InterfaceDesign.md](../docs/InterfaceDesign.md) - UI layouts, components, interactions
- [ProductDescription.md](../docs/ProductDescription.md) - Product scope and requirements
- `docs/StepsMilestone*.md` - Step-by-step implementation guides
