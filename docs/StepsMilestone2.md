# Milestone 2: Core Functionality - Libraries & Pages

**Goal**: Implement the core knowledge management structure: Libraries (Knowledge Bases), Hierarchical Pages, and Tags. This includes both backend CRUD operations and the frontend navigation interface (Sidebar, Page Tree).

**References**:
- `docs/Guidelines.md` (Phase 2)
- `docs/InterfaceDesign.md` (Sidebar, Page Layout, Home Page)
- `docs/ProductDescription.md` (Information Model)

**Implementation Order**: This milestone follows the user interface construction sequence:
1. Backend database schema and modules (Steps 1-4)
2. Frontend data layer (Step 5)
3. **Layout structure** (Step 6)
4. **Top navigation bar** (Step 7)
5. **Sidebar navigation** (Step 8)
6. **Home page content** (Step 9)
7. **Page content area** (Step 10)

---

## Step 1: Database Schema Expansion

**Goal**: Update the database schema to support Libraries, Pages, and Tags.

**Instructions**:
1.  **Update Database Schema**:
    -   Modify `packages/server/src/database/database.service.ts` to add table creation for `Library`, `Page`, `Tag`, `PageTag`.
    -   Add `initTables()` methods for new tables (refer to `docs/Guidelines.md` Section 3.2 for complete SQL definitions).
    -   Ensure relationships are correctly defined with FOREIGN KEY constraints.
2.  **Apply Changes**:
    -   Run `pnpm --filter server db:init` to reinitialize database with new tables.
    -   Or use `DatabaseService` methods to add new tables to existing database.

**Verification**:
-   Database tables `Library`, `Page`, `Tag`, `PageTag` exist in `dev.db`.
-   All relationships (Foreign Keys) are properly established.

---

## Step 2: Backend - Library Module

**Goal**: Implement management of Knowledge Bases (Libraries).

**Instructions**:
1.  **Create Module**:
    -   Generate `LibraryModule`, `LibraryController`, `LibraryService`.
2.  **DTOs**:
    -   Create `CreateLibraryDto` (title, description, icon, isPublic, publicSlug).
    -   Create `UpdateLibraryDto`.
3.  **Service Logic**:
    -   `create`: Create a library for the current user.
    -   `findAll`: List libraries for the current user (ordered by `sortOrder`).
    -   `findOne`: Get details of a specific library.
    -   `update` / `remove`.
4.  **Controller**:
    -   Endpoints: `POST /libraries`, `GET /libraries`, `GET /libraries/:id`, `PUT /libraries/:id`, `DELETE /libraries/:id`.
    -   Apply `JwtAuthGuard`.

**Verification**:
-   Can create, list, update, and delete libraries via API.
-   Users can only see their own libraries.

---

## Step 3: Backend - Page Module & Tree Structure

**Goal**: Implement hierarchical Page management.

**Instructions**:
1.  **Create Module**:
    -   Generate `PageModule`, `PageController`, `PageService`.
2.  **DTOs**:
    -   `CreatePageDto` (title, libraryId, parentId?, content?).
    -   `UpdatePageDto`.
    -   `PageQueryDto` (libraryId, parentId).
3.  **Service Logic**:
    -   `create`: Handle `parentId` to establish hierarchy. Default content to empty doc `{ type: 'doc', content: [] }`.
    -   `findAll`: Support filtering by `libraryId` and `parentId`.
    -   `findOne`: Return page with `tags`, `parent`, and `children` (for immediate sub-pages).
    -   `getTree`: (Optional but recommended) Recursive or flat list to build tree on frontend.
4.  **Controller**:
    -   Endpoints: `POST /pages`, `GET /pages`, `GET /pages/:id`, `PUT /pages/:id`, `DELETE /pages/:id`.

**Verification**:
-   Can create a root page (no parent).
-   Can create a child page (with parentId).
-   Can retrieve a page and see its children.

---

## Step 4: Backend - Tag Module

**Goal**: Implement Tag management and association.

**Instructions**:
1.  **Create Module**:
    -   Generate `TagModule`.
