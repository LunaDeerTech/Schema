# @schema/shared

Shared types, constants, and utilities for the Schema project.

This package contains common code used by both the frontend (client) and backend (server) packages.

## Contents

- **Types**: TypeScript interfaces for API requests/responses, database models
- **Constants**: Shared configuration values, error codes, API endpoints
- **Utilities**: Common helper functions (to be added)

## Usage

This package is automatically available to other packages in the monorepo via pnpm workspaces.

```typescript
import { User, ApiResponse, ERROR_CODES } from '@schema/shared';
```

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type check only
pnpm tsc --noEmit
```