import httpClient from './http'

export const uploadApi = {
  async uploadImage(file: File, pageId?: string, libraryId?: string) {
    console.log('=== uploadImage called ===');
    console.log('file:', file.name);
    console.log('pageId:', pageId);
    console.log('libraryId:', libraryId);
    
    const formData = new FormData()
    formData.append('file', file)
    if (pageId) {
      formData.append('pageId', pageId)
      console.log('Added pageId to formData');
    }
    if (libraryId) {
      formData.append('libraryId', libraryId)
      console.log('Added libraryId to formData');
    }
    
    // Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await httpClient.post<any>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // Handle NestJS ResponseInterceptor format: { code: 0, data: { url: '...' } }
    return response.data?.data || response.data
  },

  async getImages() {
    const response = await httpClient.get<any>('/upload/images')
    return response.data?.data || response.data
  },

  async deleteImage(id: string) {
    const response = await httpClient.delete<any>(`/upload/images/${id}`)
    return response.data?.data || response.data
  },
}
