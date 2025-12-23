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
- **Backend**: NestJS, TypeScript, Prisma, SQLite
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
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

3. **Setup database** (first time only):
   ```bash
   pnpm --filter server prisma migrate dev
   pnpm --filter server prisma generate
   ```

### Build & Production

```bash
# Build all packages
pnpm build

# Start production server
pnpm start
```

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