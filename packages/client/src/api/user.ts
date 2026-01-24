import { api } from './http'
import type { UserResponse } from './auth'

export interface UpdateProfileRequest {
  displayName?: string
  avatar?: string
}

export interface UserListQuery {
  page?: number
  pageSize?: number
  email?: string
}

export interface UserListResponse {
  items: UserResponse[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export const userApi = {
  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<UserResponse>('/user/profile', data),

  // Get list of users (admin only)
  getUsers: (query: UserListQuery = {}) =>
    api.get<UserListResponse>('/user', { params: query }),

  // Toggle ban status (admin only)
  toggleBan: (userId: string, isBanned: boolean) =>
    api.patch<UserResponse>(`/user/${userId}/ban`, { isBanned }),

  // Delete user (admin only)
  deleteUser: (userId: string) =>
    api.delete(`/user/${userId}`)
}
