# Milestone 1: Infrastructure & Basic Authentication

**Goal**: Initialize the Monorepo, set up the database, implement the backend authentication system, and create the basic frontend structure with login capabilities.

**References**:
- `docs/Guidelines.md` (Phase 1)
- `docs/ProductDescription.md`
- `.github/copilot-instructions.md`

---

## Step 1: Monorepo & Environment Setup

**Goal**: Create the project structure and configure the development environment.

**Instructions**:
1.  **Initialize Project**:
    -   Create `pnpm-workspace.yaml` in the root:
        ```yaml
        packages:
          - 'packages/*'
        ```
    -   Create root `package.json` with scripts for `dev` (runs both client and server), `build`, and `lint`.
    -   Create `.gitignore` (standard Node.js + dotenv).
    -   Create `.env.example` and `.env` with:
        ```properties
        NODE_ENV=development
        PORT=3000
        DATABASE_URL="file:./dev.db"
        JWT_SECRET=dev_secret_key
        ```

2.  **Create Packages**:
    -   Create directories: `packages/client`, `packages/server`, `packages/shared`.
    -   Initialize `packages/shared` as a simple TypeScript library (types, constants).

3.  **Database Setup**:
    -   Ensure `packages/server/prisma/dev.db` will be created by Prisma (SQLite).
    -   (Optional) `docker/docker-compose.yml` can be removed or kept empty for now as SQLite doesn't need a container.

**Verification**:
-   `pnpm install` runs successfully.

---

## Step 2: Backend Core & Database

**Goal**: Set up NestJS and Prisma.

**Instructions**:
1.  **Initialize NestJS**:
    -   Initialize `packages/server` as a NestJS application.
    -   Install dependencies: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `prisma`, `@prisma/client`.

2.  **Prisma Setup**:
    -   Initialize Prisma in `packages/server/prisma`.
    -   Define the `User` model in `schema.prisma` (refer to `docs/Guidelines.md` Section 3.2).
    -   Run migration: `pnpm prisma migrate dev --name init`.
    -   Generate client: `pnpm prisma generate`.

3.  **Global Configuration**:
    -   Configure `main.ts` to use global prefix `/api/v1`.
    -   Set up `PrismaService` to connect to the database.
    -   Create a global exception filter and response interceptor to match the API format: `{ code: 0, data: ... }`.

**Verification**:
-   Server starts on port 3000.
-   Database tables are created.
-   `GET /api/v1/health` (create a simple health check) returns 200.

---

## Step 3: Authentication Module

**Goal**: Implement JWT-based authentication.

**Instructions**:
1.  **Install Auth Dependencies**:
    -   `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`.

2.  **Create Auth Module**:
    -   Implement `AuthService`: `validateUser`, `login` (returns JWT), `register` (hashes password).
    -   Implement `AuthController`:
        -   `POST /auth/register`: Create new user.
        -   `POST /auth/login`: Return access token.
        -   `GET /auth/profile`: Return current user (protected).
    -   Implement `JwtStrategy` and `JwtAuthGuard`.

3.  **User Module**:
    -   Create `UserModule` to handle user data access via Prisma.

**Verification**:
-   Can register a user via Postman/Curl.
-   Can login and receive a JWT.
-   Can access protected route `/api/v1/auth/profile` with the JWT.

---

## Step 4: Frontend Core Setup

**Goal**: Set up Vue 3 and basic routing.

**Instructions**:
1.  **Initialize Vue 3**:
    -   Initialize `packages/client` with Vite + Vue 3 + TypeScript.
    -   Install: `vue-router`, `pinia`, `axios`, `@vueuse/core`.
    -   Install UI library (e.g., `naive-ui` or `element-plus` as per Guidelines).

2.  **Project Structure**:
    -   Set up folders: `src/api`, `src/stores`, `src/views`, `src/layouts`.
    -   Configure `vite.config.ts` to proxy `/api` to `http://localhost:3000`.

3.  **State Management**:
    -   Create `useUserStore` in Pinia to handle login state and user profile.

4.  **API Client**:
    -   Configure Axios interceptors to inject the JWT token into headers.
    -   Handle 401 responses (redirect to login).

**Verification**:
-   Frontend runs on port 5173.
-   Proxy works (requests to `/api` go to backend).

---

## Step 5: Login & Register UI

**Goal**: Create the user interface for authentication.

**Instructions**:
1.  **Create Views**:
    -   `LoginView.vue`: Form for email/password.
    -   `RegisterView.vue`: Form for new account.
    -   `HomeView.vue`: Simple dashboard showing "Welcome, [User Name]".

2.  **Routing**:
    -   Configure routes `/login`, `/register`, `/`.
    -   Add navigation guard: Redirect unauthenticated users to `/login`.

3.  **Integration**:
    -   Connect forms to `useUserStore` actions (`login`, `register`).
    -   Display error messages from backend.

**Verification**:
-   Full flow: Register -> Auto Login (or manual login) -> Redirect to Home -> Show User Name.
-   Refresh page keeps user logged in (persist token in localStorage).

---

## Step 6: Final Integration & Cleanup

**Goal**: Ensure backend serves frontend and everything runs with one command.

**Instructions**:
1.  **Static Assets**:
    -   Configure NestJS to serve `packages/client/dist` as static assets (as per `Guidelines.md` Section 2.3).
    -   Add a catch-all route in NestJS to serve `index.html` for SPA routing.

2.  **Root Scripts**:
    -   Ensure `pnpm dev` runs both backend (watch mode) and frontend (vite dev).

**Verification**:
-   `pnpm dev` starts everything.
-   Application is usable at `http://localhost:5173` (dev) and `http://localhost:3000` (if built).
