import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  userApi,
  type UserListQuery,
  type UserListResponse
} from '@/api/user'
import type { UserResponse } from '@/api/auth'

export interface AdminUser {
  id: string
  email: string
  displayName?: string
  avatar?: string
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminResult {
  success: boolean
  data?: any
  error?: string
}

export const useAdminStore = defineStore('admin', () => {
  // State
  const users = ref<AdminUser[]>([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false
  })

  // Actions
  const fetchUsers = async (query: UserListQuery = {}): Promise<AdminResult> => {
    loading.value = true
    try {
      const response = await userApi.getUsers(query)

      if (response.code === 0) {
        users.value = response.data.items
        pagination.value = {
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
          hasMore: response.data.hasMore
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: 'Failed to fetch users' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch users'
      }
    } finally {
      loading.value = false
    }
  }

  const toggleBan = async (userId: string, isBanned: boolean): Promise<AdminResult> => {
    loading.value = true
    try {
      const response = await userApi.toggleBan(userId, isBanned)

      if (response.code === 0) {
        // Update local state
        const index = users.value.findIndex(u => u.id === userId)
        if (index !== -1) {
          users.value[index] = { ...users.value[index], isBanned }
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: 'Failed to update ban status' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update ban status'
      }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId: string): Promise<AdminResult> => {
    loading.value = true
    try {
      const response = await userApi.deleteUser(userId)

      if (response.code === 0) {
        // Remove from local state
        users.value = users.value.filter(u => u.id !== userId)
        return { success: true, data: response.data }
      } else {
        return { success: false, error: 'Failed to delete user' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete user'
      }
    } finally {
      loading.value = false
    }
  }

  const clearUsers = () => {
    users.value = []
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: false
    }
  }

  return {
    // State
    users,
    loading,
    pagination,

    // Actions
    fetchUsers,
    toggleBan,
    deleteUser,
    clearUsers
  }
})
