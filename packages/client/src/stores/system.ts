import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { systemApi } from '@/api/system'

export interface SystemConfig {
  title: string
  description: string
  updatedAt: string
}

export const useSystemStore = defineStore('system', () => {
  // State
  const config = ref<SystemConfig>({
    title: 'Schema',
    description: 'Personal Knowledge Management System',
    updatedAt: new Date().toISOString()
  })
  
  const loading = ref(false)
  const initialized = ref(false)

  // Getters
  const siteTitle = computed(() => config.value.title)
  const siteDescription = computed(() => config.value.description)
  const siteUpdatedAt = computed(() => config.value.updatedAt)

  // Actions
  async function fetchConfig() {
    if (initialized.value) return // 已初始化，无需重复获取
    
    loading.value = true
    try {
      const response = await systemApi.getSiteInfo()
      config.value = response.data
      initialized.value = true
    } catch (error) {
      console.error('Failed to fetch system config:', error)
      // 保持默认值
    } finally {
      loading.value = false
    }
  }

  async function updateConfig(newConfig: { title?: string; description?: string }) {
    loading.value = true
    try {
      const response = await systemApi.updateSiteInfo(newConfig)
      config.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to update system config:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Auto-fetch on store creation (once)
  if (!initialized.value) {
    fetchConfig()
  }

  return {
    // State
    config,
    loading,
    initialized,
    
    // Getters
    siteTitle,
    siteDescription,
    siteUpdatedAt,
    
    // Actions
    fetchConfig,
    updateConfig
  }
})