2.  **Service Logic**:
    -   `create`: Create unique tag.
    -   `findAll`: List all tags.
    -   `attachToPage`: Add tag to page (handle `PageTag` relation).
    -   `detachFromPage`: Remove tag from page.
3.  **Controller**:
    -   Endpoints: `GET /tags`, `POST /tags`.
    -   (Note: Tag association might be handled within `PageController` update or separate endpoints like `POST /pages/:id/tags`).

**Verification**:
-   Can create tags.
-   Can associate tags with pages.

---

## Step 5: Frontend - Services & Stores

**Goal**: Set up data layer for Libraries and Pages.

**Instructions**:
1.  **API Services**:
    -   Create `packages/client/src/services/api/library.ts`: Methods for library CRUD.
    -   Create `packages/client/src/services/api/page.ts`: Methods for page CRUD.
    -   Create `packages/client/src/services/api/tag.ts`: Methods for tag CRUD and associations.
2.  **Pinia Stores**:
    -   `useLibraryStore`: Fetch and store list of libraries. Handle "current library" selection.
    -   `usePageStore`: Fetch page tree for current library. Store "current page" details.
    -   `useTagStore`: Fetch and store tags, handle tag associations.

**Verification**:
-   API services are properly typed and exported.
-   Stores correctly manage state and actions.
-   Data can be fetched from backend.

---

## Step 6: Frontend - Overall Layout Structure

**Goal**: Implement the overall layout structure as defined in `docs/InterfaceDesign.md` Section 2.

**Instructions**:
1.  **Main Layout Component**:
    -   Update `packages/client/src/layouts/MainLayout.vue` to implement the three-column layout structure.
    -   Structure: Top Navigation Bar (fixed, 56px) + Sidebar (260px) + Main Content Area (adaptive).
2.  **Layout Regions**:
    -   **Top Navigation Bar**: Fixed position at top, contains logo, search, user actions.
    -   **Sidebar**: Fixed position on left, contains library switcher and page tree (only visible on page routes).
    -   **Main Content Area**: Adaptive width, contains the current view content.
3.  **Routing Integration**:
    -   Wrap routes in MainLayout for authenticated pages.
    -   Home, Library, Page views use MainLayout.
    -   Login/Register views use minimal layout.

**Verification**:
-   Layout structure matches the design specification.
-   Top bar is fixed and visible.
-   Sidebar is properly positioned.
-   Main content area has correct margins and spacing.

---

## Step 7: Frontend - Top Navigation Bar

**Goal**: Implement the top navigation bar as defined in `docs/InterfaceDesign.md` Section 3.

**Instructions**:
1.  **Top Navigation Component**:
    -   Create `packages/client/src/components/layout/TopNavigation.vue`.
    -   Implement the horizontal layout with all required elements.
2.  **Required Elements**:
    -   **Sidebar Toggle** `=`: Only shown on page routes, toggles sidebar visibility.
    -   **Brand Logo** `Schema`: Click to navigate to home/workbench.
    -   **Global Search** `Search Box...`: Click to open search panel, support Ctrl+K shortcut.
    -   **Help** `?`: Opens help panel with documentation and shortcuts.
    -   **User Menu** `[User Avatar]`: Dropdown with user settings and logout.
    -   **Settings** `O`: Opens settings panel.
3.  **Search Panel**:
    -   Implement the search panel with recent searches, filters (Library, Tags, Time), and results.
    -   For Milestone 2, create the UI structure (search logic in later milestone).
4.  **Interaction**:
    -   Sidebar toggle should update layout state.
    -   Search panel should open/close on click.
    -   User menu dropdown should work.
    -   Keyboard shortcuts (Ctrl+K) should trigger search.

**Verification**:
-   All elements are present and correctly positioned.
-   Search panel UI exists (even if non-functional).
-   User menu works.
-   Sidebar toggle works on page routes.

---

## Step 8: Frontend - Sidebar

**Goal**: Implement the sidebar as defined in `docs/InterfaceDesign.md` Section 4.

**Instructions**:
1.  **Sidebar Component**:
    -   Create `packages/client/src/components/layout/Sidebar.vue`.
    -   Implement the vertical layout with library switcher and page tree.
