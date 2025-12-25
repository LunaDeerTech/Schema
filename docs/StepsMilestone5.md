# Milestone 5: Public Access & Export

**Goal**: Enable sharing knowledge with the outside world via public links and exporting content for offline use.

**References**:
- `docs/Guidelines.md` (Phase 5)
- `docs/InterfaceDesign.md` (Section 6.4: Public Access Settings, Section 7.3: Public Access Page)

---

## Step 1: Public Access Backend

**Goal**: Create APIs to manage public status and serve public content without authentication.

**Instructions**:
1.  **Database Schema Check**:
    -   Ensure `Page` and `Library` tables have `isPublic` (INTEGER - 0/1) and `publicSlug` (TEXT, UNIQUE) columns.
2.  **Public Service (`PublicService`)**:
    -   `togglePublic(id, type: 'page' | 'library', status: boolean)`:
        -   If turning ON, generate a random unique `publicSlug` (e.g., using `nanoid` or UUID shortener) if one doesn't exist.
        -   Update `isPublic` status.
    -   `getPublicPage(slug)`:
        -   Find page by `publicSlug`.
        -   **Security Check**: Ensure `isPublic` is true.
        -   Return sanitized content (remove internal metadata if sensitive).
    -   `getPublicLibrary(slug)`:
        -   Find library by `publicSlug`.
        -   Return library details and public page tree.
3.  **Public Controller (`PublicController`)**:
    -   `GET /api/v1/public/pages/:slug`: Open access (No `JwtAuthGuard`).
    -   `GET /api/v1/public/libraries/:slug`: Open access.
    -   `POST /api/v1/pages/:id/public`: Protected (Toggle status).

**Verification**:
-   Can toggle a page to public via authenticated API.
-   Can access the page via `/api/v1/public/pages/:slug` without a token.
-   Cannot access private pages via the public API.

---

## Step 2: Public Access Frontend (Management)

**Goal**: Allow users to control public settings from the Page UI.

**Instructions**:
1.  **Public Settings Panel**:
    -   Create `src/components/page/PublicSettings.vue`.
    -   Trigger: `[p]` button in Page Header.
    -   UI:
        -   Toggle Switch: "Public Access".
        -   Input: Display the public URL (e.g., `https://schema.app/public/:slug`).
        -   Button: "Copy Link".
        -   Button: "Regenerate Slug" (Optional).
2.  **Integration**:
    -   Connect to `PageHeader.vue`.
    -   Call `togglePublic` API on switch change.

**Verification**:
-   Turning the switch ON generates a link.
-   Copying the link and opening in an Incognito window works (after Step 3 is done).

---

## Step 3: Public Access Frontend (Public View)

**Goal**: Create a dedicated, read-only layout for public visitors.

**Instructions**:
1.  **Public Layout**:
    -   Create `src/layouts/PublicLayout.vue`.
    -   Simplified header: Logo, "Powered by Schema".
    -   No sidebar (or simplified TOC), no user menu, no edit controls.
2.  **Public Page Route**:
    -   Add route: `/public/:slug`.
    -   Component: `src/pages/public/PublicPage.vue`.
    -   Use `PublicLayout`.
3.  **Read-Only Editor**:
    -   Reuse `TiptapEditor.vue` but force `readonly=true`.
    -   Ensure all editing toolbars are hidden.
    -   Ensure "Slash commands" are disabled.

**Verification**:
-   Visit a public link in Incognito mode.
-   Page loads with content.
-   Cannot edit content.
-   UI matches `InterfaceDesign.md` Section 7.3.

---

## Step 4: Export Functionality (Markdown)

**Goal**: Allow users to download their content as Markdown files.

**Instructions**:
1.  **Markdown Converter**:
    -   Create utility `src/utils/tiptap-to-markdown.ts`.
    -   Use a library like `prosemirror-markdown` or write a custom serializer to convert Tiptap JSON to Markdown string.
    -   Handle: Headings, Lists, Bold/Italic, Code Blocks, Links.
2.  **Export Action**:
    -   In `PageInfo` panel (`[i]` button), add "Export as Markdown".
    -   On click:
        -   Convert current content to Markdown.
        -   Trigger browser download (`blob` -> `a.download`).
        -   Filename: `PageTitle.md`.

**Verification**:
-   Create a page with various formatting.
-   Export to Markdown.
-   Open file in VS Code or another Markdown reader. Content structure should be preserved.

---

## Step 5: Data Backup (JSON Export)

**Goal**: Allow users to export their entire data for safety.

**Instructions**:
1.  **Backend Backup API**:
    -   `GET /api/v1/backup/export`:
        -   Fetch ALL user data (Libraries, Pages, Tags).
        -   Bundle into a single JSON object or a ZIP file.
        -   Return as a downloadable stream.
2.  **Frontend Settings**:
    -   In `Settings > Data Management`.
    -   Add "Export All Data" button.

**Verification**:
-   Clicking "Export All Data" downloads a file.
-   File contains all pages and libraries in a structured format.
