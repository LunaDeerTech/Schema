<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h, nextTick } from 'vue'
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
  NLayoutSider,
  NDropdown
} from 'naive-ui'
import { 
  AddOutline as AddIcon,
  SearchOutline as SearchIcon,
  TimeOutline as TimeIcon,
  LibraryOutline as LibraryIcon,
  CheckmarkCircleOutline as CheckIcon,
  TrashOutline as TrashIcon,
  EllipsisHorizontal as MoreIcon
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

// Delete Library Modal State
const showDeleteModal = ref(false)
const libraryToDelete = ref<string | null>(null)
const deleteLibraryLoading = ref(false)

// Greeting Logic
const greetingPhrase = ref('Good Morning')

const updateGreeting = () => {
  const hour = new Date().getHours()
  let timePeriod = ''
  
  if (hour >= 5 && hour < 12) timePeriod = 'morning'
  else if (hour >= 12 && hour < 18) timePeriod = 'afternoon'
  else if (hour >= 18 && hour < 23) timePeriod = 'evening'
  else timePeriod = 'night'

  const greetings: Record<string, string[]> = {
    morning: [
      'Good Morning',
      'Rise and shine',
      'Wonderful morning',
      'Ready for the day'
    ],
    afternoon: [
      'Good Afternoon',
      'Hope your day is going well',
      'Good day',
      'Keep up the good work'
    ],
    evening: [
      'Good Evening',
      'Hope you had a great day',
      'Time to relax',
      'Good to see you'
    ],
    night: [
      'Good Night',
      'Burning the midnight oil',
      'Time to rest',
      'Late night inspiration'
    ]
  }

  const options = greetings[timePeriod]
  greetingPhrase.value = options[Math.floor(Math.random() * options.length)]
}

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

// Library Menu Options
const libraryOptions = [
  {
    label: 'Delete',
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(TrashIcon) })
  }
]

// Context Menu State
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuLibraryId = ref<string | null>(null)

const handleLibraryAction = (key: string, id: string) => {
  if (key === 'delete') {
    libraryToDelete.value = id
    showDeleteModal.value = true
  }
  showContextMenu.value = false
}

const handleContextMenu = (e: MouseEvent, id: string) => {
  e.preventDefault()
  showContextMenu.value = false
  nextTick().then(() => {
    showContextMenu.value = true
    contextMenuX.value = e.clientX
    contextMenuY.value = e.clientY
    contextMenuLibraryId.value = id
  })
}

const onClickoutside = () => {
  showContextMenu.value = false
}

const confirmDeleteLibrary = async () => {
  if (!libraryToDelete.value) return
  
  deleteLibraryLoading.value = true
  try {
    const success = await libraryStore.deleteLibrary(libraryToDelete.value)
    if (success) {
      message.success('Library deleted successfully')
      showDeleteModal.value = false
    }
  } catch (error) {
    message.error('Failed to delete library')
  } finally {
    deleteLibraryLoading.value = false
    libraryToDelete.value = null
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
  updateGreeting()
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
            <n-h1 style="margin-bottom: 0;">{{ greetingPhrase }}, {{ userStore.userName }}</n-h1>
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
            <n-card hoverable class="library-card" @click="navigateToLibrary(lib.id)" @contextmenu="(e: MouseEvent) => handleContextMenu(e, lib.id)">
              <template #header>
                <div class="lib-header">
                  <span v-if="lib.icon" style="font-size: 24px; margin-right: 12px; line-height: 1;">{{ lib.icon }}</span>
                  <n-text strong style="font-size: 16px;">{{ lib.title }}</n-text>
                </div>
              </template>
              <template #header-extra>
                <n-space align="center">
                  <n-tag size="small" :bordered="false">
                    {{ lib.pageCount || 0 }} pages
                  </n-tag>
                  <n-dropdown trigger="click" :options="libraryOptions" @select="(key) => handleLibraryAction(key, lib.id)">
                    <n-button quaternary circle size="small" @click.stop>
                      <template #icon><n-icon><MoreIcon /></n-icon></template>
                    </n-button>
                  </n-dropdown>
                </n-space>
              </template>
              
              <n-space size="small" style="margin-bottom: 12px;" v-if="lib.tags && lib.tags.length > 0">
                <n-tag v-for="tag in lib.tags" :key="tag.id" size="tiny" :bordered="false" type="info">
                  {{ tag.name }}
                </n-tag>
              </n-space>

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
              <div class="quick-actions-container">
                <div class="action-item" @click="handleCreateLibrary">
                  <n-button secondary circle type="primary" class="action-btn">
                    <template #icon><n-icon size="20"><AddIcon /></n-icon></template>
                  </n-button>
                  <n-text depth="3" class="action-label">New Lib</n-text>
                </div>
                <div class="action-item" @click="handleSearch">
                  <n-button secondary circle type="info" class="action-btn">
                    <template #icon><n-icon size="20"><SearchIcon /></n-icon></template>
                  </n-button>
                  <n-text depth="3" class="action-label">Search</n-text>
                </div>
                <div class="action-item">
                  <n-button secondary circle type="success" class="action-btn">
                    <template #icon><n-icon size="20"><CheckIcon /></n-icon></template>
                  </n-button>
                  <n-text depth="3" class="action-label">Tasks</n-text>
                </div>
              </div>
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

    <!-- Context Menu -->
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="contextMenuX"
      :y="contextMenuY"
      :options="libraryOptions"
      :show="showContextMenu"
      :on-clickoutside="onClickoutside"
      @select="(key) => contextMenuLibraryId && handleLibraryAction(key, contextMenuLibraryId)"
    />

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

    <!-- Delete Confirmation Modal -->
    <n-modal v-model:show="showDeleteModal">
      <n-card
        style="width: 400px"
        title="Delete Library"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <p>Are you sure you want to delete this library? This action cannot be undone and all pages within it will be deleted.</p>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">Cancel</n-button>
            <n-button type="error" :loading="deleteLibraryLoading" @click="confirmDeleteLibrary">
              Delete
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
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.new-lib-btn {
  height: 100%;
  min-height: 160px;
}

.empty-card {
  padding: 40px 0;
  background-color: #f9f9f9;
}

.right-drawer-content {
  padding: 24px;
}

.quick-actions-container {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    
    .action-btn {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .action-btn {
    width: 48px;
    height: 48px;
    transition: all 0.3s ease;
  }

  .action-label {
    font-size: 12px;
    font-weight: 500;
  }
}
</style>