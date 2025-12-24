# Schema Frontend

Vue 3 + TypeScript frontend for Schema knowledge management system.

## Features

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** for navigation
- **Naive UI** component library
- **Axios** for HTTP requests
- **SCSS** for styling

## Project Structure

```
src/
├── api/              # API client and services
├── assets/           # Global styles and assets
├── components/       # Reusable components
├── layouts/          # Layout components
├── plugins/          # Plugin configurations
├── router/           # Vue Router setup
├── stores/           # Pinia stores
├── types/            # TypeScript interfaces
├── views/            # Page components
├── constants.ts      # Application constants
└── main.ts           # Application entry point
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server (port 5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm run build
```

## Configuration

- **Proxy**: API requests to `/api` are proxied to `http://localhost:3000`
- **Port**: Development server runs on port 5173
- **Base URL**: API requests use `/api/v1` as base URL

## Authentication

The frontend handles authentication with:
- JWT token storage in localStorage
- Axios interceptors for automatic token injection
- Navigation guards for protected routes
- 401 response handling with redirect to login

## Pages

- `/login` - User login
- `/register` - User registration
- `/home` - Main dashboard
- `/library` - Knowledge library management
- `/library/:id` - Specific library pages