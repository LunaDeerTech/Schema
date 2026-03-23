import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import CommandList from '../CommandList.vue'
import {
  TextOutline,
  ListOutline,
  ListCircleOutline,
  CheckboxOutline,
  CodeSlashOutline,
  ChatboxEllipsesOutline,
  ImageOutline,
  GridOutline,
  DocumentTextOutline,
  InformationCircleOutline,
  WarningOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  CalculatorOutline,
} from '@vicons/ionicons5'

export interface CommandItem {
  title: string
  description?: string
  icon: any
  group: string
  keywords?: string[]
  command: (params: { editor: any; range: any }) => void
}

const allItems: CommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: TextOutline,
    group: 'Headings',
    keywords: ['h1', 'title', 'big'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: TextOutline,
    group: 'Headings',
    keywords: ['h2', 'subtitle'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: TextOutline,
    group: 'Headings',
    keywords: ['h3', 'subheading'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
  },
  {
    title: 'Bullet List',
    description: 'Unordered list',
    icon: ListOutline,
    group: 'Lists',
    keywords: ['ul', 'unordered', 'bullet'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Ordered List',
    description: 'Numbered list',
    icon: ListCircleOutline,
    group: 'Lists',
    keywords: ['ol', 'numbered', 'number'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'Task List',
    description: 'Checklist with toggles',
    icon: CheckboxOutline,
    group: 'Lists',
    keywords: ['todo', 'checkbox', 'check'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: 'Code Block',
    description: 'Syntax highlighted code',
    icon: CodeSlashOutline,
    group: 'Blocks',
    keywords: ['code', 'pre', 'syntax', 'snippet'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: 'Blockquote',
    description: 'Quoted text block',
    icon: ChatboxEllipsesOutline,
    group: 'Blocks',
    keywords: ['quote', 'cite'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: 'Info',
    description: 'Informational callout',
    icon: InformationCircleOutline,
    group: 'Callouts',
    keywords: ['admonition', 'info', 'note', 'tip'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertAdmonition({ type: 'info' }).run()
    },
  },
  {
    title: 'Warning',
    description: 'Warning callout',
    icon: WarningOutline,
    group: 'Callouts',
    keywords: ['admonition', 'warning', 'caution', 'alert'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertAdmonition({ type: 'warning' }).run()
    },
  },
  {
    title: 'Success',
    description: 'Success callout',
    icon: CheckmarkCircleOutline,
    group: 'Callouts',
    keywords: ['admonition', 'success', 'done', 'complete'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertAdmonition({ type: 'success' }).run()
    },
  },
  {
    title: 'Danger',
    description: 'Danger callout',
    icon: CloseCircleOutline,
    group: 'Callouts',
    keywords: ['admonition', 'danger', 'error', 'critical'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertAdmonition({ type: 'danger' }).run()
    },
  },
  {
    title: 'Image',
    description: 'Upload or embed image',
    icon: ImageOutline,
    group: 'Insert',
    keywords: ['image', 'picture', 'photo', 'img'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const event = new CustomEvent('open-image-uploader', {
        detail: { pos: editor.view.coordsAtPos(editor.state.selection.from) },
      })
      window.dispatchEvent(event)
    },
  },
  {
    title: 'Inline Image',
    description: 'Insert image within text',
    icon: ImageOutline,
    group: 'Insert',
    keywords: ['inline', 'image', 'picture', 'photo', 'img', 'icon'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const event = new CustomEvent('open-image-uploader', {
        detail: {
          pos: editor.view.coordsAtPos(editor.state.selection.from),
          inline: true,
        },
      })
      window.dispatchEvent(event)
    },
  },
  {
    title: 'Table',
    description: '3×3 table with header',
    icon: GridOutline,
    group: 'Insert',
    keywords: ['table', 'grid', 'spreadsheet'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
  },
  {
    title: 'Block Formula',
    description: 'Display math equation',
    icon: CalculatorOutline,
    group: 'Insert',
    keywords: ['math', 'formula', 'equation', 'latex', 'katex', 'block'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertMathBlock().run()
    },
  },
  {
    title: 'Inline Formula',
    description: 'Inline math expression',
    icon: CalculatorOutline,
    group: 'Insert',
    keywords: ['math', 'formula', 'inline', 'latex', 'katex'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertMathInline().run()
    },
  },
  {
    title: 'Import Markdown',
    description: 'Import from Markdown file',
    icon: DocumentTextOutline,
    group: 'Insert',
    keywords: ['markdown', 'md', 'import', 'paste'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const event = new CustomEvent('open-markdown-importer', {
        detail: { pos: editor.view.coordsAtPos(editor.state.selection.from) },
      })
      window.dispatchEvent(event)
    },
  },
]

function matchesQuery(item: CommandItem, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  if (item.title.toLowerCase().includes(q)) return true
  if (item.group.toLowerCase().includes(q)) return true
  if (item.keywords?.some((k) => k.includes(q))) return true
  if (item.description?.toLowerCase().includes(q)) return true
  return false
}

const getSuggestionItems = ({ query }: { query: string }) => {
  return allItems.filter((item) => matchesQuery(item, query))
}

const renderSuggestion = () => {
  let component: any
  let popup: any

  return {
    onStart: (props: any) => {
      component = new VueRenderer(CommandList, {
        props,
        editor: props.editor,
      })

      if (!props.clientRect) {
        return
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => props.editor.view.dom.parentNode || document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })
    },

    onUpdate(props: any) {
      component.updateProps(props)

      if (!props.clientRect) {
        return
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide()

        return true
      }

      return component.ref?.onKeyDown(props)
    },

    onExit() {
      popup[0].destroy()
      component.destroy()
    },
  }
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export default SlashCommand.configure({
    suggestion: {
        items: getSuggestionItems,
        render: renderSuggestion,
    }
})
