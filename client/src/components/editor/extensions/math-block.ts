import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MathBlockView from './MathBlockView.vue'
import MathInlineView from './MathInlineView.vue'

// ── Block Math (display mode, $$ ... $$) ──────────────────────────

export interface MathBlockOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      insertMathBlock: (options?: { latex?: string }) => ReturnType
    }
    mathInline: {
      insertMathInline: (options?: { latex?: string }) => ReturnType
    }
  }
}

export const MathBlock = Node.create<MathBlockOptions>({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-latex') || '',
        renderHTML: (attrs) => ({ 'data-latex': attrs.latex }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-math-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-math-block': '' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathBlockView as any)
  },

  addCommands() {
    return {
      insertMathBlock:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex: options.latex || '' },
          }),
    }
  },

  addInputRules() {
    // Type $$ at the start of a line to create a block math node
    return []
  },
})

// ── Inline Math ($ ... $) ──────────────────────────────────────────

export interface MathInlineOptions {
  HTMLAttributes: Record<string, any>
}

export const MathInline = Node.create<MathInlineOptions>({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-latex') || '',
        renderHTML: (attrs) => ({ 'data-latex': attrs.latex }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-math-inline]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-math-inline': '' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathInlineView as any)
  },

  addCommands() {
    return {
      insertMathInline:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex: options.latex || '' },
          }),
    }
  },
})
