import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { libraryApi } from '@/api/library'
import type { Library } from '@/types'

export interface LibraryState {
  libraries: Library[]
  currentLibrary: Library | null
  loading: boolean
  error: string | null
}

export const useLibraryStore = defineStore('library', () => {
  // State
  const libraries = ref<Library[]>([])
  const currentLibrary = ref<Library | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const libraryList = computed(() => libraries.value)
  const currentLibraryId = computed(() => currentLibrary.value?.id || null)
  const hasLibraries = computed(() => libraries.value.length > 0)
  const getCurrentLibrary = computed(() => currentLibrary.value)

  // Actions
  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const setLibraries = (libs: Library[]) => {
    libraries.value = libs
  }

  const setCurrentLibrary = (library: Library | null) => {
    currentLibrary.value = library
  }

  // Fetch all libraries
  const fetchLibraries = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await libraryApi.getLibraries()
      if (response.code === 0) {
        setLibraries(response.data)
        
        // If no current library is selected, select the first one
        if (!currentLibrary.value && response.data.length > 0) {
          setCurrentLibrary(response.data[0])
        }
      } else {
        setError(response.message || 'Failed to fetch libraries')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch libraries')
    } finally {
      setLoading(false)
    }
  }

  // Create new library
  const createLibrary = async (data: {
    title: string
    description?: string
    icon?: string
    isPublic?: boolean
  }): Promise<Library | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await libraryApi.createLibrary(data)
      if (response.code === 0) {
        const newLibrary = response.data
        libraries.value.push(newLibrary)
        return newLibrary
      } else {
        setError(response.message || 'Failed to create library')
        return null
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create library')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update library
  const updateLibrary = async (id: string, data: {
    title?: string
    description?: string
    icon?: string
    isPublic?: boolean
    sortOrder?: number
  }): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await libraryApi.updateLibrary(id, data)
      if (response.code === 0) {
        const updatedLibrary = response.data
        const index = libraries.value.findIndex(lib => lib.id === id)
        if (index !== -1) {
          libraries.value[index] = updatedLibrary
        }
        if (currentLibrary.value?.id === id) {
          setCurrentLibrary(updatedLibrary)
        }
        return true
      } else {
        setError(response.message || 'Failed to update library')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update library')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete library
  const deleteLibrary = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await libraryApi.deleteLibrary(id)
      if (response.code === 0) {
        libraries.value = libraries.value.filter(lib => lib.id !== id)
        
        // If current library was deleted, clear it
        if (currentLibrary.value?.id === id) {
          setCurrentLibrary(libraries.value[0] || null)
        }
        return true
      } else {
        setError(response.message || 'Failed to delete library')
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete library')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Select library by ID
  const selectLibrary = (id: string): boolean => {
    const library = libraries.value.find(lib => lib.id === id)
    if (library) {
      setCurrentLibrary(library)
      return true
    }
    return false
  }

  // Clear all data (useful on logout)
  const clearLibraries = () => {
    libraries.value = []
    currentLibrary.value = null
    error.value = null
  }

  return {
    // State
    libraries,
    currentLibrary,
    loading,
    error,
    
    // Getters
    libraryList,
    currentLibraryId,
    hasLibraries,
    getCurrentLibrary,
    
    // Actions
    fetchLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    selectLibrary,
    clearLibraries,
    setCurrentLibrary
  }
})