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

export interface SendVerificationRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface RegisterWithCodeRequest {
  email: string
  password: string
  displayName?: string
  verificationCode: string
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
      isAdmin: boolean
      isBanned?: boolean
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
    isAdmin: boolean
    isBanned?: boolean
  }
}

export interface VerificationResponse {
  code: number
  data: {
    success: boolean
    message: string
  }
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  sendVerification: (data: SendVerificationRequest) =>
    api.post<VerificationResponse>('/auth/send-verification', data),

  verifyCode: (data: VerifyCodeRequest) =>
    api.post<VerificationResponse>('/auth/verify-code', data),

  registerWithCode: (data: RegisterWithCodeRequest) =>
    api.post<AuthResponse>('/auth/register-with-code', data),

  getProfile: () =>
    api.get<UserResponse>('/auth/profile'),

  refreshToken: () =>
    api.post<AuthResponse>('/auth/refresh')
}