import Mention from '@tiptap/extension-mention'
import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import ReferenceList from '../ReferenceList.vue'
import { api } from '@/api/http'
import { mergeAttributes } from '@tiptap/core'

export const PageReference = Mention.extend({
  name: 'mention',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.id) return {}
          return { 'data-id': attributes.id }
        },
      },
      label: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-label') || element.textContent,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.label) return {}
          return { 'data-label': attributes.label }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="page-reference"]',
      },
      {
        tag: 'span[data-type="mention"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    return [
      'a',
      mergeAttributes(
        {
          'class': 'page-reference',
          'data-type': 'page-reference',
          'data-id': node.attrs.id,
          'data-label': node.attrs.label,
          'href': `/page/${node.attrs.id}`,
        },
        HTMLAttributes,
      ),
      `@${node.attrs.label ?? node.attrs.id}`,
    ]
  },
}).configure({
  HTMLAttributes: {
    class: 'page-reference',
  },
  suggestion: {
    items: async ({ query }: { query: string }) => {
      try {
        const response = await api.get<{ code: number; data: any[] }>('/search/suggestions', {
          params: { q: query },
        })
        return response.data || []
      } catch (error) {
        console.error('Failed to fetch suggestions', error)
        return []
      }
    },
    render: () => {
      let component: any
      let popup: any

      return {
        onStart: (props: any) => {
          component = new VueRenderer(ReferenceList, {
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
    },
  },
})

export default PageReference
