import { api } from './http'
import type { Page, PageVersion, ApiResponse, PaginatedResponse } from '@/types'

export interface CreatePageRequest {
  title: string
  libraryId: string
  parentId?: string
  content?: any
  icon?: string
  isPublic?: boolean
}

export interface UpdatePageRequest {
  title?: string
  content?: any
  icon?: string
  isPublic?: boolean
  parentId?: string
  libraryId?: string
  sortOrder?: number
}

export interface PageQueryParams {
  libraryId?: string
  parentId?: string
  page?: number
  pageSize?: number
}

export interface MovePageRequest {
  newParentId?: string | null
  newLibraryId?: string
  sortOrder?: number
}

export const pageApi = {
  // Get pages with optional filters
  getPages: async (params?: PageQueryParams): Promise<ApiResponse<PaginatedResponse<Page>>> => {
    return api.get('/pages', { params })
  },

  // Get single page by ID
  getPage: async (id: string): Promise<ApiResponse<Page & { library?: any; parent?: any; children?: any[] }>> => {
    return api.get(`/pages/${id}`)
  },

  // Create new page
  createPage: async (data: CreatePageRequest): Promise<ApiResponse<Page>> => {
    return api.post('/pages', data)
  },

  // Update page
  updatePage: async (id: string, data: UpdatePageRequest): Promise<ApiResponse<Page>> => {
    return api.put(`/pages/${id}`, data)
  },

  // Delete page
  deletePage: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/pages/${id}`)
  },

  // Move page (change parent or library)
  movePage: async (id: string, data: MovePageRequest): Promise<ApiResponse<Page>> => {
    return api.post(`/pages/${id}/move`, data)
  },

  // Get page versions
  getVersions: async (pageId: string): Promise<ApiResponse<PageVersion[]>> => {
    return api.get(`/pages/${pageId}/versions`)
  },

  // Create new version
  createVersion: async (pageId: string, message?: string): Promise<ApiResponse<PageVersion>> => {
    return api.post(`/pages/${pageId}/versions`, { message })
  },

  // Restore page to a specific version
  restoreVersion: async (pageId: string, versionId: string): Promise<ApiResponse<Page>> => {
    return api.post(`/pages/${pageId}/versions/${versionId}/restore`)
  },

  // Get page references (incoming and outgoing)
  getReferences: async (pageId: string): Promise<ApiResponse<{ incoming: Page[]; outgoing: Page[] }>> => {
    return api.get(`/pages/${pageId}/references`)
  }
}