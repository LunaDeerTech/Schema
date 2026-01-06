<script setup lang="ts">
import { ref, h, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NLayoutHeader, 
  NInput, 
  NIcon, 
  NAvatar, 
  NDropdown, 
  NButton,
  NModal,
  NCard,
  NList,
  NListItem,
  NTag,
  NSpace,
  NText,
  NA
} from 'naive-ui'
import { 
  SearchOutline as SearchIcon,
  MenuOutline as MenuIcon,
  HelpCircleOutline as HelpIcon,
  SettingsOutline as SettingsIcon,
  LogOutOutline as LogOutIcon,
  PersonOutline as PersonIcon
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const systemStore = useSystemStore()

const showSearch = ref(false)
const searchText = ref('')
const showHelp = ref(false)

const openHelp = () => {
  showHelp.value = true
}

// User Menu Options
const userOptions = [
  {
    label: 'Profile Settings',
    key: 'profile',
    icon: () => h(NIcon, null, { default: () => h(PersonIcon) })
  },
  {
    label: 'Your Contents',
    key: 'content',
    icon: () => h(NIcon, null, { default: () => h(MenuIcon) })
  },
  {
    label: 'Settings',
    key: 'settings',
    icon: () => h(NIcon, null, { default: () => h(SettingsIcon) })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutIcon) })
  }
]

const handleUserSelect = (key: string) => {
  if (key === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (key === 'settings') {
    router.push('/settings/site-info')
  } else if (key === 'profile') {
    router.push('/settings/profile')
  } else if (key === 'content') {
    router.push('/settings/libraries')
  }
}

const toggleSidebar = () => {
  emit('update:collapsed', !props.collapsed)
}

const openSearch = () => {
  showSearch.value = true
}

// Keyboard shortcut for search
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Mock data for search panel
const recentSearches = ['React Hooks notes', 'Project review 2024', 'Learning plan']
const searchResults = [
  { title: 'React Hooks Best Practice', path: 'Tech Library > Frontend > React' },
  { title: 'Project Alpha Review', path: 'Work Library > Projects > 2024' }
]
</script>

<template>
  <n-layout-header bordered class="nav-header">
    <div class="nav-left">
      <n-button
        quaternary
        circle
        class="sidebar-toggle"
        @click="toggleSidebar"
        v-if="route.name !== 'Home'"
      >
        <template #icon>
          <n-icon :component="MenuIcon" />
        </template>
      </n-button>
      <div class="logo" @click="router.push('/')">{{ systemStore.siteTitle }}</div>
    </div>

    <div class="nav-center">
      <div class="search-trigger" @click="openSearch">
        <n-icon :component="SearchIcon" class="search-icon" />
        <span class="search-placeholder">Search pages, tags, content...</span>
        <span class="search-shortcut">Ctrl+K</span>
      </div>
    </div>

    <div class="nav-right">
      <n-button quaternary circle class="icon-btn" @click="openHelp">
        <template #icon>
          <n-icon :component="HelpIcon" />
        </template>
      </n-button>

      <n-dropdown :options="userOptions" @select="handleUserSelect">
        <div class="user-profile">
          <n-avatar
            round
            size="small"
            :src="userStore.user?.avatar"
            :style="{ backgroundColor: userStore.user?.avatar ? 'transparent' : '#1A73E8' }"
          >
            {{ userStore.user?.avatar ? '' : (userStore.userName?.[0]?.toUpperCase() || 'U') }}
          </n-avatar>
        </div>
      </n-dropdown>
    </div>

    <!-- Search Modal -->
    <n-modal v-model:show="showSearch">
      <n-card
        style="width: 600px; max-width: 90vw;"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="search-modal"
      >
        <template #header>
          <n-input
            v-model:value="searchText"
            placeholder="Search pages, tags, content..."
            size="large"
            clearable
            autofocus
          >
            <template #prefix>
              <n-icon :component="SearchIcon" />
            </template>
          </n-input>
        </template>

        <div class="search-content">
          <div v-if="!searchText" class="recent-searches">
            <n-text depth="3" class="section-title">Recent Searches</n-text>
            <n-list hoverable clickable>
              <n-list-item v-for="item in recentSearches" :key="item">
                <n-space align="center">
                  <n-icon :component="SearchIcon" depth="3" />
                  {{ item }}
                </n-space>
              </n-list-item>
            </n-list>
            
            <div class="filters" style="margin-top: 20px;">
               <n-space>
                 <n-tag checkable>Library: All</n-tag>
                 <n-tag checkable>Tags: All</n-tag>
                 <n-tag checkable>Time: All</n-tag>
               </n-space>
            </div>
          </div>

          <div v-else class="search-results">
            <n-text depth="3" class="section-title">Search Results</n-text>
            <n-list hoverable clickable>
              <n-list-item v-for="res in searchResults" :key="res.title">
                <div class="result-item">
                  <div class="result-title">{{ res.title }}</div>
                  <div class="result-path">{{ res.path }}</div>
                </div>
              </n-list-item>
            </n-list>
          </div>
        </div>
      </n-card>
    </n-modal>

    <!-- Help Modal -->
    <n-modal v-model:show="showHelp">
      <n-card
        style="width: 600px; max-width: 90vw;"
        title="About Schema"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-space vertical size="large">
          <div>
            <n-text strong style="font-size: 18px;">Schema</n-text>
            <p>A personal knowledge management system designed for long-term knowledge accumulation and structured thinking.</p>
          </div>
          
          <div>
            <n-text strong>Version</n-text>
            <p>v1.0.0</p>
          </div>

          <div>
            <n-text strong>Resources</n-text>
            <n-list>
              <n-list-item>
                <n-a href="https://github.com/LunaDeerTech/Schema" target="_blank">GitHub Repository</n-a>
              </n-list-item>
              <n-list-item>
                <n-a href="https://github.com/LunaDeerTech/Schema" target="_blank">Documentation</n-a>
              </n-list-item>
            </n-list>
          </div>

          <div>
            <n-text strong>Keyboard Shortcuts</n-text>
            <n-list>
              <n-list-item>
                <n-space justify="space-between">
                  <span>Global Search</span>
                  <n-tag size="small">Ctrl + K</n-tag>
                </n-space>
              </n-list-item>
            </n-list>
          </div>
        </n-space>
      </n-card>
    </n-modal>
  </n-layout-header>
</template>

<style scoped lang="scss">
.nav-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;
  z-index: 100;
  background-color: #fff;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  
  .logo {
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    color: #1A73E8;
    user-select: none;
  }
}

.nav-center {
  flex: 1;
  max-width: 600px;
  margin: 0 20px;
  
  .search-trigger {
    background-color: #f1f3f4;
    border-radius: 8px;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    cursor: text;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #e8eaed;
    }
    
    .search-icon {
      color: #5f6368;
      margin-right: 8px;
      font-size: 16px;
    }
    
    .search-placeholder {
      flex: 1;
      color: #5f6368;
      font-size: 14px;
    }
    
    .search-shortcut {
      color: #9aa0a6;
      font-size: 12px;
      background: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #dadce0;
    }
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: flex-end;
  
  .user-profile {
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-left: 8px;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.section-title {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.result-item {
  .result-title {
    font-weight: 500;
    color: #1A73E8;
  }
  .result-path {
    font-size: 12px;
    color: #5f6368;
  }
}
</style>
