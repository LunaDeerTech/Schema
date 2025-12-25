import { api } from './http'
import type { Library, ApiResponse } from '@/types'

export interface CreateLibraryRequest {
  title: string
  description?: string
  icon?: string
  isPublic?: boolean
}

export interface UpdateLibraryRequest {
  title?: string
  description?: string
  icon?: string
  isPublic?: boolean
  sortOrder?: number
}

export interface LibraryQueryParams {
  page?: number
  pageSize?: number
}

export const libraryApi = {
  // Get all libraries for current user
  getLibraries: async (params?: LibraryQueryParams): Promise<ApiResponse<Library[]>> => {
    return api.get('/libraries', { params })
  },

  // Get single library by ID
  getLibrary: async (id: string): Promise<ApiResponse<Library>> => {
    return api.get(`/libraries/${id}`)
  },

  // Create new library
  createLibrary: async (data: CreateLibraryRequest): Promise<ApiResponse<Library>> => {
    return api.post('/libraries', data)
  },

  // Update library
  updateLibrary: async (id: string, data: UpdateLibraryRequest): Promise<ApiResponse<Library>> => {
    return api.put(`/libraries/${id}`, data)
  },

  // Delete library
  deleteLibrary: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/libraries/${id}`)
  },

  // Get pages tree for library
  getLibraryPages: async (libraryId: string): Promise<ApiResponse<any[]>> => {
    return api.get(`/libraries/${libraryId}/pages`)
  }
}