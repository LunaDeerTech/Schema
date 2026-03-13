import { api } from './http'
import type { UserResponse } from './auth'
import type { ApiResponse, Library } from '@/types'

export interface PublicUserProfile {
  id: string
  displayName: string
  avatar?: string
  createdAt: string
  libraries: Library[]
}

export interface UpdateProfileRequest {
  displayName?: string
  avatar?: string
  isProfilePublic?: boolean
}

export interface UserListQuery {
  page?: number
  pageSize?: number
  email?: string
}

export interface UserData {
  id: string
  email: string
  displayName?: string
  avatar?: string
  isAdmin: boolean
  isBanned: boolean
  isProfilePublic: boolean
  createdAt: string
  updatedAt: string
}

export interface UserListData {
  items: UserData[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface UserListResponse {
  code: number
  data: UserListData
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<UserResponse>('/user/profile', data),

  changePassword: (data: ChangePasswordRequest) =>
    api.patch<{ code: number; data: { success: boolean } }>('/user/password', data),

  deleteAccount: (password: string) =>
    api.delete<{ code: number; data: { success: boolean } }>('/user/account', { data: { password } }),

  // Get list of users (admin only)
  getUsers: (query: UserListQuery = {}) =>
    api.get<UserListResponse>('/user', { params: query }),

  // Toggle ban status (admin only)
  toggleBan: (userId: string, isBanned: boolean) =>
    api.patch<UserResponse>(`/user/${userId}/ban`, { isBanned }),

  // Delete user (admin only)
  deleteUser: (userId: string) =>
    api.delete(`/user/${userId}`),

  // Get public user profile (no auth required)
  getPublicProfile: (name: string) =>
    api.get<ApiResponse<PublicUserProfile>>(`/public/users/${encodeURIComponent(name)}`)
}
