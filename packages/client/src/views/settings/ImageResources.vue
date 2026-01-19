<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NCard,
  NEmpty,
  NButton,
  NImage,
  NText,
  NTag,
  NGrid,
  NGridItem,
  NSpin,
  NInput,
  NSelect,
  useMessage,
  useDialog,
  NIcon,
  NTooltip,
  NEllipsis
} from 'naive-ui'
import { 
  TrashOutline, 
  CopyOutline, 
  ArrowForwardOutline as ArrowRightIcon,
  ImageOutline as ImageIcon
} from '@vicons/ionicons5'
import { uploadApi } from '@/api/upload'

interface UploadedImage {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  pageId: string | null
  libraryId: string | null
  createdAt: string
  pageTitle?: string
  pageType?: string
  libraryTitle?: string
}

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const images = ref<UploadedImage[]>([])
const searchQuery = ref('')
const filterType = ref<'all' | 'page' | 'library' | 'orphan'>('all')

const filteredImages = computed(() => {
  let result = images.value

  // Filter by type
  if (filterType.value === 'page') {
    result = result.filter(img => img.pageId && !img.libraryId)
  } else if (filterType.value === 'library') {
    result = result.filter(img => img.libraryId)
  } else if (filterType.value === 'orphan') {
    result = result.filter(img => !img.pageId && !img.libraryId)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(img => 
      img.originalName.toLowerCase().includes(query) ||
      img.pageTitle?.toLowerCase().includes(query) ||
      img.libraryTitle?.toLowerCase().includes(query)
    )
  }

  return result
})

const filterOptions = [
  { label: 'All Images', value: 'all' },
  { label: 'In Pages', value: 'page' },
  { label: 'In Libraries', value: 'library' },
  { label: 'Orphaned', value: 'orphan' }
]

async function loadImages() {
  loading.value = true
  try {
    images.value = await uploadApi.getImages()
  } catch (error: any) {
    message.error(error.message || 'Failed to load images')
  } finally {
    loading.value = false
  }
}

async function handleDeleteImage(image: UploadedImage) {
  dialog.warning({
    title: 'Delete Image',
    content: `Are you sure you want to delete "${image.originalName}"? This action cannot be undone.`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        loading.value = true
        await uploadApi.deleteImage(image.id)
        message.success('Image deleted successfully')
        await loadImages()
      } catch (error: any) {
        message.error(error.message || 'Failed to delete image')
        loading.value = false
      }
    }
  })
}

