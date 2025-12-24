<template>
  <div class="library-container">
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
          <n-text strong v-if="!collapsed">知识库</n-text>
          <n-text strong v-else>K</n-text>
        </div>
        
        <div class="sidebar-actions" v-if="!collapsed">
          <n-button type="primary" block @click="handleCreatePage">
            新建页面
          </n-button>
        </div>
        
        <n-menu
          v-model:value="activePageId"
          :collapsed="collapsed"
          :options="pageTreeOptions"
          @update:value="handlePageSelect"
        />
      </n-layout-sider>
      
      <!-- Main Content -->
      <n-layout>
        <!-- Header -->
        <n-layout-header bordered class="header">
          <div class="header-content">
            <n-breadcrumb>
              <n-breadcrumb-item @click="$router.push('/home')">
                首页
              </n-breadcrumb-item>
              <n-breadcrumb-item>
                {{ currentLibrary?.title || '知识库' }}
              </n-breadcrumb-item>
              <n-breadcrumb-item v-if="currentPage">
                {{ currentPage.title }}
              </n-breadcrumb-item>
            </n-breadcrumb>
            
            <div class="header-actions">
              <n-button text @click="handleSearch" style="margin-right: 12px;">
                搜索
              </n-button>
              
              <n-dropdown :options="actionOptions" @select="handleActionSelect">
                <n-button>更多操作</n-button>
              </n-dropdown>
            </div>
          </div>
        </n-layout-header>
        
        <!-- Content Area -->
        <n-layout-content class="content-area" :native-scrollbar="false">
          <div v-if="!currentPage && !activePageId" class="empty-state">
            <n-empty description="选择一个页面开始编辑，或创建新页面">
              <template #extra>
                <n-button type="primary" @click="handleCreatePage">
                  创建页面
                </n-button>
              </template>
            </n-empty>
          </div>
          
          <div v-else class="page-editor">
            <!-- Page Header -->
            <div class="page-header">
              <n-input
                v-model:value="pageTitle"
                placeholder="输入页面标题"
                size="large"
                :disabled="loading"
                @blur="savePage"
              />
              
              <div class="page-meta">
                <n-tag
                  v-for="tag in pageTags"
                  :key="tag.id"
                  :type="tag.color as any"
                  size="small"
                  closable
                  @close="removeTag(tag.id)"
                >
                  {{ tag.name }}
                </n-tag>
                <n-button text type="primary" @click="addTag">
                  + 添加标签
                </n-button>
              </div>
            </div>
            
            <!-- Editor Placeholder -->
            <n-card class="editor-placeholder" v-if="!showEditor">
              <n-space vertical size="large">
                <n-text type="secondary">
                  页面内容编辑器将在后续开发中实现
                </n-text>
                <n-button type="primary" @click="showEditor = true">
                  启动编辑器
                </n-button>
              </n-space>
            </n-card>
            
            <!-- Editor Area -->
            <div v-else class="editor-area">
              <n-card>
                <div class="editor-content">
                  <n-text type="secondary">
                    这里将是完整的富文本编辑器区域，支持：
                  </n-text>
                  <n-ol>
                    <n-li>Markdown 语法支持</n-li>
                    <n-li>Slash 命令 (/) 快速插入组件</n-li>
                    <n-li>文字选中工具栏</n-li>
                    <n-li>页面引用 ({{ }})</n-li>
                    <n-li>任务列表</n-li>
                    <n-li>代码块高亮</n-li>
                  </n-ol>
                </div>
              </n-card>
            </div>
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage, NIcon, type MenuOption } from 'naive-ui'
import { 
  DocumentTextOutline as PageIcon,
  TrashOutline as DeleteIcon,
  ShareOutline as ShareIcon,
  DownloadOutline as ExportIcon
} from '@vicons/ionicons5'

const route = useRoute()
const message = useMessage()

const collapsed = ref(false)
const activePageId = ref<string>('')
const loading = ref(false)
const showEditor = ref(false)

// Current library
const currentLibrary = ref({
  id: route.params.id as string || 'default',
  title: '我的图书馆'
})

// Current page
const currentPage = ref<{
  id: string
  title: string
  content?: any
} | null>(null)

// Page title
const pageTitle = ref('')

// Tags
const pageTags = ref<Array<{ id: string, name: string, color: string }>>([])

