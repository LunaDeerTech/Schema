<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
  NLayout, 
  NLayoutContent,
  NDrawer,
  NDrawerContent
} from 'naive-ui'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import TopNavigation from '@/components/layout/TopNavigation.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import { usePageTitle } from '@/composables/usePageTitle'

const route = useRoute()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

const collapsed = ref(false)
const showSidebar = computed(() => route.name !== 'Home')
const isHome = computed(() => route.name === 'Home')

// Mobile sidebar control
const mobileSidebarOpen = ref(false)

watch(isMobile, (mobile) => {
  if (mobile) {
    collapsed.value = true
  } else {
    collapsed.value = false
    mobileSidebarOpen.value = false
  }
}, { immediate: true })

// Close mobile sidebar on route change
watch(route, () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = false
  }
})

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    collapsed.value = !collapsed.value
  }
}

// 使用页面标题composable
usePageTitle()
</script>

<template>
  <n-layout class="main-layout">
    <TopNavigation 
      :collapsed="isMobile ? !mobileSidebarOpen : collapsed" 
      @update:collapsed="toggleSidebar"
      :is-mobile="isMobile"
    />
    
    <n-layout :has-sider="showSidebar && !isMobile" class="content-layout">
      <!-- Desktop Sidebar -->
      <Sidebar 
        v-if="showSidebar && !isMobile" 
        v-model:collapsed="collapsed" 
      />

      <!-- Mobile Sidebar (Drawer) -->
      <n-drawer 
        v-if="isMobile && showSidebar"
        v-model:show="mobileSidebarOpen" 
        placement="left" 
        :width="280"
      >
        <n-drawer-content body-content-style="padding: 0">
           <Sidebar 
             :collapsed="false" 
             is-mobile
             @update:collapsed="mobileSidebarOpen = false"
           />
        </n-drawer-content>
      </n-drawer>

      <n-layout-content 
        class="main-content" 
        :class="{ 'is-home': isHome, 'is-mobile': isMobile }"
        :native-scrollbar="!isHome"
        :content-style="isHome ? { height: '100%', padding: 0 } : {}"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-layout {
  flex: 1;
  height: calc(100vh - 56px);
}

.sidebar {
  background-color: #f8f9fa; 
}

.main-content {
  padding: 20px;
  background-color: #fafafa;
  
  &.is-home {
    padding: 0;
    height: 100%;
  }

  &.is-mobile {
    padding: 12px;
  }
}
</style>
