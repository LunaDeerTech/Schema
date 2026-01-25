import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/http'
import type { Page, Library } from '@/types'

export const usePublicStore = defineStore('public', () => {
  const tree = ref<Page[]>([])
  const currentLibrary = ref<Library | null>(null)
  const currentLibraryId = ref<string>('')
  const currentPageId = ref<string>('')

  async function fetchTree(libraryId: string) {
    // If we are switching libraries, or if we don't have the tree yet
    if (currentLibraryId.value !== libraryId || tree.value.length === 0) {
      try {
        // Fetch tree and library details in parallel
        const [treeRes, libRes] = await Promise.all([
          api.get(`/public/libraries/${libraryId}/tree`),
          api.get(`/public/libraries/${libraryId}`)
        ])
        
        tree.value = treeRes.data
        currentLibrary.value = libRes.data
        currentLibraryId.value = libraryId
      } catch (error) {
        console.error('Failed to fetch public tree or library', error)
        tree.value = []
        currentLibrary.value = null
      }
    } else if (!currentLibrary.value) {
       // If we have the tree but missing library details (edge case)
       try {
         const res = await api.get(`/public/libraries/${libraryId}`)
         currentLibrary.value = res.data
       } catch (error) {
         console.error('Failed to fetch library details', error)
       }
    }
  }

  return {
    tree,
    currentLibrary,
    currentLibraryId,
    currentPageId,
    fetchTree
  }
})
