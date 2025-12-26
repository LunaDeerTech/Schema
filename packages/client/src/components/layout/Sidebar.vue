<script setup lang="ts">
import { ref, computed, onMounted, watch, h, nextTick } from 'vue'
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
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDropdown,
  useMessage,
  type TreeOption
} from 'naive-ui'
import { 
  AddOutline as AddIcon,
  LibraryOutline as LibraryIcon,

  SettingsOutline as SettingsIcon
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
const message = useMessage()

// Create Library Modal State
const showCreateLibraryModal = ref(false)
const createLibraryModel = ref({
  title: '',
  description: ''
})
const createLibraryLoading = ref(false)

// Create Page Modal State
const showCreatePageModal = ref(false)
const createPageModel = ref({
  title: ''
})
const createPageLoading = ref(false)

// Rename Page Modal State
const showRenamePageModal = ref(false)
const renamePageModel = ref({ id: '', title: '' })
const renamePageLoading = ref(false)

// Edit Library Modal State
const showEditLibraryModal = ref(false)
const editLibraryModel = ref({ id: '', title: '', description: '' })
const editLibraryLoading = ref(false)

// Context Menu State
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentContextNode = ref<TreeOption | null>(null)

const contextMenuOptions = [
  { label: 'Rename', key: 'rename' },
  { label: 'Delete', key: 'delete' }
]

const libraryActionOptions = [
  { label: 'Edit Library', key: 'edit' },
  { label: 'Delete Library', key: 'delete' }
]

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
    const selectedKey = keys[0]
    selectedKeys.value = [selectedKey]
    router.push(`/page/${selectedKey}`)
  }
}

const getNodeProps = (option: TreeOption) => {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      showContextMenu.value = false
      nextTick().then(() => {
        showContextMenu.value = true
        contextMenuX.value = e.clientX
        contextMenuY.value = e.clientY
        currentContextNode.value = option
      })
    }
  }
}

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
      // Fetch pages for the new library (empty)
      await pageStore.fetchPages(newLib.id)
      router.push(`/library/${newLib.id}`)
    }
  } catch (error) {
    message.error('Failed to create library')
  } finally {
    createLibraryLoading.value = false
  }
}

const handleCreatePage = () => {
  if (!libraryStore.currentLibrary) {
    message.warning('Please select a library first')
    return
  }
  createPageModel.value = { title: '' }
  showCreatePageModal.value = true
}

const submitCreatePage = async () => {
  if (!createPageModel.value.title) {
    message.warning('Please enter a page title')
    return
  }
  
  if (!libraryStore.currentLibrary) return

  createPageLoading.value = true
  try {
    const newPage = await pageStore.createPage({
      title: createPageModel.value.title,
      libraryId: libraryStore.currentLibrary.id,
      content: { type: 'doc', content: [] }
    })
    
    if (newPage && newPage.id) {
      message.success('Page created successfully')
      showCreatePageModal.value = false
      router.push(`/page/${newPage.id}`)
    } else {
      console.error('Page created but returned invalid data:', newPage)
      message.error(pageStore.error || 'Failed to create page: Invalid response')
    }
  } catch (error) {
    message.error('Failed to create page')
  } finally {
    createPageLoading.value = false
  }
}

const allowDrop = (_: { dropPosition: 'before' | 'inside' | 'after', node: TreeOption }) => {
  return true
}

const handleDrop = async ({ node, dragNode, dropPosition }: { node: TreeOption, dragNode: TreeOption, dropPosition: 'before' | 'inside' | 'after' }) => {
  const dragNodeId = dragNode.key as string
  const dropNodeId = node.key as string
  
  // Find the drop node in the pages list to get its parentId
  const dropPage = pageStore.pages.find(p => p.id === dropNodeId)
  if (!dropPage) return

  let newParentId: string | null | undefined
  let sortOrder: number | undefined

  if (dropPosition === 'inside') {
    newParentId = dropNodeId
    // When moving inside, we don't specify sortOrder, letting backend append it to the end
    // Or we could find the max sortOrder of children and add 1
  } else {
    // 'before' or 'after'
    newParentId = dropPage.parentId || null
    
    // Calculate new sortOrder
    // We want to take the spot of the dropPage (for before) or the spot after (for after)
    // The backend should handle shifting other items
    if (dropPosition === 'before') {
      sortOrder = dropPage.sortOrder
    } else {
      sortOrder = dropPage.sortOrder + 1
    }
  }

  console.log('Moving page:', { dragNodeId, newParentId, sortOrder, dropPosition })

  // Call store action to move page
  try {
    await pageStore.movePage(dragNodeId, {
      newParentId: newParentId,
      sortOrder: sortOrder
    })
    message.success('Page moved successfully')
    
    // If dropped inside, expand the target node
    if (dropPosition === 'inside') {
      if (!expandedKeys.value.includes(dropNodeId)) {
        expandedKeys.value.push(dropNodeId)
      }
    }
  } catch (e) {
    console.error('Move failed', e)
    message.error('Failed to move page')
  }
}

