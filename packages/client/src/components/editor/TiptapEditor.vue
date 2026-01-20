<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { ImageBlock } from './extensions/image-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import SlashCommand from './extensions/slash-command'
import PageReference from './extensions/page-reference'
import { common, createLowlight } from 'lowlight'
import { ref, onBeforeUnmount, onMounted, toRaw } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
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
} from '@vicons/ionicons5'

import ImageUploaderPopover from './ImageUploaderPopover.vue'

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

const showImageUploader = ref(false)
const uploaderPosition = ref({ top: 0, bottom: 0, left: 0 })
const wrapperRef = ref<HTMLElement | null>(null)

// Debug props
console.log('TiptapEditor props:', { pageId: props.pageId, libraryId: props.libraryId });

const handleOpenImageUploader = (e: Event) => {
    const customEvent = e as CustomEvent
    const { left, bottom, top } = customEvent.detail.pos
    
    console.log('handleOpenImageUploader - props:', { pageId: props.pageId, libraryId: props.libraryId });
    
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

onMounted(() => {
    window.addEventListener('open-image-uploader', handleOpenImageUploader)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-image-uploader', handleOpenImageUploader)
  // editor.value?.destroy() // useEditor handles destruction automatically
})

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
    Link.configure({
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
    CodeBlockLowlight.configure({
      lowlight,
    }),
    BubbleMenuExtension,
    SlashCommand,
    PageReference,
  ],
  onUpdate: ({ editor }: { editor: any }) => {
    emit('update', editor.getJSON())
  },
  editorProps: {
    handleDrop: (view, event, _ , moved) => {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0]
        if (file.type.startsWith('image/')) {
          event.preventDefault() // Prevent default browser behavior (download)
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (coordinates) {
             console.log('handleDrop - uploading with pageId:', props.pageId, 'libraryId:', props.libraryId);
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

</script>

<template>
  <div class="editor-wrapper" ref="wrapperRef">
    <image-uploader-popover
      :visible="showImageUploader"
      :position="uploaderPosition"
      :page-id="pageId"
      :library-id="libraryId"
      @close="showImageUploader = false"
      @insert="handleInsertImage"
    />
    <bubble-menu
      v-if="editor"
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
    </bubble-menu>

    <bubble-menu
      v-if="editor"
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
  </div>
</template>

<style lang="scss">
.editor-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  
  .bubble-menu {
    display: flex;
    background-color: #fff;
    padding: 0.2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;

    button {
      border: none;
      background: none;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.4rem 0.6rem;
      border-radius: 0.3rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #f1f5f9;
        color: #0f172a;
      }

      &.is-active {
        background-color: #e2e8f0; // Active state background
        color: #0f172a; // Active state text color
      }
    }
    
    .divider {
      width: 1px;
      background-color: #e2e8f0;
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
      color: #1F2937; // Main text color
      
      p {
        margin-bottom: 1em;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        line-height: 1.3;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
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
      
      /* Code Block */
      pre {
        background: #F5F7FA;
        border-radius: 4px;
        padding: 1em;
        font-family: "JetBrains Mono", "Fira Code", monospace;
        overflow-x: auto;
        
        code {
          background: none;
          padding: 0;
          font-size: 0.9em;
          color: inherit;
        }
      }
      
      /* Blockquote */
      blockquote {
        border-left: 3px solid #E4E7ED;
        margin-left: 0;
        padding-left: 1em;
        color: #6B7280;
      }
      
      /* Placeholder */
      p.is-editor-empty:first-child::before {
        color: #9CA3AF;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
      
      /* Links */
      a {
        color: #1A73E8;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
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
          border: 2px solid #ced4da;
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
          background-color: #f1f3f5;
        }

        .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }

        .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
