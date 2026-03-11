<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { CustomLink } from './extensions/custom-link'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { ImageBlock } from './extensions/image-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { CodeBlockWithCopy } from './extensions/code-block'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import SlashCommand from './extensions/slash-command'
import PageReference from './extensions/page-reference'
import { Admonition } from './extensions/admonition'
import { MathBlock, MathInline } from './extensions/math-block'
import { common, createLowlight } from 'lowlight'
import 'katex/dist/katex.min.css'
import { ref, nextTick, onBeforeUnmount, onMounted, toRaw, watch } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { uploadApi } from '@/api/upload'
import {
  CodeSlashOutline as CodeSlash,
  ListOutline as List,
  ListCircleOutline as ListCircle,
  ChatboxEllipsesOutline,
  ArrowBackOutline,
  ArrowForwardOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  TrashOutline,
  GitMergeOutline,
  GitNetworkOutline,
  RemoveCircleOutline,
  LinkOutline,
} from '@vicons/ionicons5'

import ImageUploaderPopover from './ImageUploaderPopover.vue'
import MarkdownImporter from './MarkdownImporter.vue'
import TableOfContents from './TableOfContents.vue'
import LinkBubbleMenu from './LinkBubbleMenu.vue'
import { marked } from 'marked'

const lowlight = createLowlight(common)
const message = useMessage()

interface Props {
  content?: any
  editable?: boolean
  pageId?: string
  libraryId?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  editable: true,
})

const emit = defineEmits<{
  (e: 'update', content: any): void
}>()

const router = useRouter()
const route = useRoute()

const showImageUploader = ref(false)
const uploaderPosition = ref({ top: 0, bottom: 0, left: 0 })
const wrapperRef = ref<HTMLElement | null>(null)
const showMarkdownImporter = ref(false)
const linkBubbleRef = ref<InstanceType<typeof LinkBubbleMenu> | null>(null)

// Debug props
console.debug('TiptapEditor props:', { pageId: props.pageId, libraryId: props.libraryId });
console.debug('TiptapEditor content type:', typeof props.content);
console.debug('TiptapEditor content:', props.content);

const handleOpenImageUploader = (e: Event) => {
    const customEvent = e as CustomEvent
    const { left, bottom, top } = customEvent.detail.pos
    
    console.debug('handleOpenImageUploader - props:', { pageId: props.pageId, libraryId: props.libraryId });
    
    if (wrapperRef.value) {
        const wrapperRect = wrapperRef.value.getBoundingClientRect()
        uploaderPosition.value = { 
            top: top - wrapperRect.top,
            bottom: bottom - wrapperRect.top,
            left: left - wrapperRect.left 
        }
    } else {
        uploaderPosition.value = { top: top, bottom: bottom, left: left }
    }
    showImageUploader.value = true
}

const handleInsertImage = (url: string) => {
    if (editor.value) {
        editor.value.chain().focus().setImage({ src: url }).run()
    }
}

const handleOpenMarkdownImporter = () => {
    showMarkdownImporter.value = true
}

// Handle page reference clicks
const handlePageReferenceClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const refEl = target.closest('a[data-type="page-reference"]') as HTMLAnchorElement | null
  if (!refEl) return
  
  // In editable mode, require Ctrl/Cmd+Click to navigate
  if (props.editable && !event.ctrlKey && !event.metaKey) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const pageId = refEl.getAttribute('data-id')
  if (!pageId) return
  
  // Determine if we're in public mode
  const isPublicMode = route.path.startsWith('/public')
  
  if (isPublicMode) {
    // In public mode, navigate to public page (API supports both slug and id)
    router.push(`/public/pages/${pageId}`)
  } else {
    // In editor/auth mode, navigate to the page
    router.push(`/page/${pageId}`)
  }
}

const handleImportMarkdown = async (content: string) => {
    if (editor.value) {
        try {
            // Convert markdown to HTML
            const html = await marked(content)
            
            // Get current position
            const { from } = editor.value.state.selection
            
            // Insert HTML content at current position
            editor.value.chain().focus().insertContentAt(from, html).run()
            
            message.success('Markdown导入成功')
        } catch (error) {
            console.error('Failed to parse markdown:', error)
            message.error('Markdown解析失败')
        }
    }
}

