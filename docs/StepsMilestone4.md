# Milestone 4: Advanced Features (Version Control, Search, Templates, Tasks)

**Goal**: Implement advanced knowledge management features including version history, full-text search, content templates, and a centralized task view.

**References**:
- `docs/Guidelines.md` (Phase 4)
- `docs/InterfaceDesign.md` (Section 6: Page Function Buttons, Section 3: Search, Section 6.3: Task View)

---

## Step 1: Version Control (Backend)

**Goal**: Enable saving page history and restoring previous versions.

**Instructions**:
1.  **Database Schema Verification**:
    -   Ensure `PageVersion` table exists in the database schema (refer to `docs/Guidelines.md` Section 3.2).
    -   Fields: `id` (TEXT), `content` (TEXT - JSON), `message` (TEXT), `createdAt` (DATETIME), `pageId` (TEXT - FOREIGN KEY).
2.  **Service Implementation (`PageService`)**:
    -   Implement `createVersion(pageId, content, message)`: Saves a snapshot of the current page content to `PageVersion` table.
    -   Implement `getVersions(pageId)`: Returns a list of versions for a page, ordered by `createdAt` desc.
    -   Implement `restoreVersion(pageId, versionId)`:
        -   Fetch the specific version from `PageVersion` table.
        -   Create a *new* version of the *current* state (backup before restore).
        -   Update `Page.content` with the version's content.
3.  **Controller Implementation**:
    -   `GET /api/v1/pages/:id/versions`
    -   `POST /api/v1/pages/:id/versions` (Manually create version)
    -   `POST /api/v1/pages/:id/versions/:versionId/restore`

**Verification**:
-   Can manually trigger version creation via API.
-   Can retrieve version list.
-   Restoring a version updates the main page content.

---

## Step 2: Version Control (Frontend)

**Goal**: Provide a UI for users to view history and restore versions.

**Instructions**:
1.  **History Panel Component**:
    -   Create `src/components/page/VersionHistory.vue`.
    -   Display a list of versions (Timestamp, "System Auto-save" or User Message).
    -   Trigger: Click `[h]` (History) button in the page header (see `InterfaceDesign.md`).
2.  **Preview & Restore**:
    -   Clicking a version should show a preview (read-only editor or simple JSON dump for now).
    -   Add a "Restore" button.
    -   On restore, confirm with user, call API, and reload page content.
3.  **Integration**:
    -   Add the History button to `PageHeader.vue`.
    -   Connect the button to open the `VersionHistory` drawer/modal.

**Verification**:
-   Clicking History button opens the panel.
-   List shows real data from backend.
-   Restoring a version updates the editor content immediately.

---

## Step 3: Full-Text Search (Backend)

**Goal**: Implement efficient search across all pages and libraries.

**Instructions**:
1.  **Database Setup**:
    -   Ensure `Page` model is optimized for search.
    -   *Note*: For SQLite, use `OR` with `contains` on title and content.
    -   *Decision*: Implement a `SearchService` that abstracts this.
2.  **Search Service**:
    -   Implement `search(query: string, filters: SearchFilters)`.
    -   Search in `Page.title` and `Page.content`.
    -   Search in `Tag.name`.
    -   Return results with highlights (snippet of text around the match).
3.  **Controller**:
    -   `GET /api/v1/search?q=...&type=...`

**Verification**:
-   API returns relevant pages when searching for keywords in the title.
-   API returns relevant pages when searching for keywords inside the JSON content (might need raw query or text extraction if JSON search is complex). *Tip*: For MVP, extracting text from Tiptap JSON to a plain text column (`searchText`) on save is a robust strategy for search performance.

---

## Step 4: Global Search UI (Frontend)

**Goal**: Create a global search modal accessible from anywhere.

**Instructions**:
1.  **Search Modal Component**:
    -   Create `src/components/search/GlobalSearch.vue`.
    -   Input field with auto-focus.
    -   List of results (Pages, Libraries).
2.  **Interaction**:
    -   Trigger: `Ctrl+K` (Global shortcut) or click Search bar in Top Navigation.
    -   Debounce input (e.g., 300ms) before calling API.
    -   Keyboard navigation (Arrow keys to select, Enter to go).
3.  **Result Display**:
    -   Show Icon, Title, and Breadcrumb (Library > Parent Page).
    -   Highlight matching terms.

**Verification**:
-   `Ctrl+K` opens the modal.
-   Typing queries returns results.
-   Clicking a result navigates to the page.

---

## Step 5: Template System

**Goal**: Allow creating pages from predefined templates.

**Instructions**:
1.  **Backend**:
    -   Ensure `Template` entity exists.
    -   `TemplateService`: CRUD for templates.
    -   Seed some built-in templates (Meeting Notes, Daily Journal).
2.  **Frontend - Template Management**:
    -   (Optional for MVP) A settings page to manage templates.
3.  **Frontend - Usage**:
    -   Modify `New Page` flow: When creating a page, offer "Empty Page" or select from Templates.
    -   Implement `/template` slash command in Editor to insert a template into an existing page.
    -   "Apply Template" logic: Merge template JSON content into current editor instance.

**Verification**:
-   Can create a new page using a "Meeting Notes" template.
-   The editor is pre-filled with the template structure.

---

## Step 6: Task Aggregation

**Goal**: Centralize tasks scattered across different pages.

**Instructions**:
1.  **Backend - Task Extraction**:
    -   **Crucial**: When saving a `Page`, parse the `content` JSON.
    -   Find all `taskList` and `taskItem` nodes.
    -   Sync these items to the `Task` database table (Create new, Update existing, Delete removed).
    -   *Alternative MVP*: Just use the `Task` table for the "Task View" and don't strictly sync 1:1 with text content if too complex.
    -   *Recommended*: Extract tasks on save. Update `Task` table with `content`, `isCompleted`, `pageId`.
2.  **Backend - Task API**:
    -   `GET /api/v1/tasks`: Get all tasks for the current user.
    -   Support filters: `isCompleted`, `dueDate`.
3.  **Frontend - Task Dashboard**:
    -   Create `/tasks` route.
    -   Display tasks grouped by Page or Due Date.
    -   Allow checking off a task (calls API to update `Task` status).
    -   *Note*: If a task is checked in Dashboard, the Page content needs to update. This requires the Page to reload or the backend to patch the Page JSON.
    -   *MVP Approach*: Dashboard updates `Task` entity. When user opens the Page, the frontend (or backend) reconciles the `Task` entity status with the JSON content.

**Verification**:
-   Add a task `[ ] Buy milk` in a Page. Save.
-   Go to Task Dashboard. See "Buy milk".
-   (Advanced) Check "Buy milk" in Dashboard. Go back to Page. It should be checked (or updated on load).
