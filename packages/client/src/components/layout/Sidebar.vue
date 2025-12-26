<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NLayoutSider, 
  NSelect, 
  NTree, 
  NButton, 
  NIcon, 
  NSpace,
  NText,
  NScrollbar,
  type TreeOption
} from 'naive-ui'
import { 
  AddOutline as AddIcon,
  LibraryOutline as LibraryIcon,
  DocumentTextOutline as PageIcon,
  FolderOpenOutline as FolderIcon
} from '@vicons/ionicons5'
import { useLibraryStore } from '@/stores/library'
import { usePageStore } from '@/stores/page'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
}>()

const router = useRouter()
const route = useRoute()
const libraryStore = useLibraryStore()
const pageStore = usePageStore()

// Library Selection
const libraryOptions = computed(() => {
  return libraryStore.libraries.map(lib => ({
    label: lib.title,
    value: lib.id
  }))
})

const currentLibraryId = computed({
  get: () => libraryStore.currentLibrary?.id || null,
  set: (val) => {
    if (val) {
      const lib = libraryStore.libraries.find(l => l.id === val)
      if (lib) {
        libraryStore.setCurrentLibrary(lib)
        router.push(`/library/${lib.id}`)
      }
    }
  }
})

// Page Tree
const pageTreeOptions = computed(() => {
  const mapPages = (pages: any[]): TreeOption[] => {
    return pages.map(page => ({
      label: page.title,
      key: page.id,
      prefix: () => h(NIcon, null, { default: () => h(page.children?.length ? FolderIcon : PageIcon) }),
      children: page.children && page.children.length > 0 ? mapPages(page.children) : undefined
    }))
  }
  return mapPages(pageStore.pageTree)
})

const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// Actions
const handleLibraryChange = async (value: string) => {
  const lib = libraryStore.libraries.find(l => l.id === value)
  if (lib) {
    libraryStore.setCurrentLibrary(lib)
    await pageStore.fetchPages(lib.id)
    router.push(`/library/${lib.id}`)
  }
}

const handlePageSelect = (keys: string[]) => {
  if (keys.length > 0) {
    selectedKeys.value = keys
    router.push(`/page/${keys[0]}`)
  }
}

const handleCreateLibrary = () => {
  // TODO: Open create library modal
  console.log('Create Library')
}

const handleCreatePage = () => {
  // TODO: Create new page in current library
  console.log('Create Page')
}

// Initialization
onMounted(async () => {
  await libraryStore.fetchLibraries()
  
  // If route has library ID, select it
  if (route.name === 'Library') {
    const routeLibId = route.params.id as string
    if (routeLibId) {
      const lib = libraryStore.libraries.find(l => l.id === routeLibId)
      if (lib) {
        libraryStore.setCurrentLibrary(lib)
      }
    }
  } else if (libraryStore.libraries.length > 0 && !libraryStore.currentLibrary) {
    // Select first library by default if none selected
    libraryStore.setCurrentLibrary(libraryStore.libraries[0])
  }

  if (libraryStore.currentLibrary) {
    await pageStore.fetchPages(libraryStore.currentLibrary.id)
  }
})

// Watch for route changes to update selection
watch(() => route.params.id, async (newId) => {
  if (route.name === 'Library' && newId && typeof newId === 'string' && newId !== libraryStore.currentLibrary?.id) {
    const lib = libraryStore.libraries.find(l => l.id === newId)
    if (lib) {
      libraryStore.setCurrentLibrary(lib)
      await pageStore.fetchPages(lib.id)
    }
  }
})

// Watch for current page changes (e.g. when navigating to a page directly)
watch(() => pageStore.currentPage, async (page) => {
  if (page) {
    // Update selected key in tree
    selectedKeys.value = [page.id]
    
    // If page belongs to a different library, switch library
    if (page.libraryId && page.libraryId !== libraryStore.currentLibrary?.id) {
      const lib = libraryStore.libraries.find(l => l.id === page.libraryId)
      if (lib) {
        libraryStore.setCurrentLibrary(lib)
        await pageStore.fetchPages(lib.id)
      }
    }
  }
})
</script>

<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="260"
    :collapsed="collapsed"
    show-trigger
    @collapse="emit('update:collapsed', true)"
    @expand="emit('update:collapsed', false)"
    class="sidebar"
  >
    <div class="sidebar-content">
      <!-- Library Switcher -->
      <div class="library-section" v-if="!collapsed">
        <n-space vertical :size="12">
          <n-text depth="3" class="section-label">LIBRARY</n-text>
          <n-select
            v-model:value="currentLibraryId"
            :options="libraryOptions"
            placeholder="Select Library"
            @update:value="handleLibraryChange"
            size="small"
          />
          <n-button block dashed size="small" @click="handleCreateLibrary">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            New Library
          </n-button>
        </n-space>
      </div>
      <div class="collapsed-icon" v-else>
        <n-icon size="24"><LibraryIcon /></n-icon>
      </div>

      <!-- Page Tree -->
      <div class="page-tree-section" v-if="!collapsed">
        <div class="tree-header">
          <n-text depth="3" class="section-label">PAGES</n-text>
          <n-button text size="tiny" @click="handleCreatePage">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
          </n-button>
        </div>
        
        <n-scrollbar style="max-height: calc(100vh - 200px)">
          <n-tree
            block-line
            :data="pageTreeOptions"
            :selected-keys="selectedKeys"
            :expanded-keys="expandedKeys"
            @update:selected-keys="handlePageSelect"
            @update:expanded-keys="(keys) => expandedKeys = keys"
            selectable
            expand-on-click
          />
        </n-scrollbar>
      </div>
    </div>
  </n-layout-sider>
</template>

<style scoped lang="scss">
.sidebar {
  background-color: #f8f9fa;
}

.sidebar-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.library-section {
  margin-bottom: 24px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.collapsed-icon {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}
</style>
