import Mention from '@tiptap/extension-mention'
import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import ReferenceList from '../ReferenceList.vue'
import { api } from '@/api/http'

export const PageReference = Mention.configure({
  HTMLAttributes: {
    class: 'page-reference',
  },
  suggestion: {
    items: async ({ query }: { query: string }) => {
      if (!query) return []
      try {
        const response = await api.get<{ code: number; data: any[] }>('/search/suggestions', {
          params: { q: query },
        })
        // The api wrapper returns res.data, so response is the body { code: 0, data: [...] }
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
            appendTo: () => document.body,
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
