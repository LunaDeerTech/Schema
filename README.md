# Schema - Personal Knowledge Management System

<p align="center">
  <a href="https://github.com/LunaDeerTech/Schema" target="_blank">
    <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status">
    <img src="https://img.shields.io/badge/NestJS-10.x-blue" alt="NestJS">
    <img src="https://img.shields.io/badge/Vue-3.x-green" alt="Vue">
  </a>
</p>

<p align="center">
  <strong>Schema</strong> is a modern personal knowledge management system - Think Confluence for personal use.
</p>

## ✨ Features

### Core Features
- 📝 **Rich Text Editor** - Tiptap-based editor with tables, task lists, code blocks, and mentions
- 🏷️ **Tag System** - Organize pages with flexible tagging
- 🔍 **Full-Text Search** - Fast search across all pages
- 📚 **Hierarchical Structure** - Libraries and nested pages
- 🔄 **Version History** - Track changes with page versioning
- 🔗 **Page References** - Bidirectional linking between pages
- 📤 **File Uploads** - Image and file uploads with metadata
- 👥 **Public Sharing** - Share pages via public URLs with slugs

### Authentication & Security
- 🔐 **JWT Authentication** - Secure token-based authentication
- 📧 **Email Verification** - SMTP-based verification (configurable)
- 🔑 **Password Reset** - Email-based password recovery
- 👤 **User Management** - Profile and security settings
- 🛡️ **Admin Controls** - Admin user management

### Technical Features
- ⚡ **Hot Reload** - Fast development with NestJS and Vite
- 🎨 **Modern UI** - Naive UI component library
- 📱 **Responsive** - Works on desktop and mobile
- 🗄️ **SQLite Database** - Lightweight, file-based storage
- 📦 **Single Binary** - Easy deployment with packaging script

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | NestJS 10 | API server & business logic |
| **Database** | Better-sqlite3 | SQLite with WAL mode |
| **Frontend** | Vue 3 + Vite | SPA with hot reload |
| **State** | Pinia | Client-side state management |
| **UI** | Naive UI | Component library |
| **Editor** | Tiptap | Rich text editor |
| **HTTP** | Axios | API client with interceptors |

### Key Design Patterns

**Backend (NestJS):**
- **Module Pattern** - Each feature is a self-contained module
- **Controller-Service Pattern** - Separation of concerns
- **Global Components** - Interceptors, filters, guards
- **Dependency Injection** - NestJS DI system

**Frontend (Vue 3):**
- **Composition API** - Modern Vue 3 patterns
- **Pinia Stores** - Centralized state management
- **API Layer** - Dedicated API modules
- **Component-Based** - Reusable UI components

## 🚀 Quick Start

### Prerequisites

- **Docker**
- **Docker Compose** (`docker compose`)

### Deploy with Docker Compose

1. **Create a compose file** (`docker-compose.yml`) in the project root.

```yaml
version: '3.8'

services:
  schema:
    image: ghcr.io/lunadeertech/schema:latest
    container_name: schema-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_PATH=/app/db/schema-database.sqlite
      - JWT_SECRET=!!!CHANGE_THIS!!!
      - JWT_EXPIRES_IN=7d
      - UPLOAD_DIR=/app/uploads
      - MAX_FILE_SIZE=10485760
    volumes:
      - ./db:/app/db
      - ./uploads:/app/uploads
```

2. **Configure environment variables:**
- Edit the `JWT_SECRET` in the compose file to a secure random string before deployment.

3. **Start the service:**
```bash
docker compose up -d
```

4. **Open the application:**
- Application: `http://localhost:3000`
- API: `http://localhost:3000/api/v1`

5. **Persistent data:**
- Database files are stored in `./db`
- Uploaded files are stored in `./uploads`

### Common Operations

**View logs:**
```bash
docker compose logs -f schema
```

**Update to the latest image:**
```bash
docker compose pull
docker compose up -d
```

**Stop the service:**
```bash
docker compose down
```

## 🛠️ Local Development

Local source-code development is optional. If you want to run the backend and frontend separately:

```bash
pnpm install
cd client && pnpm install && cd ..
pnpm dev
pnpm dev:client
```