2.  **Library Switcher**:
    -   Display list of all libraries for the current user.
    -   Highlight the current selected library.
    -   Clicking a library should load its page tree and navigate to the library view.
    -   Include "New Library" button.
3.  **Page Tree**:
    -   Display hierarchical structure of pages within the selected library.
    -   Use nested list/tree UI to show parent-child relationships.
    -   Implement expand/collapse functionality for parent pages.
    -   Clicking a page should navigate to that page's detail view.
    -   Include "New Page" button (contextual to current library or parent page).
4.  **Sidebar Toggle & States**:
    -   Sidebar should be collapsible to a narrow icon-only view (48px).
    -   On mobile/tablet, sidebar should be overlay or hidden by default.
    -   Sidebar should only appear on authenticated routes that need navigation.

**Verification**:
-   Sidebar displays all libraries correctly.
-   Page tree shows proper hierarchy with expand/collapse.
-   Navigation to libraries and pages works.
-   Sidebar toggle state is preserved.

---

## Step 9: Frontend - Home Page Content

**Goal**: Implement the home page (workbench) content view as defined in `docs/InterfaceDesign.md` Section 7.1.

**Instructions**:
1.  **Home View Component**:
    -   Update `packages/client/src/views/Home.vue` to implement the workbench layout.
    -   Display welcome message with current date (e.g., "Good Morning, User").
2.  **Knowledge Libraries Section**:
    -   Show all libraries with their page count and last updated time.
    -   Each library entry should be clickable to navigate to that library.
    -   Add "New Library" button that triggers library creation.
3.  **Quick Actions Section**:
    -   Implement quick action buttons: New Library, Search, Today's Tasks.
    -   Show recent pages (last accessed pages) with timestamps.
    -   Each recent page should be clickable to navigate directly.
4.  **Pending Tasks Section**:
    -   Aggregate and display all incomplete tasks from all pages.
    -   Show task content and source page name.
    -   Tasks should be checkable (complete them).
5.  **On This Day Section**:
    -   Show pages created on this calendar date in previous years.
    -   Display year and page title.
6.  **Long Unvisited Section**:
    -   Show pages that haven't been accessed in 30+ days.
    -   Help users identify stale content that needs review.

**Verification**:
-   Home page displays all libraries correctly with counts.
-   Recent pages are shown with proper timestamps.
-   Pending tasks are listed and can be completed.
-   Navigation to libraries and pages works.
-   All sections match the design specification.

---

## Step 10: Frontend - Page Content Area

**Goal**: Implement the page content area as defined in `docs/InterfaceDesign.md` Section 5.

**Instructions**:
1.  **Page Content Component**:
    -   Create `packages/client/src/views/page/PageContent.vue` for the main content area.
    -   Implement the page header with breadcrumbs (Library > Parent > Page).
    -   Display page title, tags, and metadata (created/updated times).
2.  **Breadcrumbs**:
    -   Show the full path: Library Name > Parent Page > Current Page.
    -   Each breadcrumb item should be clickable for navigation.
3.  **Page Header**:
    -   Display page icon (if any), title (editable), and tags.
    -   Show creation and last updated timestamps.
    -   Include tag management: display existing tags, allow adding new ones, remove existing ones.
4.  **Content Area Placeholder**:
    -   For Milestone 2, display the raw JSON content or a "Content goes here" placeholder.
    -   Prepare the structure for the rich text editor (to be implemented in Milestone 3).
5.  **Top Right Action Buttons**:
    -   Implement the four action buttons: [i] Info, [h] History, [t] Tasks, [p] Public Access.
    -   For Milestone 2, create placeholder components for these panels that show the UI structure.
6.  **Interaction**:
    -   Allow editing the page title (inline edit).
    -   Allow adding/removing tags via the tag management UI.
    -   Implement save functionality (save title and tag changes).

**Verification**:
-   Page content area displays correctly with proper header.
-   Breadcrumbs reflect the page hierarchy and are clickable.
-   Title editing works and saves.
-   Tag management works (add/remove).
-   Action buttons are present and show placeholder panels.
-   Content area shows placeholder or raw JSON data.