onMounted(() => {
    window.addEventListener('open-image-uploader', handleOpenImageUploader)
    window.addEventListener('open-markdown-importer', handleOpenMarkdownImporter)
    // Listen for page reference clicks on the wrapper
    wrapperRef.value?.addEventListener('click', handlePageReferenceClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-image-uploader', handleOpenImageUploader)
  window.removeEventListener('open-markdown-importer', handleOpenMarkdownImporter)
  wrapperRef.value?.removeEventListener('click', handlePageReferenceClick)
  // editor.value?.destroy() // useEditor handles destruction automatically
})

// Toggle link on selected text via bubble menu
const toggleLink = () => {
  if (!editor.value) return
  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
  } else {
    const url = ''
    // Set an empty link first, then show the edit popover
    editor.value.chain().focus().setLink({ href: url }).run()
    // After setting the link, find the link element and show the bubble menu for editing
    nextTick(() => {
      const { state } = editor.value!
      const { from } = state.selection
      const resolved = state.doc.resolve(from)
      const marks = resolved.marks()
      const linkMark = marks.find(m => m.type.name === 'link')
      if (linkMark) {
        // Find the DOM element for the current selection
        const domAtPos = editor.value!.view.domAtPos(from)
        const parentEl = domAtPos.node instanceof HTMLElement ? domAtPos.node : domAtPos.node.parentElement
        const linkEl = parentEl?.closest('span.editor-link') || parentEl?.querySelector('span.editor-link')
        if (linkEl) {
          const text = linkEl.textContent || ''
          linkBubbleRef.value?.show(url, text, linkEl as HTMLElement, true)
        }
      }
    })
  }
}

const editor = useEditor({
  content: props.content ? toRaw(props.content) : '',
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      codeBlock: false, // Disable default codeBlock to use lowlight
    }),
    Placeholder.configure({
      placeholder: "Type '/' for commands...",
    }),
    CustomLink.configure({
      openOnClick: false,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    ImageBlock,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CodeBlockWithCopy.configure({
      lowlight,
    }),
    BubbleMenuExtension,
    SlashCommand,
    PageReference,
    Admonition,
    MathBlock,
    MathInline,
  ],
  onUpdate: ({ editor }: { editor: any }) => {
    emit('update', editor.getJSON())
  },
  editorProps: {
    handleClick: (_view, _pos, event) => {
      const target = event.target as HTMLElement
      const refEl = target.closest('a[data-type="page-reference"]') as HTMLAnchorElement | null
      if (refEl) {
        // Prevent ProseMirror default handling for page references
        event.preventDefault()
        return true
      }
      // Handle click on editor-link: show link bubble menu
      const linkEl = target.closest('span.editor-link') as HTMLElement | null
      if (linkEl && !event.ctrlKey && !event.metaKey) {
        const href = linkEl.getAttribute('data-link-href') || ''
        const text = linkEl.textContent || ''
        linkBubbleRef.value?.show(href, text, linkEl)
        return true
      }
      // Click outside a link — hide popover
      linkBubbleRef.value?.hide()
      return false
    },
    handleDrop: (view, event, _ , moved) => {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0]
        if (file.type.startsWith('image/')) {
          event.preventDefault() // Prevent default browser behavior (download)
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (coordinates) {
             console.debug('handleDrop - uploading with pageId:', props.pageId, 'libraryId:', props.libraryId);
             uploadApi.uploadImage(file, props.pageId, props.libraryId).then(res => {
                 const url = res.url || (res.data && res.data.url)
                 if (url) {
                    const { schema } = view.state
                    const node = schema.nodes.image.create({ src: url })
                    const transaction = view.state.tr.insert(coordinates.pos, node)
                    view.dispatch(transaction)
                 }
             }).catch(err => {
                 console.error(err)
                 message.error('Image upload failed')
             })
             return true
          }
        }
      }
      return false
    }
  }
})

// Watch for content changes (e.g., when restoring a version)
// Only update if content is actually different to avoid cursor jumps during auto-save
let lastContentHash = ''
watch(() => props.content, (newContent) => {
  console.debug('TiptapEditor content changed:', newContent);
  console.debug('TiptapEditor content type:', typeof newContent);

  if (editor.value && newContent) {
    // Create a simple hash to compare content
    const contentString = JSON.stringify(newContent)
    const currentHash = editor.value.getJSON ? JSON.stringify(editor.value.getJSON()) : ''

    // Only update if content is different and not just a re-render
    if (contentString !== currentHash && contentString !== lastContentHash) {
      console.debug('Updating editor content (content actually changed)');
      editor.value.commands.setContent(toRaw(newContent))
      lastContentHash = contentString
    } else {
      console.debug('Skipping editor update (content unchanged)');
    }
  }
})