function handleNavigateToPage(image: UploadedImage) {
  if (image.pageId) {
    if (image.pageType === 'library') {
      router.push(`/library/${image.pageId}`)
    } else {
      router.push(`/page/${image.pageId}`)
    }
  } else if (image.libraryId) {
    router.push(`/library/${image.libraryId}`)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function getLocationInfo(image: UploadedImage): { text: string; type: 'success' | 'info' | 'warning' } {
  if (image.pageId && image.pageTitle) {
    if (image.pageType === 'library') {
      return { text: `Library: ${image.pageTitle}`, type: 'success' }
    }
    return { text: `Page: ${image.pageTitle}`, type: 'info' }
  }
  if (image.libraryId && image.libraryTitle) {
    return { text: `Library: ${image.libraryTitle}`, type: 'success' }
  }
  return { text: 'Not associated', type: 'warning' }
}

function copyImageUrl(url: string) {
  const fullUrl = window.location.origin + url
  navigator.clipboard.writeText(fullUrl).then(() => {
    message.success('Image URL copied to clipboard')
  }).catch(() => {
    message.error('Failed to copy URL')
  })
}

onMounted(() => {
  loadImages()
})
</script>

<template>
  <div class="settings-page">
    <div class="header">
      <h2>Image Resources</h2>
      <p class="description">Manage all uploaded images in your knowledge base</p>
    </div>

    <NCard class="content-card">
      <div class="toolbar">
        <NSpace justify="space-between" align="center" style="flex-wrap: wrap; gap: 12px">
          <NSpace>
            <NInput
              v-model:value="searchQuery"
              placeholder="Search images..."
              clearable
              style="width: 260px"
            >
              <template #prefix>
                <NIcon :component="ImageIcon" />
              </template>
            </NInput>
            <NSelect
              v-model:value="filterType"
              :options="filterOptions"
              style="width: 160px"
            />
          </NSpace>
          <NButton @click="loadImages" :loading="loading" secondary>
            Refresh
          </NButton>
        </NSpace>
      </div>

      <NSpin :show="loading">
        <div v-if="filteredImages.length === 0 && !loading" class="empty-state">
          <NEmpty description="No images found">
            <template #extra>
              <NText depth="3">
                {{ searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your filters or search query' 
                  : 'Upload images in your pages to see them here' }}
              </NText>
            </template>
          </NEmpty>
        </div>

        <div v-else class="image-grid-container">
          <NGrid cols="1 s:2 m:3 l:4 xl:5" responsive="screen" :x-gap="16" :y-gap="16">
            <NGridItem v-for="image in filteredImages" :key="image.id">
              <NCard class="image-item-card" size="small" hoverable>
                <template #cover>
                  <div class="image-preview-wrapper">
                    <NImage
                      :src="image.url"
                      :alt="image.originalName"
                      object-fit="cover"
                      class="grid-image"
                      lazy
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23ccc'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                  </div>
                </template>
                
                <div class="card-content">
                  <div class="title-row">
                    <NTooltip trigger="hover">
                      <template #trigger>
                        <NText strong class="image-name">
                          <NEllipsis>{{ image.originalName }}</NEllipsis>
                        </NText>
                      </template>
                      {{ image.originalName }}
                    </NTooltip>
                  </div>

                  <div class="meta-row">
                    <NTag :type="getLocationInfo(image).type" size="tiny" :bordered="false">
                      <NEllipsis style="max-width: 120px">{{ getLocationInfo(image).text }}</NEllipsis>
                    </NTag>
                  </div>
                  
                  <div class="info-row">
                    <NText depth="3" class="meta-text">
                      {{ formatFileSize(image.size) }} • {{ new Date(image.createdAt).toLocaleDateString() }}
                    </NText>
                  </div>
                </div>

                <template #action>
                  <NSpace justify="space-between" size="small" align="center">
                    <NTooltip>
                      <template #trigger>
                        <NButton size="tiny" quaternary circle @click="copyImageUrl(image.url)">
                          <template #icon><NIcon :component="CopyOutline" /></template>
                        </NButton>
                      </template>
                      Copy URL
                    </NTooltip>

                    <NTooltip v-if="image.pageId || image.libraryId">
                      <template #trigger>
                        <NButton size="tiny" quaternary circle @click="handleNavigateToPage(image)">
                          <template #icon><NIcon :component="ArrowRightIcon" /></template>
                        </NButton>
                      </template>
                      Go to {{ image.pageType === 'library' ? 'Library' : 'Page' }}
                    </NTooltip>

                    <div style="flex: 1"></div>

                    <NButton size="tiny" quaternary circle type="error" @click="handleDeleteImage(image)">
                      <template #icon><NIcon :component="TrashOutline" /></template>
                    </NButton>
                  </NSpace>
                </template>
              </NCard>
            </NGridItem>
          </NGrid>
        </div>
      </NSpin>
    </NCard>
  </div>
</template>

<style scoped lang="scss">
.settings-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.header {
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--n-text-color);
  }

  .description {
    margin: 0;
    color: var(--n-text-color-3);
    font-size: 14px;
  }
}

.content-card {
  min-height: 400px;
}

.toolbar {
  margin-bottom: 24px;
}

.empty-state {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

.image-item-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  :deep(.n-card-cover) {
    overflow: hidden;
    background: var(--n-color-target);
  }

  :deep(.n-card__content) {
    padding: 12px;
  }
}

.image-preview-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66.67%; // 3:2 Aspect Ratio
  
  .grid-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-name {
  font-size: 14px;
}

.meta-row {
  min-height: 22px;
}

.meta-text {
  font-size: 12px;
}
</style>
