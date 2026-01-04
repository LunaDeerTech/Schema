<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NGrid, 
  NGi, 
  NCard, 
  NButton, 
  NIcon, 
  NList, 
  NListItem, 
  NThing, 
  NTag, 
  NCheckbox, 
  NSpace, 
  NText, 
  NH1, 
  NH2,
  NEllipsis,
  NSkeleton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  useMessage,
  NLayout,
  NLayoutContent,
  NLayoutSider
} from 'naive-ui'
import { 
  AddOutline as AddIcon,
  SearchOutline as SearchIcon,
  TimeOutline as TimeIcon,
  LibraryOutline as LibraryIcon,
  CheckmarkCircleOutline as CheckIcon
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'
import { useLibraryStore } from '@/stores/library'

const router = useRouter()
const userStore = useUserStore()
const libraryStore = useLibraryStore()
const message = useMessage()

// Layout State
const rightDrawerCollapsed = ref(false)

const handleResize = () => {
  if (window.innerWidth < 1024 && !rightDrawerCollapsed.value) {
    rightDrawerCollapsed.value = true
  }
}

// Create Library Modal State
const showCreateLibraryModal = ref(false)
const createLibraryModel = ref({
  title: '',
  description: ''
})
const createLibraryLoading = ref(false)

// Date
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Mock Data for Widgets
const recentPages = ref([
  { id: '1', title: 'React Hooks Best Practice', time: '10 min ago', library: 'Tech Learning' },
  { id: '2', title: 'Project Alpha Review', time: '2 hours ago', library: 'Work Library' },
  { id: '3', title: 'Weekly Summary W51', time: 'Yesterday', library: 'Personal Notes' }
])

const pendingTasks = ref([
  { id: '1', content: 'Review React docs', page: 'React Hooks Best Practice', done: false },
  { id: '2', content: 'Update timeline', page: 'Project Alpha Review', done: false },
  { id: '3', content: 'Organize notes', page: 'Weekly Summary W51', done: false }
])

const onThisDay = ref([
  { id: '1', title: 'Year End Review', year: '2023' },
  { id: '2', title: 'Project Beta Launch', year: '2022' }
])

const longUnvisited = ref([
  { id: '1', title: 'API Design Principles', days: 45 },
  { id: '2', title: 'Database Optimization', days: 60 }
])

// Actions
const handleCreateLibrary = () => {
  createLibraryModel.value = { title: '', description: '' }
  showCreateLibraryModal.value = true
}

const submitCreateLibrary = async () => {
  if (!createLibraryModel.value.title) {
    message.warning('Please enter a library title')
    return
  }
  
  createLibraryLoading.value = true
  try {
    const newLib = await libraryStore.createLibrary({
      title: createLibraryModel.value.title,
      content: { type: 'doc', content: [] },
      description: createLibraryModel.value.description
    })
    
    if (newLib) {
      message.success('Library created successfully')
      showCreateLibraryModal.value = false
      libraryStore.setCurrentLibrary(newLib)
      router.push(`/library/${newLib.id}`)
    }
  } catch (error) {
    message.error('Failed to create library')
  } finally {
    createLibraryLoading.value = false
  }
}

const handleSearch = () => {
  // Trigger global search (Ctrl+K)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}

const navigateToLibrary = (id: string) => {
  const lib = libraryStore.libraries.find(l => l.id === id)
  if (lib) {
    libraryStore.setCurrentLibrary(lib)
  }
  router.push(`/library/${id}`)
}

const navigateToPage = (id: string) => {
  router.push(`/page/${id}`)
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  await libraryStore.fetchLibraries()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="home-view">
    <n-layout has-sider sider-placement="right" style="height: 100%; background: transparent;">
      <n-layout-content :native-scrollbar="false" style="background: transparent;" content-style="padding: 24px;">
        <!-- Header -->
        <div class="header-section">
          <div class="greeting">
            <n-h1 style="margin-bottom: 0;">Good Morning, {{ userStore.userName }}</n-h1>
            <n-text depth="3">{{ currentDate }}</n-text>
          </div>
        </div>

        <!-- Libraries -->
        <div class="section-header">
          <n-h2>Knowledge Libraries</n-h2>
        </div>
        
        <div v-if="libraryStore.loading" class="loading-state">
          <n-grid :cols="1" :y-gap="16">
            <n-gi v-for="i in 3" :key="i"><n-skeleton height="100px" width="100%" :sharp="false" /></n-gi>
          </n-grid>
        </div>

        <div v-else-if="libraryStore.libraries.length === 0" class="empty-state">
          <n-card class="empty-card">
            <n-space vertical align="center">
              <n-icon size="48" depth="3"><LibraryIcon /></n-icon>
              <n-text depth="3">No libraries yet</n-text>
              <n-button type="primary" @click="handleCreateLibrary">
                Create Your First Library
              </n-button>
            </n-space>
          </n-card>
        </div>

        <n-grid v-else :cols="24" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
          <!-- Responsive columns: 1 on small, 2 on medium, 3 on large -->
          <n-gi span="24 m:12 l:8" v-for="lib in libraryStore.libraries" :key="lib.id">
            <n-card hoverable class="library-card" @click="navigateToLibrary(lib.id)">
              <template #header>
                <div class="lib-header">
                  <n-icon size="24" color="#1A73E8" style="margin-right: 12px">
                    <LibraryIcon />
                  </n-icon>
                  <n-text strong style="font-size: 16px;">{{ lib.title }}</n-text>
                </div>
              </template>
              <template #header-extra>
                <n-tag size="small" :bordered="false">
                  {{ Math.floor(Math.random() * 20) }} pages
                </n-tag>
              </template>
              <n-text depth="3" class="lib-desc">
                {{ lib.description || 'No description' }}
              </n-text>
              <template #footer>
                <n-text depth="3" style="font-size: 12px;">
                  Last updated: {{ new Date(lib.updatedAt || Date.now()).toLocaleDateString() }}
                </n-text>
              </template>
            </n-card>
          </n-gi>
          
          <n-gi span="24 m:12 l:8">
            <n-button dashed block class="new-lib-btn" @click="handleCreateLibrary">
              <template #icon><n-icon><AddIcon /></n-icon></template>
              New Library
            </n-button>
          </n-gi>
        </n-grid>
      </n-layout-content>

      <!-- Right Drawer -->
      <n-layout-sider
        collapse-mode="transform"
        :collapsed-width="0"
        :width="360"
        show-trigger="arrow-circle"
        bordered
        :native-scrollbar="false"
        v-model:collapsed="rightDrawerCollapsed"
        style="background: transparent;"
      >
        <div class="right-drawer-content">
          <n-space vertical :size="24">
            
            <!-- Quick Actions -->
            <n-card size="small" title="Quick Actions">
              <n-space justify="space-between">
                <n-button secondary circle type="primary" @click="handleCreateLibrary">
                  <template #icon><n-icon><AddIcon /></n-icon></template>
                </n-button>
                <n-button secondary circle type="info" @click="handleSearch">
                  <template #icon><n-icon><SearchIcon /></n-icon></template>
                </n-button>
                <n-button secondary circle type="success">
                  <template #icon><n-icon><CheckIcon /></n-icon></template>
                </n-button>
              </n-space>
              <n-space justify="space-between" style="margin-top: 8px; padding: 0 4px;">
                <n-text depth="3" style="font-size: 12px;">New Lib</n-text>
                <n-text depth="3" style="font-size: 12px;">Search</n-text>
                <n-text depth="3" style="font-size: 12px;">Tasks</n-text>
              </n-space>
            </n-card>

            <!-- Recent Pages -->
            <n-card size="small" title="Recent Pages">
              <n-list hoverable clickable>
                <n-list-item v-for="page in recentPages" :key="page.id" @click="navigateToPage(page.id)">
                  <n-thing>
                    <template #header>
                      <n-ellipsis style="max-width: 200px">{{ page.title }}</n-ellipsis>
                    </template>
                    <template #description>
                      <n-space size="small" align="center">
                        <n-icon size="12" depth="3"><TimeIcon /></n-icon>
                        <n-text depth="3" style="font-size: 12px;">{{ page.time }}</n-text>
                      </n-space>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </n-card>

            <!-- Pending Tasks -->
            <n-card size="small" title="Pending Tasks">
              <template #header-extra>
                <n-tag type="warning" round size="small">{{ pendingTasks.length }}</n-tag>
              </template>
              <n-list>
                <n-list-item v-for="task in pendingTasks" :key="task.id">
                  <n-space align="start" :wrap="false">
                    <n-checkbox v-model:checked="task.done" />
                    <div>
                      <n-text :delete="task.done">{{ task.content }}</n-text>
                      <br/>
                      <n-text depth="3" style="font-size: 12px;">From: {{ task.page }}</n-text>
                    </div>
                  </n-space>
                </n-list-item>
              </n-list>
            </n-card>

            <!-- On This Day -->
            <n-card size="small" title="On This Day">
              <n-list hoverable clickable>
                <n-list-item v-for="item in onThisDay" :key="item.id">
                  <n-thing>
                    <template #avatar>
                      <n-tag type="info" size="small">{{ item.year }}</n-tag>
                    </template>
                    <template #header>{{ item.title }}</template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </n-card>

            <!-- Long Unvisited -->
            <n-card size="small" title="Long Unvisited">
              <n-list hoverable clickable>
                <n-list-item v-for="item in longUnvisited" :key="item.id">
                  <n-space justify="space-between" align="center">
                    <n-text>{{ item.title }}</n-text>
                    <n-tag type="error" size="small" :bordered="false">{{ item.days }} days</n-tag>
                  </n-space>
                </n-list-item>
              </n-list>
            </n-card>

          </n-space>
        </div>
      </n-layout-sider>
    </n-layout>

    <!-- Create Library Modal -->
    <n-modal v-model:show="showCreateLibraryModal">
      <n-card
        style="width: 600px"
        title="Create New Library"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form>
          <n-form-item label="Library Title">
            <n-input v-model:value="createLibraryModel.title" placeholder="e.g. Tech Learning" />
          </n-form-item>
          <n-form-item label="Description">
            <n-input 
              v-model:value="createLibraryModel.description" 
              type="textarea" 
              placeholder="What is this library about?" 
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showCreateLibraryModal = false">Cancel</n-button>
            <n-button type="primary" :loading="createLibraryLoading" @click="submitCreateLibrary">
              Create
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
}

.header-section {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 16px;
}

.library-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .lib-header {
    display: flex;
    align-items: center;
  }

  .lib-desc {
    display: block;
    margin-top: 8px;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.new-lib-btn {
  height: 100%;
  min-height: 160px;
  border-style: dashed;
}

.empty-card {
  padding: 40px 0;
  background-color: #f9f9f9;
}

.right-drawer-content {
  padding: 24px;
}
</style>