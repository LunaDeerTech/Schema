import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/http'
import type { Page } from '@/types'

export const usePublicStore = defineStore('public', () => {
  const tree = ref<Page[]>([])
  const currentLibraryId = ref<string>('')
  const currentPageId = ref<string>('')

  async function fetchTree(libraryId: string) {
    if (currentLibraryId.value === libraryId && tree.value.length > 0) return
    
    try {
      const res = await api.get(`/public/libraries/${libraryId}/tree`)
      tree.value = res.data
      currentLibraryId.value = libraryId
    } catch (error) {
      console.error('Failed to fetch public tree', error)
      tree.value = []
    }
  }

  return {
    tree,
    currentLibraryId,
    currentPageId,
    fetchTree
  }
})
