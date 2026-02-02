<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { usePageStore } from '@/stores/page'
import { useLibraryStore } from '@/stores/library'
import { tagApi } from '@/api/tag'
import { pageApi } from '@/api/page'
import type { Tag } from '@/types'
import {
  NBreadcrumb, NBreadcrumbItem,
  NInput, NTag, NButton, NIcon, NSpin, NDrawer, NDrawerContent,
  NInputNumber, useMessage, NDropdown
} from 'naive-ui'
import { 
  InformationCircleOutline, TimeOutline, ListOutline, GlobeOutline,
  AddOutline, EllipsisHorizontalOutline
} from '@vicons/ionicons5'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'
import IconPicker from '@/components/common/IconPicker.vue'
import PublicAccessDrawer from '@/components/common/PublicAccessDrawer.vue'
import VersionHistoryDrawer from '@/components/common/VersionHistoryDrawer.vue'

const route = useRoute()
const pageStore = usePageStore()
const libraryStore = useLibraryStore()
const message = useMessage()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

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
const showVersionHistory = ref(false)

// Load page data
const loadPage = async () => {
  if (!pageId.value || pageId.value === 'undefined') return

  loading.value = true
  try {
    await pageStore.fetchPage(pageId.value)
    if (pageStore.currentPage) {
      console.debug('Page content type:', typeof pageStore.currentPage.content)
      console.debug('Page content:', pageStore.currentPage.content)

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

// Title and Description editing
const title = ref('')
const description = ref('')
const versionRetentionLimit = ref(99)

watch(() => pageStore.currentPage, (newPage) => {
  if (newPage) {
    title.value = newPage.title
    description.value = newPage.description || ''
    // Load version retention limit from metadata
    if (newPage.metadata && newPage.metadata.versionRetentionLimit !== undefined) {
      versionRetentionLimit.value = newPage.metadata.versionRetentionLimit
    } else {
      versionRetentionLimit.value = 99
    }
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

const handleDescriptionSave = async () => {
  if (!pageStore.currentPage || description.value === (pageStore.currentPage.description || '')) return
  
  try {
    await pageStore.updatePage(pageStore.currentPage.id, { description: description.value })
    message.success('Description updated')
  } catch (e) {
    message.error('Failed to update description')
  }
}

const handleIconUpdate = async (icon: string | undefined | null) => {
  if (!pageStore.currentPage) return

  try {
    // If it's a library page, we might need to update library store too if it's loaded there
    // But pageStore.updatePage should handle the API call
    await pageStore.updatePage(pageStore.currentPage.id, { icon: icon ?? null })
    
    // Check if this page corresponds to a library and update it
    const lib = libraryStore.libraries.find(l => l.id === pageStore.currentPage?.id)
    if (lib) {
      // Update the library in the list
      lib.icon = icon
      
      // If it's the currently selected library, update that too to trigger reactivity in Sidebar
      if (libraryStore.currentLibrary?.id === lib.id) {
        libraryStore.setCurrentLibrary({ ...lib, icon })
      }
    }
    
    message.success('Icon updated')
  } catch (e) {
    message.error('Failed to update icon')
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

const handlePageUpdate = (updatedData: any) => {
  if (pageStore.currentPage) {
    // Update local state
    pageStore.currentPage = { ...pageStore.currentPage, ...updatedData }

    // If it's a library, update library store too
    if (pageStore.currentPage && pageStore.currentPage.type === 'library') {
      const lib = libraryStore.libraries.find(l => l.id === pageStore.currentPage?.id)
      if (lib) {
        Object.assign(lib, updatedData)
      }
    }
  }
}

const handleUpdateSettings = async () => {
  if (!pageStore.currentPage) return

  try {
    const res = await pageApi.updatePageSettings(pageStore.currentPage.id, {
      versionRetentionLimit: versionRetentionLimit.value
    })
    if (res.code === 0) {
      message.success('Settings updated successfully')
      // Update local metadata
      if (pageStore.currentPage) {
        const metadata = pageStore.currentPage.metadata || {}
        metadata.versionRetentionLimit = versionRetentionLimit.value
        pageStore.currentPage.metadata = metadata
      }
    } else {
      message.error(res.message || 'Failed to update settings')
    }
  } catch (e) {
    console.error('Failed to update settings', e)
    message.error('Failed to update settings')
  }
}

// Mobile Actions Menu
const mobileActionOptions = [
  { label: 'Info', key: 'info', icon: () => h(NIcon, null, { default: () => h(InformationCircleOutline) }) },
  { label: 'History', key: 'history', icon: () => h(NIcon, null, { default: () => h(TimeOutline) }) },
  { label: 'Tasks', key: 'tasks', icon: () => h(NIcon, null, { default: () => h(ListOutline) }) },
  { label: 'Public Access', key: 'public', icon: () => h(NIcon, null, { default: () => h(GlobeOutline) }) },
]

const handleMobileActionSelect = (key: string) => {
  if (key === 'info') showInfo.value = true
  if (key === 'history') showVersionHistory.value = true
  if (key === 'tasks') showTasks.value = true
  if (key === 'public') showPublic.value = true
}

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

      <div class="header-main" :class="{ 'mobile-header': isMobile }">
        <div class="title-section">
          <IconPicker 
            :value="pageStore.currentPage.icon ?? undefined"
            @update:value="handleIconUpdate" 
          />
          <div class="title-wrapper">
            <n-input 
              v-model:value="title" 
              type="text" 
              placeholder="Page Title" 
              class="title-input"
              @blur="handleTitleSave"
              @keyup.enter="handleTitleSave"
            />
            <n-input 
              v-model:value="description" 
              type="text" 
              placeholder="Add description..." 
              class="description-input"
              :maxlength="100"
              @blur="handleDescriptionSave"
              @keyup.enter="handleDescriptionSave"
            />
          </div>
        </div>
        
        <div class="actions" v-if="!isMobile">
          <n-button quaternary circle @click="showInfo = true">
            <template #icon><n-icon><InformationCircleOutline /></n-icon></template>
          </n-button>
          <n-button quaternary circle @click="showVersionHistory = true">
            <template #icon><n-icon><TimeOutline /></n-icon></template>
          </n-button>
          <n-button quaternary circle @click="showTasks = true">
            <template #icon><n-icon><ListOutline /></n-icon></template>
          </n-button>
          <n-button quaternary circle @click="showPublic = true">
            <template #icon><n-icon><GlobeOutline /></n-icon></template>
          </n-button>
        </div>
        <div class="actions-mobile" v-else>
           <n-dropdown :options="mobileActionOptions" @select="handleMobileActionSelect">
             <n-button quaternary circle>
                <template #icon><n-icon><EllipsisHorizontalOutline /></n-icon></template>
             </n-button>
           </n-dropdown>
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
        :page-id="pageStore.currentPage.id"
        :library-id="pageStore.currentPage.libraryId"
        @update="handleContentUpdate" 
      />
    </div>
    
    <!-- Drawers/Modals -->
    <n-drawer v-model:show="showInfo" width="350">
      <n-drawer-content title="Page Info">
        <div class="page-info-content">
          <div class="info-section">
            <h4>Basic Information</h4>
            <p><strong>Page ID:</strong> {{ pageStore.currentPage.id }}</p>
            <p><strong>Library ID:</strong> {{ pageStore.currentPage.libraryId || 'N/A' }}</p>
            <p><strong>Type:</strong> {{ pageStore.currentPage.type }}</p>
          </div>

          <div class="info-section">
            <h4>Version History Settings</h4>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
              Set the maximum number of versions to keep for this page.
            </p>
            <n-input-number
              v-model:value="versionRetentionLimit"
              :min="0"
              :max="999"
              placeholder="99"
              size="small"
              style="width: 100%; margin-bottom: 8px;"
            >
              <template #suffix>versions</template>
            </n-input-number>
            <n-button
              size="small"
              type="primary"
              :disabled="!pageStore.currentPage?.id"
              @click="handleUpdateSettings"
            >
              Save Settings
            </n-button>
          </div>

          <div class="info-section">
            <h4>Timestamps</h4>
            <p><strong>Created:</strong> {{ new Date(pageStore.currentPage.createdAt).toLocaleString() }}</p>
            <p><strong>Updated:</strong> {{ new Date(pageStore.currentPage.updatedAt).toLocaleString() }}</p>
          </div>
        </div>
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
    
    <PublicAccessDrawer
      v-model:show="showPublic"
      :type="pageStore.currentPage?.type === 'library' ? 'library' : 'page'"
      :data="pageStore.currentPage"
      @update="handlePageUpdate"
    />

    <VersionHistoryDrawer
      v-model:show="showVersionHistory"
      :page-id="pageStore.currentPage?.id"
      @restore="loadPage"
    />
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

  @media (max-width: 1024px) {
    padding: 16px;
  }
}

.page-header {
  margin-bottom: 32px;
  
  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    margin-bottom: 16px;
    
    &.mobile-header {
       align-items: flex-start;
       
       .title-section {
          max-width: calc(100% - 40px);
       }
    }

    .title-section {
      flex: 1;
      margin-right: 16px;
      display: flex;
      align-items: flex-start;
      
      .title-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

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

      .description-input {
        font-size: 14px;
        color: var(--n-text-color-3);
        border: none;
        background: transparent;
        padding: 0;
        
        :deep(.n-input__input-el) {
          height: auto;
          padding: 0;
        }
        
        :deep(.n-input__border), :deep(.n-input__state-border) {
          display: none;
        }
        
        &:hover, &:focus-within {
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
  $content-padding: 24px;
  padding: $content-padding;
  padding-left: calc(#{$content-padding} * 2.5);
  padding-right: calc(#{$content-padding} * 2.5);
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

.page-info-content {
  padding: 8px 0;

  .info-section {
    margin-bottom: 24px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    p {
      margin: 4px 0;
      font-size: 13px;
      color: #555;

      strong {
        color: #333;
        margin-right: 4px;
      }
    }
  }
}
</style>