</script>

<template>
  <div class="editor-wrapper" ref="wrapperRef">
    <table-of-contents :editor="editor" />
    <image-uploader-popover
      :visible="showImageUploader"
      :position="uploaderPosition"
      :page-id="pageId"
      :library-id="libraryId"
      @close="showImageUploader = false"
      @insert="handleInsertImage"
    />
    
    <markdown-importer
      v-model:show="showMarkdownImporter"
      @import="handleImportMarkdown"
    />
    
    <bubble-menu
      v-if="editor && editable"
      :editor="editor"
      :tippy-options="{ duration: 100, appendTo: 'parent' }"
      :should-show="({ state }) => {
        const { selection } = state
        return !selection.empty && selection instanceof TextSelection
      }"
      class="bubble-menu"
    >
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        title="Bold"
      >
        B
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        title="Italic"
      >
        I
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        title="Strike"
      >
        S
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        title="Code"
      >
        <n-icon><CodeSlash /></n-icon>
      </button>
      
      <div class="divider"></div>
      
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        title="H1"
      >
        H1
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        title="H2"
      >
        H2
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        title="H3"
      >
        H3
      </button>
      
      <div class="divider"></div>
      
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        title="Bullet List"
      >
        <n-icon><List /></n-icon>
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        title="Ordered List"
      >
        <n-icon><ListCircle /></n-icon>
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        title="Blockquote"
      >
        <n-icon><ChatboxEllipsesOutline /></n-icon>
      </button>
      
      <div class="divider"></div>
      
      <button
        @click="toggleLink"
        :class="{ 'is-active': editor.isActive('link') }"
        title="Link"
      >
        <n-icon><LinkOutline /></n-icon>
      </button>
    </bubble-menu>

    <bubble-menu
      v-if="editor && editable"
      :editor="editor"
      :tippy-options="{ duration: 100, appendTo: 'parent' }"
      :should-show="({ editor, state }) => {
        const { selection } = state
        const isTable = editor.isActive('table')
        const isText = selection instanceof TextSelection
        if (!isTable) return false
        if (isText && !selection.empty) return false
        return true
      }"
      class="bubble-menu table-menu"
    >
      <button @click="editor.chain().focus().addColumnBefore().run()" title="Add Column Before">
        <n-icon><ArrowBackOutline /></n-icon>
      </button>
      <button @click="editor.chain().focus().addColumnAfter().run()" title="Add Column After">
        <n-icon><ArrowForwardOutline /></n-icon>
      </button>
      <button @click="editor.chain().focus().deleteColumn().run()" title="Delete Column">
        <n-icon><RemoveCircleOutline /></n-icon>
      </button>
      <div class="divider"></div>
      <button @click="editor.chain().focus().addRowBefore().run()" title="Add Row Before">
        <n-icon><ArrowUpOutline /></n-icon>
      </button>
      <button @click="editor.chain().focus().addRowAfter().run()" title="Add Row After">
        <n-icon><ArrowDownOutline /></n-icon>
      </button>
      <button @click="editor.chain().focus().deleteRow().run()" title="Delete Row">
        <n-icon><RemoveCircleOutline /></n-icon>
      </button>
      <div class="divider"></div>
      <button @click="editor.chain().focus().mergeCells().run()" title="Merge Cells">
        <n-icon><GitMergeOutline /></n-icon>
      </button>
      <button @click="editor.chain().focus().splitCell().run()" title="Split Cell">
        <n-icon><GitNetworkOutline /></n-icon>
      </button>
      <div class="divider"></div>
      <button @click="editor.chain().focus().deleteTable().run()" title="Delete Table">
        <n-icon><TrashOutline /></n-icon>
      </button>
    </bubble-menu>

    <editor-content :editor="editor" class="editor-content" />
    <link-bubble-menu v-if="editor && editable" ref="linkBubbleRef" :editor="editor" />
  </div>
</template>