Backend runs on port `3000`; the Vite dev server runs on port `5173`.

## ⚙️ Docker Compose Configuration

The deployment is configured through Compose variables in `.env`.

| Variable | Default | Description |
|--------|-------------|-------------|
| `SCHEMA_IMAGE` | `ghcr.io/lunadeertech/schema:latest` | Container image to deploy |
| `SCHEMA_CONTAINER_NAME` | `schema-app` | Container name |
| `SCHEMA_NODE_ENV` | `production` | Runtime environment |
| `SCHEMA_PORT` | `3000` | Host and container port |
| `SCHEMA_DB_PATH` | `/app/db/schema-database.sqlite` | SQLite database path inside the container |
| `SCHEMA_JWT_SECRET` | `!!!CHANGE_THIS!!!` | JWT signing secret; replace this before deployment |
| `SCHEMA_JWT_EXPIRES_IN` | `7d` | JWT expiration time |
| `SCHEMA_UPLOAD_DIR` | `/app/uploads` | Upload directory inside the container |
| `SCHEMA_MAX_FILE_SIZE` | `10485760` | Upload size limit in bytes |

SMTP and other application-level settings can be configured from the application after the first login.

## 📁 Project Structure

```
Schema/
├── .env                    # Environment variables
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── CLAUDE.md             # Project guidelines
├── LICENSE               # MIT License
├── README.md             # This file
├── nest-cli.json         # NestJS CLI config
├── package.json          # Backend dependencies
├── pnpm-lock.yaml        # Lock file
├── pack.js               # Build & packaging script
├── tsconfig.json         # TypeScript config
│
├── src/                  # Backend source
│   ├── main.ts          # Application entry
│   ├── app.module.ts    # Root module
│   │
│   ├── common/          # Shared components
│   │   ├── decorators/  # Custom decorators
│   │   ├── filters/     # Exception filters
│   │   ├── guards/      # Auth guards
│   │   └── interceptors/# Response interceptors
│   │
│   ├── database/        # Database layer
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│   │   ├── migrator.ts
│   │   └── init-db.ts
│   │
│   └── modules/         # Feature modules
│       ├── auth/
│       ├── user/
│       ├── page/
│       ├── library/
│       ├── tag/
│       ├── search/
│       ├── public/
│       ├── upload/
│       ├── system/
│       └── health/
│
├── client/               # Frontend source
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   │
│   └── src/
│       ├── main.ts      # Vue app entry
│       ├── App.vue      # Root component
│       │
│       ├── api/         # API modules
│       │   ├── http.ts
│       │   ├── auth.ts
│       │   ├── page.ts
│       │   └── ...
│       │
│       ├── stores/      # Pinia stores
│       │   ├── user.ts
│       │   ├── page.ts
│       │   └── ...
│       │
│       ├── router/      # Vue Router
│       │   └── index.ts
│       │
│       ├── views/       # Page views
│       │   ├── Login.vue
│       │   ├── Home.vue
│       │   └── ...
│       │
│       ├── layouts/     # Layout components
│       │   ├── MainLayout.vue
│       │   └── PublicLayout.vue
│       │
│       ├── components/  # UI components
│       │   ├── common/
│       │   ├── editor/
│       │   └── layout/
│       │
│       └── styles/      # Global styles
│
├── uploads/             # Uploaded files
│   └── images/         # Uploaded images
│
└── dist/               # Build output
    ├── main.js        # Backend bundle
    └── frontend/      # Frontend assets
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Schema.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature"
   ```

5. **Push and create a PR**
   ```bash
   git push origin feature/your-feature
   ```

### Development Guidelines

**Backend:**
- Follow NestJS best practices
- Use proper DTOs for validation
- Keep modules focused and cohesive
- Use dependency injection

**Frontend:**
- Use Composition API
- Follow Vue 3 best practices
- Use Pinia for state management
- Keep components reusable

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include environment details (OS, Node version, etc.)
- Provide steps to reproduce
- Include error logs if applicable

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Vue 3](https://vuejs.org/) - Frontend framework
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Naive UI](https://www.naiveui.com/) - Component library
- [SQLite](https://www.sqlite.org/) - Database

