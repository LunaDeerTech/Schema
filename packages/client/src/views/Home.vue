<template>
  <div class="home-container">
    <n-layout class="layout" has-sider>
      <!-- Sidebar -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="48"
        :width="260"
        :collapsed="collapsed"
        @collapse="collapsed = true"
        @expand="collapsed = false"
        show-trigger="arrow-circle"
      >
        <div class="sidebar-header">
          <n-text strong v-if="!collapsed">Schema</n-text>
          <n-text strong v-else>S</n-text>
        </div>
        
        <n-menu
          v-model:value="activeKey"
          :collapsed="collapsed"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />
      </n-layout-sider>
      
      <!-- Main Content -->
      <n-layout>
        <!-- Header -->
        <n-layout-header bordered class="header">
          <div class="header-content">
            <div class="header-left">
              <n-text strong>工作台</n-text>
            </div>
            
            <div class="header-right">
              <n-button text @click="handleSearch" style="margin-right: 16px;">
                搜索 (Ctrl+K)
              </n-button>
              
              <n-dropdown :options="userOptions" @select="handleUserSelect">
                <n-button text class="user-info">
                  <n-avatar
                    :size="24"
                    round
                    style="margin-right: 8px;"
                    :style="{ background: userStore.user?.avatar ? 'transparent' : '#1A73E8' }"
                  >
                    {{ userStore.user?.avatar || userStore.userName.charAt(0).toUpperCase() }}
                  </n-avatar>
                  {{ userStore.userName }}
                </n-button>
              </n-dropdown>
            </div>
          </div>
        </n-layout-header>
        
        <!-- Content Area -->
        <n-layout-content class="content-area" :native-scrollbar="false">
          <div class="welcome-section">
            <n-h1>欢迎回来，{{ userStore.userName }}</n-h1>
            <n-p>今天是 {{ currentDate }}，开始记录你的知识吧！</n-p>
            
            <n-grid :cols="3" :x-gap="16" :y-gap="16" style="margin-top: 24px;">
              <n-gi>
                <n-card hoverable @click="$router.push('/library')">
                  <n-space vertical>
                    <n-text strong>📚 我的图书馆</n-text>
                    <n-text depth="3">浏览和管理你的知识库</n-text>
                  </n-space>
                </n-card>
              </n-gi>
              
              <n-gi>
                <n-card hoverable @click="handleCreateLibrary">
                  <n-space vertical>
                    <n-text strong>➕ 创建知识库</n-text>
                    <n-text depth="3">开始构建新的知识体系</n-text>
                  </n-space>
                </n-card>
              </n-gi>
              
              <n-gi>
                <n-card hoverable @click="handleSearch">
                  <n-space vertical>
                    <n-text strong>🔍 全文搜索</n-text>
                    <n-text depth="3">快速找到需要的内容</n-text>
                  </n-space>
                </n-card>
              </n-gi>
            </n-grid>
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NIcon, useMessage, useDialog } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { 
  BookOutline as BookIcon,
  AddCircleOutline as AddIcon,
  SearchOutline as SearchIcon,
  LogOutOutline as LogoutIcon,
  HomeOutline as HomeIcon
} from '@vicons/ionicons5'

const userStore = useUserStore()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const collapsed = ref(false)
const activeKey = ref('home')

// Current date
const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

// Menu options
const menuOptions: MenuOption[] = [
  {
    label: '工作台',
    key: 'home',
    icon: () => h(NIcon, null, { default: () => h(HomeIcon) })
  },
  {
    label: '我的图书馆',
    key: 'library',
    icon: () => h(NIcon, null, { default: () => h(BookIcon) })
  },
  {
    label: '新建知识库',
    key: 'create',
    icon: () => h(NIcon, null, { default: () => h(AddIcon) })
  },
  {
    label: '搜索',
    key: 'search',
    icon: () => h(NIcon, null, { default: () => h(SearchIcon) })
  }
]

// User dropdown options
const userOptions = [
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogoutIcon) })
  }
]

// Menu selection handler
const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'home':
      router.push('/home')
      break
    case 'library':
      router.push('/library')
      break
    case 'create':
      handleCreateLibrary()
      break
    case 'search':
      handleSearch()
      break
  }
}

// User dropdown handler
const handleUserSelect = (key: string) => {
  if (key === 'logout') {
    dialog.warning({
      title: '确认退出',
      content: '确定要退出登录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        userStore.logout()
        message.success('已退出登录')
        router.push('/login')
      }
    })
  }
}

// Create library handler
const handleCreateLibrary = () => {
  dialog.info({
    title: '创建知识库',
    content: '知识库创建功能将在后续开发中实现',
    positiveText: '了解'
  })
}

// Search handler
const handleSearch = () => {
  message.info('搜索功能将在后续开发中实现')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.home-container {
  height: 100vh;
  overflow: hidden;
}

.layout {
  height: 100%;
}

.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid $ios-separator-non-opaque;
  font-size: 18px;
  color: $ios-system-blue;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
}

.header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid $ios-separator-non-opaque;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: $ios-border-radius-s;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.content-area {
  padding: 24px;
  background-color: $ios-background-primary;
}

.welcome-section {
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    margin-bottom: 8px;
    color: $ios-text-primary;
  }
  
  p {
    color: $ios-text-secondary;
    margin-bottom: 0;
  }
}

.n-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: none;
  background-color: $ios-background-secondary;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $ios-shadow-2;
  }
  
  :deep(.n-card__content) {
    padding: 20px;
  }
}
</style>