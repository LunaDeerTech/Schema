# Milestone 2: Core Functionality - Libraries & Pages

**Goal**: Implement the core knowledge management structure: Libraries (Knowledge Bases), Hierarchical Pages, and Tags. This includes both backend CRUD operations and the frontend navigation interface (Sidebar, Page Tree).

**References**:
- `docs/Guidelines.md` (Phase 2)
- `docs/InterfaceDesign.md` (Sidebar, Page Layout)
- `docs/ProductDescription.md` (Information Model)

---

## Step 1: Database Schema Expansion

**Goal**: Update the database schema to support Libraries, Pages, and Tags.

**Instructions**:
1.  **Update Prisma Schema**:
    -   Modify `packages/server/prisma/schema.prisma`.
    -   Add models: `Library`, `Page`, `Tag`, `PageTag` (refer to `docs/Guidelines.md` Section 3.2).
    -   Ensure relationships are correctly defined (User -> Libraries, Library -> Pages, Page -> Children, Page -> Tags).
2.  **Migration**:
    -   Run `pnpm prisma migrate dev --name add_core_models`.
    -   Run `pnpm prisma generate`.

**Verification**:
-   Database tables `Library`, `Page`, `Tag`, `PageTag` exist.
-   Prisma Client types are updated.

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
    -   Create `src/services/api/library.ts`: Methods for library CRUD.
    -   Create `src/services/api/page.ts`: Methods for page CRUD.
2.  **Pinia Stores**:
    -   `useLibraryStore`: Fetch and store list of libraries. Handle "current library" selection.
    -   `usePageStore`: Fetch page tree for current library. Store "current page" details.

---

## Step 6: Frontend - Sidebar & Navigation

**Goal**: Implement the main navigation structure (Sidebar).

**Instructions**:
1.  **Layout Component**:
    -   Update `MainLayout.vue` (or equivalent) to include a Sidebar.
2.  **Library Switcher**:
    -   Create `LibraryList.vue` component in Sidebar.
    -   Display list of libraries.
    -   Allow creating a new library.
3.  **Page Tree**:
    -   Create `PageTree.vue` component.
    -   Use a Tree component (from UI library) to display the hierarchy of the selected library.
    -   Implement "Expand/Collapse" and "Select Page".
    -   Add "New Page" button (contextual to library or parent page).

**Verification**:
-   Sidebar displays libraries.
-   Clicking a library loads its page tree.
-   Clicking a page in the tree navigates to the page detail route.

---

## Step 7: Frontend - Page Detail Skeleton

**Goal**: Create the basic view for a Page.

**Instructions**:
1.  **Route**:
    -   Add route `/library/:libraryId/page/:pageId`.
2.  **Page View Component**:
    -   Create `src/views/page/PageDetail.vue`.
    -   **Header**: Display Breadcrumbs (Library > Parent > Page), Title, Last Updated.
    -   **Content Area**: For now, just display the raw JSON content or a "Content goes here" placeholder (Rich Text Editor is Phase 3).
    -   **Meta Info**: Show Tags.
3.  **Interaction**:
    -   Allow editing the Title.
    -   Allow adding/removing Tags.

**Verification**:
-   Navigating to a page URL loads the correct page data.
-   Breadcrumbs correctly reflect the hierarchy.
-   Title can be edited and saved.