// Mock page tree
const pageTree = ref([
  {
    id: '1',
    label: 'React Hooks 最佳实践',
    key: '1',
    icon: () => h(NIcon, null, { default: () => h(PageIcon) })
  },
  {
    id: '2',
    label: 'Vue 3 组件设计',
    key: '2',
    icon: () => h(NIcon, null, { default: () => h(PageIcon) })
  },
  {
    id: '3',
    label: 'TypeScript 笔记',
    key: '3',
    icon: () => h(NIcon, null, { default: () => h(PageIcon) })
  }
])

const pageTreeOptions = computed<MenuOption[]>(() => {
  return pageTree.value.map(page => ({
    label: page.label,
    key: page.key,
    icon: page.icon
  }))
})

// Action dropdown options
const actionOptions = [
  {
    label: '导出 Markdown',
    key: 'export',
    icon: () => h(NIcon, null, { default: () => h(ExportIcon) })
  },
  {
    label: '公开分享',
    key: 'share',
    icon: () => h(NIcon, null, { default: () => h(ShareIcon) })
  },
  {
    label: '删除页面',
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(DeleteIcon) })
  }
]

// Handle page selection
const handlePageSelect = (key: string) => {
  activePageId.value = key
  const page = pageTree.value.find(p => p.id === key)
  
  if (page) {
    currentPage.value = {
      id: page.id,
      title: page.label
    }
    pageTitle.value = page.label
    showEditor.value = false
    
    // Load page content (mock)
    message.success(`已加载页面: ${page.label}`)
  }
}

// Handle create page
const handleCreatePage = () => {
  const newId = Date.now().toString()
  const newPage = {
    id: newId,
    label: '新页面',
    key: newId,
    icon: () => h(NIcon, null, { default: () => h(PageIcon) })
  }
  
  pageTree.value.push(newPage)
  handlePageSelect(newId)
  message.success('新页面已创建')
}

// Handle action selection
const handleActionSelect = (key: string) => {
  switch (key) {
    case 'export':
      message.info('导出功能将在后续开发中实现')
      break
    case 'share':
      message.info('公开分享功能将在后续开发中实现')
      break
    case 'delete':
      if (activePageId.value) {
        const index = pageTree.value.findIndex(p => p.id === activePageId.value)
        if (index > -1) {
          pageTree.value.splice(index, 1)
          activePageId.value = ''
          currentPage.value = null
          showEditor.value = false
          message.success('页面已删除')
        }
      }
      break
  }
}

// Handle search
const handleSearch = () => {
  message.info('搜索功能将在后续开发中实现')
}

// Save page
const savePage = () => {
  if (currentPage.value) {
    currentPage.value.title = pageTitle.value
    const page = pageTree.value.find(p => p.id === currentPage.value!.id)
    if (page) {
      page.label = pageTitle.value
    }
    message.success('页面已保存')
  }
}

// Tag management
const addTag = () => {
  const colors = ['success', 'warning', 'error', 'info', 'primary']
  const color = colors[Math.floor(Math.random() * colors.length)]
  
  pageTags.value.push({
    id: Date.now().toString(),
    name: `标签${pageTags.value.length + 1}`,
    color
  })
}

const removeTag = (id: string) => {
  pageTags.value = pageTags.value.filter(tag => tag.id !== id)
}

// Initialize
onMounted(() => {
  if (route.params.id) {
    currentLibrary.value.id = route.params.id as string
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.library-container {
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

.sidebar-actions {
  padding: 12px;
  border-bottom: 1px solid $ios-separator-non-opaque;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-area {
  padding: 24px;
  background-color: $ios-background-primary;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.page-editor {
  max-width: 900px;
  margin: 0 auto;
  background-color: $ios-background-secondary;
  padding: 40px;
  border-radius: $ios-border-radius-m;
  box-shadow: $ios-shadow-1;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 20px;
  
  .n-input {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    background-color: transparent;
    
    :deep(.n-input__input-el) {
      color: $ios-text-primary;
    }
  }
}

.page-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.editor-placeholder {
  text-align: center;
  padding: 40px 20px;
}

.editor-area {
  .editor-content {
    min-height: 400px;
    padding: 20px 0;
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 20px;
      margin-bottom: 12px;
      color: $ios-text-primary;
    }
    
    p {
      line-height: 1.8;
      margin-bottom: 16px;
      color: $ios-text-primary;
    }
  }
}

.n-ol {
  margin-top: 12px;
  padding-left: 24px;
  
  li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
}
</style>