<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { usePageStore } from '@/stores/page'
import { useLibraryStore } from '@/stores/library'
import { tagApi } from '@/api/tag'
import type { Tag } from '@/types'
import { 
  NBreadcrumb, NBreadcrumbItem,
  NInput, NTag, NButton, NIcon, NSpin, NDrawer, NDrawerContent,
  useMessage
} from 'naive-ui'
import { 
  InformationCircleOutline, TimeOutline, ListOutline, GlobeOutline,
  AddOutline
} from '@vicons/ionicons5'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'

const route = useRoute()
const pageStore = usePageStore()
const libraryStore = useLibraryStore()
const message = useMessage()

const pageId = computed(() => route.params.id as string)
const loading = ref(false)
const pageTags = ref<Tag[]>([])
const allTags = ref<Tag[]>([])
const showTagInput = ref(false)
const newTagValue = ref('')

// Drawer states
const showInfo = ref(false)
const showHistory = ref(false)
const showTasks = ref(false)
const showPublic = ref(false)

// Load page data
const loadPage = async () => {
  if (!pageId.value || pageId.value === 'undefined') return
  
  loading.value = true
  try {
    await pageStore.fetchPage(pageId.value)
    if (pageStore.currentPage) {
      // Load tags
      const tagsRes = await tagApi.getTagsForPage(pageId.value)
      if (tagsRes.code === 0) {
        pageTags.value = tagsRes.data
      }
      
      // Load all tags for autocomplete
      const allTagsRes = await tagApi.getTags()
      if (allTagsRes.code === 0) {
        allTags.value = allTagsRes.data
      }
    }
  } catch (e) {
    console.error(e)
    message.error('Failed to load page')
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)

watch(() => pageId.value, loadPage)

// Breadcrumbs
const breadcrumbs = computed(() => {
  const crumbs = []
  
  // Home
  crumbs.push({
    label: 'Home',
    to: { name: 'Home' }
  })

  if (!pageStore.currentPage) return crumbs

  // If this is a library (root), just show its title
  if (pageStore.currentPage.type === 'library') {
    crumbs.push({
      label: pageStore.currentPage.title,
      to: undefined // Current page
    })
    return crumbs
  }
  
  // Library
  if (pageStore.currentPage?.libraryId) {
    const lib = libraryStore.libraries.find(l => l.id === pageStore.currentPage?.libraryId)
    crumbs.push({
      label: lib?.title || 'Library',
      to: { name: 'Library', params: { id: pageStore.currentPage?.libraryId } }
    })
  }
  
  // Parent
  if (pageStore.currentPage?.parentId) {
     // Ideally fetch parent info. For now, just a placeholder if we don't have it.
     // If we had the tree loaded, we could find it.
     crumbs.push({
       label: '...',
       to: undefined // or link to parent if we knew the ID
     })
  }
  
  // Current Page
  if (pageStore.currentPage) {
    crumbs.push({
      label: pageStore.currentPage.title,
      to: { name: 'Page', params: { id: pageStore.currentPage.id } }
    })
  }
  
  return crumbs
})

// Title editing
const title = ref('')
watch(() => pageStore.currentPage, (newPage) => {
  if (newPage) {
    title.value = newPage.title
  }
})

const handleTitleSave = async () => {
  if (!pageStore.currentPage || title.value === pageStore.currentPage.title) return
  
  try {
    await pageStore.updatePage(pageStore.currentPage.id, { title: title.value })
    message.success('Title updated')
  } catch (e) {
    message.error('Failed to update title')
  }
}

// Tag management
const handleAddTag = async (value: string) => {
  if (!pageStore.currentPage || !value.trim()) return
  
  // Check if tag exists, if not create it
  let tag = allTags.value.find(t => t.name === value)
  
  try {
    if (!tag) {
      const res = await tagApi.createTag(value)
      if (res.code === 0) {
        tag = res.data
        allTags.value.push(tag)
      } else {
        throw new Error(res.message)
      }
    }
    
    if (tag) {
      // Attach to page
      await tagApi.attachTagToPage(pageStore.currentPage.id, tag.id)
      // Check if already in pageTags
      if (!pageTags.value.some(t => t.id === tag!.id)) {
        pageTags.value.push(tag)
      }
      message.success('Tag added')
    }
  } catch (e) {
    message.error('Failed to add tag')
  }
  
  showTagInput.value = false
  newTagValue.value = ''
}

const handleRemoveTag = async (tagId: string) => {
  if (!pageStore.currentPage) return
  
  try {
    await tagApi.detachTagFromPage(pageStore.currentPage.id, tagId)
    pageTags.value = pageTags.value.filter(t => t.id !== tagId)
    message.success('Tag removed')
  } catch (e) {
    message.error('Failed to remove tag')
  }
}

// Content update
const handleContentUpdate = useDebounceFn(async (content: any) => {
  if (!pageStore.currentPage) return
  
  try {
    // In a real app, we might want to check if content actually changed significantly
    await pageStore.updatePage(pageStore.currentPage.id, { content })
    // Optional: show saving indicator
  } catch (e) {
    console.error('Failed to save content', e)
    message.error('Failed to save content')
  }
}, 1000)

</script>

<template>
  <div class="page-content" v-if="pageStore.currentPage">
    <!-- Header -->
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item v-for="(crumb, index) in breadcrumbs" :key="index" :to="crumb.to">
          {{ crumb.label }}
        </n-breadcrumb-item>
      </n-breadcrumb>
      
      <div class="header-main">
        <div class="title-section">
          <n-input 
            v-model:value="title" 
            type="text" 
            placeholder="Page Title" 
            class="title-input"
            @blur="handleTitleSave"
            @keyup.enter="handleTitleSave"
          />
        </div>
        
        <div class="actions">
          <n-button quaternary circle @click="showInfo = true">
            <template #icon><n-icon><InformationCircleOutline /></n-icon></template>
          </n-button>
          <n-button quaternary circle @click="showHistory = true">
            <template #icon><n-icon><TimeOutline /></n-icon></template>
          </n-button>
          <n-button quaternary circle @click="showTasks = true">
            <template #icon><n-icon><ListOutline /></n-icon></template>
          </n-button>
          <n-button quaternary circle @click="showPublic = true">
            <template #icon><n-icon><GlobeOutline /></n-icon></template>
          </n-button>
        </div>
      </div>
      
      <div class="meta-section">
        <div class="tags">
          <n-tag 
            v-for="tag in pageTags" 
            :key="tag.id" 
            closable 
            @close="handleRemoveTag(tag.id)"
            size="small"
          >
            {{ tag.name }}
          </n-tag>
          
          <n-input
            v-if="showTagInput"
            v-model:value="newTagValue"
            placeholder="New Tag"
            size="small"
            autosize
            style="width: 100px"
            @blur="showTagInput = false"
            @keyup.enter="handleAddTag(newTagValue)"
          />
          <n-button v-else size="tiny" dashed @click="showTagInput = true">
            <template #icon><n-icon><AddOutline /></n-icon></template>
            Add Tag
          </n-button>
        </div>
        
        <div class="timestamps">
          <span>Created: {{ new Date(pageStore.currentPage.createdAt).toLocaleDateString() }}</span>
          <span>Updated: {{ new Date(pageStore.currentPage.updatedAt).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="content-area">
      <TiptapEditor 
        :key="pageStore.currentPage.id"
        :content="pageStore.currentPage.content" 
        @update="handleContentUpdate" 
      />
    </div>
    
    <!-- Drawers/Modals -->
    <n-drawer v-model:show="showInfo" width="300">
      <n-drawer-content title="Page Info">
        <p>Page ID: {{ pageStore.currentPage.id }}</p>
        <p>Library ID: {{ pageStore.currentPage.libraryId }}</p>
        <!-- Placeholder -->
      </n-drawer-content>
    </n-drawer>
    
    <n-drawer v-model:show="showHistory" width="300">
      <n-drawer-content title="Version History">
        <p>History placeholder</p>
      </n-drawer-content>
    </n-drawer>
    
    <n-drawer v-model:show="showTasks" width="300">
      <n-drawer-content title="Tasks">
        <p>Tasks placeholder</p>
      </n-drawer-content>
    </n-drawer>
    
    <n-drawer v-model:show="showPublic" width="300">
      <n-drawer-content title="Public Access">
        <p>Public access settings placeholder</p>
      </n-drawer-content>
    </n-drawer>
  </div>
  <div v-else-if="loading" class="loading-state">
    <n-spin size="large" />
  </div>
  <div v-else class="empty-state">
    Select a page to view content
  </div>
</template>

<style scoped lang="scss">
.page-content {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  
  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    margin-bottom: 16px;
    
    .title-section {
      flex: 1;
      margin-right: 16px;
      
      .title-input {
        font-size: 24px;
        font-weight: bold;
        border: none;
        background: transparent;
        padding: 0;
        
        :deep(.n-input__input-el) {
          height: auto;
        }
        
        :deep(.n-input__border), :deep(.n-input__state-border) {
          display: none;
        }
        
        &:hover {
          background: rgba(0, 0, 0, 0.02);
        }
      }
    }
  }
  
  .meta-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--n-text-color-3);
    
    .tags {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .timestamps {
      display: flex;
      gap: 16px;
    }
  }
}

.content-area {
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
    font-size: 12px;
    color: #666;
  }
}

.loading-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}
</style>