const handleContextSelect = async (key: string) => {
  showContextMenu.value = false
  if (!currentContextNode.value) return
  
  const pageId = currentContextNode.value.key as string
  
  if (key === 'delete') {
    if (!confirm('Are you sure you want to delete this page?')) return
    try {
      await pageStore.deletePage(pageId)
      message.success('Page deleted')
      if (libraryStore.currentLibrary) {
        await pageStore.fetchPages(libraryStore.currentLibrary.id)
      }
      if (route.params.id === pageId) {
        router.push(`/library/${libraryStore.currentLibrary?.id}`)
      }
    } catch (e) {
      message.error('Failed to delete page')
    }
  } else if (key === 'rename') {
    renamePageModel.value = { id: pageId, title: currentContextNode.value.label as string }
    showRenamePageModal.value = true
  }
}

const submitRenamePage = async () => {
  if (!renamePageModel.value.title) return
  renamePageLoading.value = true
  try {
    await pageStore.updatePage(renamePageModel.value.id, { title: renamePageModel.value.title })
    message.success('Page renamed')
    showRenamePageModal.value = false
    if (libraryStore.currentLibrary) {
      await pageStore.fetchPages(libraryStore.currentLibrary.id)
    }
  } catch (e) {
    message.error('Failed to rename page')
  } finally {
    renamePageLoading.value = false
  }
}

const handleLibraryAction = async (key: string) => {
  if (!libraryStore.currentLibrary) return
  
  if (key === 'delete') {
    if (!confirm('Are you sure you want to delete this library? All pages in it will be deleted.')) return
    try {
      await libraryStore.deleteLibrary(libraryStore.currentLibrary.id)
      message.success('Library deleted')
      await libraryStore.fetchLibraries()
      if (libraryStore.libraries.length > 0) {
        libraryStore.setCurrentLibrary(libraryStore.libraries[0])
        router.push(`/library/${libraryStore.libraries[0].id}`)
      } else {
        libraryStore.setCurrentLibrary(null)
        router.push('/home')
      }
    } catch (e) {
      message.error('Failed to delete library')
    }
  } else if (key === 'edit') {
    editLibraryModel.value = { 
      id: libraryStore.currentLibrary.id,
      title: libraryStore.currentLibrary.title,
      description: libraryStore.currentLibrary.description || ''
    }
    showEditLibraryModal.value = true
  }
}

const submitEditLibrary = async () => {
  if (!editLibraryModel.value.title) return
  editLibraryLoading.value = true
  try {
    await libraryStore.updateLibrary(editLibraryModel.value.id, {
      title: editLibraryModel.value.title,
      description: editLibraryModel.value.description
    })
    message.success('Library updated')
    showEditLibraryModal.value = false
    await libraryStore.fetchLibraries()
  } catch (e) {
    message.error('Failed to update library')
  } finally {
    editLibraryLoading.value = false
  }
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
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <n-text depth="3" class="section-label">LIBRARY</n-text>
            <n-dropdown :options="libraryActionOptions" @select="handleLibraryAction" v-if="libraryStore.currentLibrary">
              <n-button text size="tiny">
                <template #icon>
                  <n-icon><SettingsIcon /></n-icon>
                </template>
              </n-button>
            </n-dropdown>
          </div>
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
            :node-props="getNodeProps"
            draggable
            @drop="handleDrop"
            :allow-drop="allowDrop"
          />
        </n-scrollbar>
      </div>
    </div>

    <!-- Context Menu -->
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="contextMenuX"
      :y="contextMenuY"
      :options="contextMenuOptions"
      :show="showContextMenu"
      :on-clickoutside="() => showContextMenu = false"
      @select="handleContextSelect"
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
          <n-form-item label="Title">
            <n-input v-model:value="createLibraryModel.title" placeholder="Library Title" />
          </n-form-item>
          <n-form-item label="Description">
            <n-input
              v-model:value="createLibraryModel.description"
              type="textarea"
              placeholder="Description (Optional)"
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

    <!-- Create Page Modal -->
    <n-modal v-model:show="showCreatePageModal">
      <n-card
        style="width: 600px"
        title="Create New Page"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form>
          <n-form-item label="Title">
            <n-input v-model:value="createPageModel.title" placeholder="Page Title" @keyup.enter="submitCreatePage" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showCreatePageModal = false">Cancel</n-button>
            <n-button type="primary" :loading="createPageLoading" @click="submitCreatePage">
              Create
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>

    <!-- Rename Page Modal -->
    <n-modal v-model:show="showRenamePageModal">
      <n-card
        style="width: 600px"
        title="Rename Page"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form>
          <n-form-item label="Title">
            <n-input v-model:value="renamePageModel.title" placeholder="Page Title" @keyup.enter="submitRenamePage" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showRenamePageModal = false">Cancel</n-button>
            <n-button type="primary" :loading="renamePageLoading" @click="submitRenamePage">
              Rename
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>

    <!-- Edit Library Modal -->
    <n-modal v-model:show="showEditLibraryModal">
      <n-card
        style="width: 600px"
        title="Edit Library"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form>
          <n-form-item label="Title">
            <n-input v-model:value="editLibraryModel.title" placeholder="Library Title" />
          </n-form-item>
          <n-form-item label="Description">
            <n-input
              v-model:value="editLibraryModel.description"
              type="textarea"
              placeholder="Description (Optional)"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showEditLibraryModal = false">Cancel</n-button>
            <n-button type="primary" :loading="editLibraryLoading" @click="submitEditLibrary">
              Save
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
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
