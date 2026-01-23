import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginRequest, type RegisterRequest, type SendVerificationRequest, type VerifyCodeRequest, type RegisterWithCodeRequest } from '@/api/auth'
import { userApi, type UpdateProfileRequest } from '@/api/user'
import { STORAGE_TOKEN_KEY } from '@/constants'

export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
  isAdmin: boolean
}

export interface AuthResult {
  success: boolean
  data?: any
  error?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('schema_token'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.displayName || user.value?.email || '')
  const userId = computed(() => user.value?.id || '')
  const isAdmin = computed(() => user.value?.isAdmin || false)

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken)
  }

  const clearToken = () => {
    token.value = null
    localStorage.removeItem(STORAGE_TOKEN_KEY)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const clearUser = () => {
    user.value = null
  }

  const login = async (credentials: LoginRequest): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await authApi.login(credentials)
      
      if (response.code === 0) {
        setToken(response.data.access_token)
        setUser(response.data.user)
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '登录失败' }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || '登录失败，请检查网络连接'
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterRequest): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await authApi.register(data)

      if (response.code === 0) {
        setToken(response.data.access_token)
        setUser(response.data.user)
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '注册失败' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || '注册失败，请检查网络连接'
      }
    } finally {
      loading.value = false
    }
  }

  const sendVerification = async (data: SendVerificationRequest): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await authApi.sendVerification(data)

      if (response.code === 0) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '发送验证码失败' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || '发送验证码失败，请检查网络连接'
      }
    } finally {
      loading.value = false
    }
  }

  const verifyCode = async (data: VerifyCodeRequest): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await authApi.verifyCode(data)

      if (response.code === 0) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '验证码验证失败' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || '验证码验证失败，请检查网络连接'
      }
    } finally {
      loading.value = false
    }
  }

  const registerWithCode = async (data: RegisterWithCodeRequest): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await authApi.registerWithCode(data)

      if (response.code === 0) {
        setToken(response.data.access_token)
        setUser(response.data.user)
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '注册失败' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || '注册失败，请检查网络连接'
      }
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async (): Promise<AuthResult> => {
    if (!token.value) {
      return { success: false }
    }

    loading.value = true
    try {
      const response = await authApi.getProfile()
      
      if (response.code === 0) {
        setUser(response.data)
        return { success: true, data: response.data }
      } else {
        clearToken()
        return { success: false }
      }
    } catch (error) {
      clearToken()
      return { success: false, error: '获取用户信息失败' }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data: UpdateProfileRequest): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await userApi.updateProfile(data)
      
      if (response.code === 0) {
        setUser(response.data)
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '更新失败' }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || '更新失败'
      }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearToken()
    clearUser()
  }

  return {
    // State
    user,
    token,
    loading,

    // Getters
    isAuthenticated,
    userName,
    userId,
    isAdmin,

    // Actions
    login,
    register,
    sendVerification,
    verifyCode,
    registerWithCode,
    fetchProfile,
    updateProfile,
    logout
  }
})