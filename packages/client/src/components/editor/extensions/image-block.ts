import Image from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageBlockView from './ImageBlockView.vue'

export const ImageBlock = Image.extend({
  addNodeView() {
    return VueNodeViewRenderer(ImageBlockView)
  },
})
