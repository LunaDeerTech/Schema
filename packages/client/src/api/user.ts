import { api } from './http'
import type { UserResponse } from './auth'

export interface UpdateProfileRequest {
  displayName?: string
  avatar?: string
}

export const userApi = {
  updateProfile: (data: UpdateProfileRequest) => 
    api.patch<UserResponse>('/user/profile', data)
}
