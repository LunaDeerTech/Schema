import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pageApi } from '@/api/page'
import type { Page, PageVersion } from '@/types'
import { useLibraryStore } from './library'

export interface PageTree extends Page {
  children?: PageTree[]
}

export interface PageState {
  pages: Page[]
  currentPage: Page | null
  pageTree: PageTree[]
  versions: PageVersion[]
  loading: boolean
  error: string | null
}

export const usePageStore = defineStore('page', () => {
  // State
  const pages = ref<Page[]>([])
  const currentPage = ref<Page | null>(null)
  const pageTree = ref<PageTree[]>([])
  const versions = ref<PageVersion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pageList = computed(() => pages.value)
  const currentPageId = computed(() => currentPage.value?.id || null)
  const getCurrentPage = computed(() => currentPage.value)
  const getPageTree = computed(() => pageTree.value)
  const getVersions = computed(() => versions.value)

  // Actions
  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const setPages = (pgs: Page[]) => {
    pages.value = pgs
  }

  const setCurrentPage = (page: Page | null) => {
    currentPage.value = page
  }

  const setVersions = (vrs: PageVersion[]) => {
    versions.value = vrs
  }

  // Build tree from flat pages array
  const buildPageTree = (flatPages: Page[]): PageTree[] => {
    const map = new Map<string, PageTree>()
    const roots: PageTree[] = []

    // First pass: create map with children arrays
    flatPages.forEach(page => {
      map.set(page.id, { ...page, children: [] })
    })

    // Second pass: build tree structure
    flatPages.forEach(page => {
      const node = map.get(page.id)
      if (!node) return

      if (page.parentId) {
        const parent = map.get(page.parentId)
        if (parent) {
          parent.children?.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  // Fetch pages for current library
  const fetchPages = async (libraryId?: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const libStore = useLibraryStore()
      const targetLibraryId = libraryId || libStore.currentLibraryId

      if (!targetLibraryId) {
        setError('No library selected')
        setLoading(false)
        return
      }

      const response = await pageApi.getPages({ libraryId: targetLibraryId })
      if (response.code === 0) {
        setPages(response.data)
        pageTree.value = buildPageTree(response.data)
      } else {
        setError(response.message || 'Failed to fetch pages')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }

  // Fetch single page with details
  const fetchPage = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.getPage(id)
      if (response.code === 0) {
        setCurrentPage(response.data)
      } else {
        setError(response.message || 'Failed to fetch page')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch page')
    } finally {
      setLoading(false)
    }
  }

  // Create new page
  const createPage = async (data: {
    title: string
    libraryId: string
    parentId?: string
    content?: any
    icon?: string
    isPublic?: boolean
  }): Promise<Page | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.createPage(data)
      if (response.code === 0) {
        const newPage = response.data
        pages.value.push(newPage)
        
        // Rebuild tree
        pageTree.value = buildPageTree(pages.value)
        
        return newPage
      } else {
        setError(response.message || 'Failed to create page')
        return null
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create page')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update page
  const updatePage = async (id: string, data: {
    title?: string
    content?: any
    icon?: string
    isPublic?: boolean
    parentId?: string
  }): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.updatePage(id, data)
      if (response.code === 0) {
        const updatedPage = response.data
        const index = pages.value.findIndex(p => p.id === id)
        if (index !== -1) {
          pages.value[index] = updatedPage
        }
        
        // Update current page if it's the one being edited
        if (currentPage.value?.id === id) {
          setCurrentPage(updatedPage)
        }
        
        // Rebuild tree
        pageTree.value = buildPageTree(pages.value)
        
        return true
      } else {
        setError(response.message || 'Failed to update page')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update page')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete page
  const deletePage = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.deletePage(id)
      if (response.code === 0) {
        pages.value = pages.value.filter(p => p.id !== id)
        
        // Clear current page if it was deleted
        if (currentPage.value?.id === id) {
          setCurrentPage(null)
        }
        
        // Rebuild tree
        pageTree.value = buildPageTree(pages.value)
        
        return true
      } else {
        setError(response.message || 'Failed to delete page')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete page')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Move page
  const movePage = async (id: string, data: {
    newParentId?: string
    newLibraryId?: string
    sortOrder?: number
  }): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.movePage(id, data)
      if (response.code === 0) {
        const updatedPage = response.data
        const index = pages.value.findIndex(p => p.id === id)
        if (index !== -1) {
          pages.value[index] = updatedPage
        }
        
        // Rebuild tree
        pageTree.value = buildPageTree(pages.value)
        
        return true
      } else {
        setError(response.message || 'Failed to move page')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to move page')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Fetch page versions
  const fetchVersions = async (pageId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.getVersions(pageId)
      if (response.code === 0) {
        setVersions(response.data)
      } else {
        setError(response.message || 'Failed to fetch versions')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch versions')
    } finally {
      setLoading(false)
    }
  }

  // Create new version
  const createVersion = async (pageId: string, message?: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.createVersion(pageId, message)
      if (response.code === 0) {
        // Refresh versions list
        await fetchVersions(pageId)
        return true
      } else {
        setError(response.message || 'Failed to create version')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create version')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Restore page to version
  const restoreVersion = async (pageId: string, versionId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await pageApi.restoreVersion(pageId, versionId)
      if (response.code === 0) {
        const restoredPage = response.data
        
        // Update pages array
        const index = pages.value.findIndex(p => p.id === pageId)
        if (index !== -1) {
          pages.value[index] = restoredPage
        }
        
        // Update current page if it's the one being restored
        if (currentPage.value?.id === pageId) {
          setCurrentPage(restoredPage)
        }
        
        return true
      } else {
        setError(response.message || 'Failed to restore version')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restore version')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Clear all data (useful when switching libraries or on logout)
  const clearPages = () => {
    pages.value = []
    currentPage.value = null
    pageTree.value = []
    versions.value = []
    error.value = null
  }

  return {
    // State
    pages,
    currentPage,
    pageTree,
    versions,
    loading,
    error,
    
    // Getters
    pageList,
    currentPageId,
    getCurrentPage,
    getPageTree,
    getVersions,
    
    // Actions
    fetchPages,
    fetchPage,
    createPage,
    updatePage,
    deletePage,
    movePage,
    fetchVersions,
    createVersion,
    restoreVersion,
    clearPages,
    setCurrentPage
  }
})