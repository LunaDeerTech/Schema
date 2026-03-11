import Link from '@tiptap/extension-link'
import { mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * Custom Link extension that renders links as <span> elements
 * instead of <a> tags to prevent default browser navigation.
 *
 * - Single click: shows link detail popover (handled externally)
 * - Double click / Ctrl+click: opens the link
 */
export const CustomLink = Link.extend({
  // Render as <span> with a data-href attribute to avoid browser link behavior
  renderHTML({ HTMLAttributes }) {
    const { href, target, rel, ...rest } = HTMLAttributes
    return [
      'span',
      mergeAttributes(rest, {
        'data-link-href': href,
        'class': 'editor-link',
      }),
      0,
    ]
  },

  // Parse both <a> and <span data-link-href> so existing content still works
  parseHTML() {
    return [
      {
        tag: 'a[href]:not([data-type="page-reference"])',
        getAttrs: (dom: HTMLElement) => {
          const href = dom.getAttribute('href')
          if (!href) return false
          return { href }
        },
      },
      {
        tag: 'span[data-link-href]',
        getAttrs: (dom: HTMLElement) => {
          const href = dom.getAttribute('data-link-href')
          if (!href) return false
          return { href }
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? []
    const isEditable = this.editor.isEditable

    const clickHandler = new Plugin({
      key: new PluginKey('customLinkClick'),
      props: {
        handleDOMEvents: {
          // Double-click opens link
          dblclick: (_view, event) => {
            const target = event.target as HTMLElement
            const linkEl = target.closest('span.editor-link') as HTMLElement | null
            if (!linkEl) return false
            const href = linkEl.getAttribute('data-link-href')
            if (href) {
              window.open(href, '_blank', 'noopener,noreferrer')
              event.preventDefault()
              return true
            }
            return false
          },
          // Ctrl/Cmd + click opens link in editable mode; any click opens in read-only mode
          click: (_view, event) => {
            const target = event.target as HTMLElement
            const linkEl = target.closest('span.editor-link') as HTMLElement | null
            if (!linkEl) return false
            const href = linkEl.getAttribute('data-link-href')
            if (!href) return false

            // In non-editable mode, single click opens the link
            if (!isEditable) {
              window.open(href, '_blank', 'noopener,noreferrer')
              event.preventDefault()
              return true
            }

            // In editable mode, only Ctrl/Cmd + click opens the link
            if (event.ctrlKey || event.metaKey) {
              window.open(href, '_blank', 'noopener,noreferrer')
              event.preventDefault()
              return true
            }
            return false
          },
        },
      },
    })

    return [...parentPlugins, clickHandler]
  },
})
