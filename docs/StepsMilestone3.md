# Milestone 3: Rich Text Editor (Tiptap Integration)

**Goal**: Implement a high-quality WYSIWYG editor using Tiptap. This includes basic formatting, a floating toolbar, slash commands, and custom extensions for tasks and page references.

**References**:
- `docs/Guidelines.md` (Phase 3)
- `docs/InterfaceDesign.md` (Section 5: Main Content Area)

---

## Step 1: Tiptap Installation & Basic Setup

**Goal**: Integrate Tiptap into the Page Detail view.

**Instructions**:
1.  **Install Dependencies**:
    -   `@tiptap/vue-3`, `@tiptap/pm`, `@tiptap/starter-kit`.
    -   Additional extensions: `@tiptap/extension-placeholder`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-code-block-lowlight`.
2.  **Create Editor Component**:
    -   Create `src/components/editor/TiptapEditor.vue`.
    -   Initialize `useEditor` with `StarterKit`.
    -   Bind `content` prop to the editor content.
    -   Emit `update` event on content change.
3.  **Styling**:
    -   Add basic CSS for the editor (ProseMirror class) to ensure headings, lists, and paragraphs look correct (refer to `docs/InterfaceDesign.md` typography).
    -   Style the `Placeholder` extension ("Type '/' for commands...").

**Verification**:
-   Can type text in the editor.
-   Basic markdown shortcuts work (e.g., `# ` for H1, `- ` for list).
-   Content updates are emitted to the parent component.

---

## Step 2: Floating Toolbar (Bubble Menu)

**Goal**: Show a formatting toolbar when text is selected.

**Instructions**:
1.  **Component**:
    -   Use `<bubble-menu>` component from `@tiptap/vue-3`.
2.  **Buttons**:
    -   Add buttons for: Bold, Italic, Strike, Code, H1, H2, H3, Bullet List, Ordered List, Blockquote.
3.  **Logic**:
    -   Bind buttons to editor commands (e.g., `editor.chain().focus().toggleBold().run()`).
    -   Add "active" states to buttons (highlight when the cursor is in that format).

**Verification**:
-   Selecting text reveals the toolbar.
-   Clicking buttons applies formatting.
-   Toolbar disappears when selection is cleared.

---

## Step 3: Slash Command Menu

**Goal**: Implement a menu triggered by typing `/` to insert blocks.

**Instructions**:
1.  **Extension Setup**:
    -   Create a custom extension or use a library like `tiptap-extension-slash-command` (or implement using `Suggestion` utility from Tiptap).
    -   Trigger character: `/`.
2.  **Menu Component**:
    -   Create `CommandList.vue`.
    -   Items: Heading 1-3, Bullet List, Numbered List, Task List, Code Block, Quote, Image, Page Reference.
3.  **Keyboard Navigation**:
    -   Support Up/Down arrows to select items.
    -   Enter to execute command.

**Verification**:
-   Typing `/` opens the menu.
-   Can navigate and select an item.
-   Selecting an item inserts the corresponding block and removes the `/`.

---

## Step 4: Custom Extensions (Tasks & References)

**Goal**: Implement specific Schema features: Task items and Page links.

**Instructions**:
1.  **Task List**:
    -   Configure `TaskList` and `TaskItem` extensions.
    -   Style the checkboxes.
2.  **Page Reference (@mention)**:
    -   Create a custom extension based on Tiptap's `Mention` extension.
    -   Trigger character: `@` (or via Slash command).
    -   **Backend**: Create an API endpoint `GET /api/v1/search/suggestions` to search pages by title.
    -   **Frontend**: Fetch suggestions as user types after `@`.
    -   **Rendering**: Render as a link to the page (internal router link).

**Verification**:
-   Can create task lists `[] `.
-   Typing `@` opens a page search popup.
-   Selecting a page inserts a link to it.

---

## Step 5: Image Upload

**Goal**: Allow pasting or uploading images.

**Instructions**:
1.  **Backend**:
    -   Create `UploadModule` (NestJS).
    -   Endpoint `POST /api/v1/upload`: Accepts `multipart/form-data`, saves file (local storage or S3), returns URL.
2.  **Frontend**:
    -   Implement a custom `uploadImage` handler for Tiptap.
    -   Handle `drop` and `paste` events in the editor.
    -   When an image is dropped/pasted, upload it to the backend, then insert the image node with the returned URL.

**Verification**:
-   Can drag and drop an image into the editor.
-   Image is uploaded and displayed.

---

## Step 6: Auto-Save & Persistence

**Goal**: Save content automatically without explicit "Save" button.

**Instructions**:
1.  **Logic**:
    -   In `PageDetail.vue` (or a composable), watch for editor updates.
    -   Use `lodash/debounce` (e.g., 1000ms) to trigger the save API call.
    -   Call `pageApi.updatePage(id, { content: json })`.
2.  **UI Feedback**:
    -   Show "Saving..." -> "Saved" indicator in the header.

**Verification**:
-   Typing stops -> "Saving..." appears -> "Saved" appears.
-   Reloading the page shows the new content.

---

## Step 7: Code Block Highlighting

**Goal**: Syntax highlighting for code blocks.

**Instructions**:
1.  **Setup**:
    -   Install `lowlight` (common).
    -   Configure `CodeBlockLowlight` extension.
    -   Import CSS for syntax highlighting (e.g., a GitHub theme).
2.  **Language Selection**:
    -   (Optional) Add a dropdown to the code block to select language manually.

**Verification**:
-   Code blocks have syntax colors.
