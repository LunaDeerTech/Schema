import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import AdmonitionView from './AdmonitionView.vue'

export interface AdmonitionOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    admonition: {
      /**
       * Insert an admonition block
       */
      insertAdmonition: (options?: { type?: string; title?: string }) => ReturnType
      /**
       * Toggle an admonition block
       */
      toggleAdmonition: (options?: { type?: string; title?: string }) => ReturnType
    }
  }
}

export const Admonition = Node.create<AdmonitionOptions>({
  name: 'admonition',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
      title: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.title) return {}
          return {
            'data-title': attributes.title,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-admonition]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-admonition': '' }, 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(AdmonitionView as any)
  },

  addCommands() {
    return {
      insertAdmonition:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              type: options.type || 'info',
              title: options.title || null,
            },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Type Something',
                  },
                ],
              },
            ],
          })
        },
      toggleAdmonition:
        (options = {}) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, this.name, {
            type: options.type || 'info',
            title: options.title || null,
          })
        },
    }
  },
})
