# Schema - Personal Knowledge Management System

A modern, structured knowledge management system built for individuals. Think Confluence for personal use.

## Architecture

This project uses a monorepo structure with pnpm workspaces:

```
schema/
├── packages/
│   ├── client/    # Vue 3 + Vite frontend
│   ├── server/    # NestJS backend
│   └── shared/    # Shared types and constants
├── docs/          # Project documentation
└── docker/        # Docker configuration (optional)
```

## Technology Stack

- **Frontend**: Vue 3, TypeScript, Vite, Pinia, Naive UI
- **Backend**: NestJS, TypeScript, SQLite, better-sqlite3
- **Auth**: JWT + Passport
- **Editor**: Tiptap (ProseMirror-based)

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+

### Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development servers**:
   ```bash
   pnpm dev
   ```

   This starts:
   - **Frontend**: http://localhost:5173 (Vite dev server with hot reload)
   - **Backend**: http://localhost:3000 (NestJS API server)

   The frontend proxies API requests to the backend automatically.

### Build & Production

```bash
# Build all packages
pnpm build

# Start production server
pnpm start
```

**Production Access**: After building, the server runs on http://localhost:3000 and serves:
- **API**: http://localhost:3000/api/v1/*
- **Frontend**: http://localhost:3000 (serves the built Vue app)

The production server handles both API routes and SPA routing automatically.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
```

## Project Structure

### Packages

- **`@schema/shared`**: Common types and constants
- **`@schema/client`**: Frontend application
- **`@schema/server`**: Backend API

### Key Features (Milestones)

1. ✅ **Milestone 1**: Infrastructure & Authentication
2. 🚧 **Milestone 2**: Library & Page CRUD
3. ⏳ **Milestone 3**: Rich Text Editor
4. ⏳ **Milestone 4**: Versioning & Search
5. ⏳ **Milestone 5**: Public Access & Export
6. ⏳ **Milestone 6**: Polish & Deployment

## Documentation

- [Product Description](docs/ProductDescription.md)
- [Technical Guidelines](docs/Guidelines.md)
- [Interface Design](docs/InterfaceDesign.md)
- [Milestone 1 Steps](docs/StepsMilestone1.md)

## License

MIT