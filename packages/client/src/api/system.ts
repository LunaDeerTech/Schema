import { api } from './http'

export interface SiteInfo {
  title: string
  description: string
  updatedAt: string
}

export interface SiteInfoResponse {
  code: number
  data: SiteInfo
}

export interface UpdateSiteInfoDto {
  title?: string
  description?: string
}

export const systemApi = {
  // 获取网站信息
  async getSiteInfo(): Promise<SiteInfoResponse> {
    return api.get<SiteInfoResponse>('/system/site-info')
  },

  // 更新网站信息
  async updateSiteInfo(data: UpdateSiteInfoDto): Promise<SiteInfoResponse> {
    return api.put<SiteInfoResponse>('/system/site-info', data)
  }
}