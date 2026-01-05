import httpClient from './http'

export const uploadApi = {
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await httpClient.post<any>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // Handle NestJS ResponseInterceptor format: { code: 0, data: { url: '...' } }
    return response.data?.data || response.data
  },
}