<style lang="scss">
.editor-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  
  .bubble-menu {
    display: flex;
    background-color: var(--color-bg-elevated);
    padding: 0.2rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow-float);
    border: 1px solid var(--color-border);

    button {
      border: none;
      background: none;
      color: var(--color-cmd-btn-text);
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.4rem 0.6rem;
      border-radius: 0.3rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: var(--color-cmd-btn-hover-bg);
        color: var(--color-cmd-btn-hover-text);
      }

      &.is-active {
        background-color: var(--color-cmd-btn-active-bg);
        color: var(--color-cmd-btn-hover-text);
      }
    }
    
    .divider {
      width: 1px;
      background-color: var(--color-border);
      margin: 0 0.2rem;
    }
  }

  .editor-content {
    height: 100%;
    outline: none;
    
    .ProseMirror {
      outline: none;
      min-height: 150px;
      padding-bottom: 100px; /* Space for scrolling */
      
      /* Typography based on InterfaceDesign.md */
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text-body);
      
      p {
        margin-bottom: 1em;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        line-height: 1.3;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: var(--color-text-heading);
      }
      
      h1 { font-size: 32px; }
      h2 { font-size: 24px; }
      h3 { font-size: 20px; }
      h4 { font-size: 16px; }
      
      ul, ol {
        padding-left: 1.5em;
        margin-bottom: 1em;
      }
      
      li {
        margin-bottom: 0.5em;
      }
      
      /* Task List */
      ul[data-type="taskList"] {
        list-style: none;
        padding: 0;
        
        li {
          display: flex;
          align-items: flex-start;
          
          > label {
            margin-right: 0.5em;
            user-select: none;
            input {
              margin-top: 0.3em;
            }
          }
          
          > div {
            flex: 1;
          }
        }
      }
      
      /* Inline Code — only style code that is NOT inside a pre (code block) */
      code:not(pre code) {
        font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
        font-size: 0.9em;
        background-color: var(--color-bg-inline-code);
        border-radius: 4px;
        padding: 0.15em 0.4em;
        margin: 0 0.1em;
        color: var(--color-text-code);
      }

      /* Code Block styles moved to CodeBlockView.vue */
      
      /* Blockquote */
      blockquote {
        border-left: 3px solid var(--color-blockquote-border);
        margin-left: 0;
        padding-left: 1em;
        color: var(--color-blockquote-text);
      }

      /* Admonitions */
      [data-admonition] {
        margin: 1em 0;

        .admonition-content {
          border-radius: 8px;
          border: 1px solid;
          padding: 12px 16px;
          position: relative;

          .admonition-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;

            .admonition-title {
              font-weight: 600;
            }
          }

          .admonition-body {
            font-size: 14px;
            line-height: 1.6;
            color: var(--color-admonition-body);

            p {
              margin: 0;

              &:first-child {
                margin-top: 0;
              }

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
      
      /* Placeholder */
      p.is-editor-empty:first-child::before {
        color: var(--color-text-faint);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
      
      /* Links — rendered as <span> to prevent browser default link behavior */
      span.editor-link {
        color: var(--color-text-link);
        text-decoration: none;
        border-bottom: 1px solid var(--color-link-underline);
        cursor: pointer;
        transition: background-color 0.15s, border-color 0.15s;
        padding-bottom: 1px;
        
        &:hover {
          background-color: var(--color-link-hover-bg);
          border-bottom-color: var(--color-text-link);
        }
      }

      /* Page References */
      a.page-reference {
        color: var(--color-text-link);
        background-color: var(--color-page-ref-bg);
        border-radius: 4px;
        padding: 1px 4px;
        text-decoration: none;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.15s ease;
        
        &:hover {
          background-color: var(--color-page-ref-hover);
          text-decoration: none;
        }
      }
      
      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
      }

      /* Table Styles */
      table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        margin: 0;
        overflow: hidden;

        td,
        th {
          min-width: 1em;
          border: 2px solid var(--color-border-table);
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;

          > * {
            margin-bottom: 0;
          }
        }

        th {
          font-weight: bold;
          text-align: left;
          background-color: var(--color-bg-table-th);
        }

        .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: var(--color-bg-table-selected);
          pointer-events: none;
        }

        .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--color-bg-table-resize);
          pointer-events: none;
        }
      }
    }
  }
}
</style>
