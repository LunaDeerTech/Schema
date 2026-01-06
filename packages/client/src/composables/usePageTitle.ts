import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSystemStore } from '@/stores/system'

export function usePageTitle() {
  const route = useRoute()
  const systemStore = useSystemStore()

  const updateTitle = () => {
    const baseTitle = systemStore.siteTitle
    const routeTitle = route.meta.title as string | undefined
    
    let fullTitle = baseTitle
    
    if (routeTitle) {
      fullTitle = `${routeTitle} - ${baseTitle}`
    } else if (route.name) {
      // 如果没有meta title，使用路由名称作为标题
      const nameTitle = String(route.name).replace(/([A-Z])/g, ' $1').trim()
      fullTitle = `${nameTitle} - ${baseTitle}`
    }
    
    document.title = fullTitle
  }

  // 监听路由变化
  watch(() => route.path, updateTitle)

  // 监听系统配置变化
  watch(() => systemStore.siteTitle, updateTitle)

  // 组件挂载时更新
  onMounted(() => {
    updateTitle()
  })

  // 返回更新函数，以便手动调用
  return {
    updateTitle
  }
}