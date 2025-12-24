import { api } from './http'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName?: string
}

export interface AuthResponse {
  code: number
  data: {
    access_token: string
    user: {
      id: string
      email: string
      displayName?: string
      avatar?: string
    }
  }
}

export interface UserResponse {
  code: number
  data: {
    id: string
    email: string
    displayName?: string
    avatar?: string
  }
}

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),
  
  getProfile: () => 
    api.get<UserResponse>('/auth/profile'),
  
  refreshToken: () => 
    api.post<AuthResponse>('/auth/refresh')
}