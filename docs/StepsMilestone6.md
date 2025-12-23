# Milestone 6: Experience Optimization & Deployment

**Goal**: Polish the user experience with responsive design, keyboard shortcuts, and robust error handling, then prepare the application for production deployment using Docker.

**References**:
- `docs/Guidelines.md` (Phase 6)
- `docs/InterfaceDesign.md` (Section 8: Responsive, Section 10: Interactions, Section 12: Empty States)

---

## Step 1: Responsive Design (Mobile & Tablet)

**Goal**: Ensure the application is usable on smaller screens.

**Instructions**:
1.  **Sidebar Adaptation**:
    -   On screens < 1280px (Tablet): Sidebar should be collapsible (if not already) or overlay mode.
    -   On screens < 768px (Mobile): Sidebar is hidden by default. Hamburger menu in Top Nav toggles a drawer.
2.  **Layout Adjustments**:
    -   **Top Nav**: Hide non-essential items (User name, full search bar) on mobile. Show Search Icon instead.
    -   **Page Content**: Remove wide margins/padding. Ensure typography scales down slightly if needed.
    -   **Editor**: Ensure the floating toolbar doesn't overflow the screen.
3.  **Touch Interactions**:
    -   Ensure buttons and list items have adequate touch targets (min 44px height).

**Verification**:
-   Resize browser window to 375px (iPhone width).
-   Can open menu, navigate to a page, and read content.
-   Can edit content without UI breaking.

---

## Step 2: Keyboard Shortcuts

**Goal**: Implement power-user shortcuts for navigation and editing.

**Instructions**:
1.  **Global Shortcut Manager**:
    -   Use a library like `@vueuse/core` (`useMagicKeys`, `whenever`) or a custom composable.
2.  **Implement Shortcuts** (see `InterfaceDesign.md` 10.1):
    -   `Ctrl+K` / `Cmd+K`: Open Global Search.
    -   `Ctrl+B` / `Cmd+B`: Toggle Sidebar.
    -   `Ctrl+N` / `Cmd+N`: Create New Page (in current library).
    -   `Ctrl+S` / `Cmd+S`: Manual Save (even if auto-save exists, visual feedback is good).
    -   `Ctrl+E` / `Cmd+E`: Toggle Edit/Read mode (if applicable).
3.  **Visual Feedback**:
    -   Show a small toast or indicator when a shortcut is triggered (e.g., "Saved").

**Verification**:
-   Pressing `Ctrl+K` opens search.
-   Pressing `Ctrl+B` toggles sidebar.

---

## Step 3: UX Polish (Loading & Errors)

**Goal**: Improve perceived performance and handle edge cases gracefully.

**Instructions**:
1.  **Loading States**:
    -   **Skeleton Screens**: Create `PageSkeleton.vue` and `SidebarSkeleton.vue`. Show these while data is fetching instead of a spinning loader.
    -   **Transitions**: Add subtle fade transitions (`<Transition name="fade">`) between routes.
2.  **Empty States**:
    -   Create `EmptyState.vue` component (Illustration + Title + Description + Action Button).
    -   Use in: Empty Library, Search No Results, 404 Page.
3.  **Error Handling**:
    -   **Global Error Boundary**: Catch API errors.
    -   **Toast Notifications**: Show friendly messages for errors (e.g., "Network error, changes saved locally" - if offline support is added, otherwise "Failed to save").
    -   **404 Page**: Custom design for "Page not found".

**Verification**:
-   Navigate to a non-existent ID -> Show 404.
-   Search for gibberish -> Show Empty State.
-   Refresh page -> Show Skeleton before content appears.

---

## Step 4: Production Docker Setup

**Goal**: Containerize the application for single-command deployment.

**Instructions**:
1.  **Dockerfile Optimization**:
    -   Review `docker/Dockerfile` in `Guidelines.md`.
    -   Ensure multi-stage build is working correctly to keep image size small.
    -   Verify `pnpm` workspace handling in Docker build.
2.  **Docker Compose**:
    -   Review `docker/docker-compose.yml`.
    -   Ensure SQLite database file is persistent (mount volume for data directory).
    -   Ensure environment variables (`JWT_SECRET`, `DATABASE_URL`) are passed correctly.
3.  **Nginx (Optional but Recommended)**:
    -   If not using NestJS to serve statics (though Guidelines say we are), set up Nginx.
    -   *Stick to Guidelines*: NestJS serves statics. Ensure `client/dist` is copied to `server/public` (or similar path) in the Dockerfile.

**Verification**:
-   Run `docker-compose up --build`.
-   Access `http://localhost:3000`.
-   Login, create page, refresh. Data persists.

---

## Step 5: E2E Testing (Critical Flows)

**Goal**: Ensure the main user journey works before release.

**Instructions**:
1.  **Setup Playwright**:
    -   Install Playwright in `packages/client` or root.
2.  **Write Tests**:
    -   **Auth**: Login flow.
    -   **CRUD**: Create Library -> Create Page -> Edit Content -> Save.
    -   **Search**: Search for the created page.
3.  **CI Integration**:
    -   Add a step in GitHub Actions to run E2E tests (headless).

**Verification**:
-   Run `pnpm test:e2e`. All tests pass.

---

## Step 6: Documentation & Release

**Goal**: Finalize documentation for the end-user.

**Instructions**:
1.  **README.md**:
    -   Update root `README.md` with "Getting Started" for users (Docker run command).
2.  **Deployment Guide**:
    -   Create `docs/Deployment.md`. Explain how to set ENV vars and back up the database.
3.  **Release**:
    -   Tag version `v1.0.0`.
    -   Build and push Docker image (if using a registry).

**Verification**:
-   A fresh user can read README and start the app in < 5 minutes.
