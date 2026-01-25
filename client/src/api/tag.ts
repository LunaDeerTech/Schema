import { api } from './http'
import type { Tag, ApiResponse } from '@/types'

export const tagApi = {
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    return api.get('/tags')
  },

  createTag: async (name: string, color?: string): Promise<ApiResponse<Tag>> => {
    return api.post('/tags', { name, color })
  },

  deleteTag: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/tags/${id}`)
  },
  
  getTagsForPage: async (pageId: string): Promise<ApiResponse<Tag[]>> => {
    return api.get(`/tags/page/${pageId}`)
  },

  attachTagToPage: async (pageId: string, tagId: string): Promise<ApiResponse<void>> => {
    return api.post('/tags/attach', { pageId, tagId })
  },

  detachTagFromPage: async (pageId: string, tagId: string): Promise<ApiResponse<void>> => {
    return api.post('/tags/detach', { pageId, tagId })
  }
}
