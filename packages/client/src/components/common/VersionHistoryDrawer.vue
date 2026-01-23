<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pageApi } from '@/api/page'
import type { PageVersion } from '@/types'
import {
  NDrawer, NDrawerContent, NButton, NIcon, NSpin, NList, NListItem, NThing, NTag,
  NTime, NPopconfirm, NSelect, NInput, NAlert, useMessage
} from 'naive-ui'
import {
  RefreshOutline, TrashOutline, SaveOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import { watch } from 'vue'

const props = defineProps<{
  show: boolean
  pageId: string
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'restore'): void
}>()

const message = useMessage()

const loading = ref(false)
const versions = ref<PageVersion[]>([])
const selectedVersion = ref<PageVersion | null>(null)
const showRestoreConfirm = ref(false)
const showCleanupConfirm = ref(false)
const cleanupPeriod = ref<'day' | 'week' | 'month'>('week')
const newVersionMessage = ref('')

// Computed properties
const sortedVersions = computed(() => {
  return [...versions.value].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const hasVersions = computed(() => versions.value.length > 0)

// Load versions
const loadVersions = async () => {
  if (!props.pageId) return

  loading.value = true
  try {
    const res = await pageApi.getVersions(props.pageId)
    if (res.code === 0) {
      versions.value = res.data
    }
  } catch (e) {
    console.error('Failed to load versions', e)
    message.error('Failed to load version history')
  } finally {
    loading.value = false
  }
}

// Create new version
const handleCreateVersion = async () => {
  if (!props.pageId) return

  try {
    const res = await pageApi.createVersion(props.pageId, { message: newVersionMessage.value })
    if (res.code === 0) {
      message.success('Version created successfully')
      versions.value.unshift(res.data)
      newVersionMessage.value = ''
    } else {
      message.error(res.message || 'Failed to create version')
    }
  } catch (e) {
    console.error('Failed to create version', e)
    message.error('Failed to create version')
  }
}

// Restore version
const handleRestoreVersion = async () => {
  if (!props.pageId || !selectedVersion.value) return

  try {
    const res = await pageApi.restoreVersion(props.pageId, selectedVersion.value.id)
    if (res.code === 0) {
      message.success('Version restored successfully')
      showRestoreConfirm.value = false
      selectedVersion.value = null
      emit('restore')
      emit('update:show', false)
    } else {
      message.error(res.message || 'Failed to restore version')
    }
  } catch (e) {
    console.error('Failed to restore version', e)
    message.error('Failed to restore version')
  }
}

// Clean up old versions
const handleCleanupVersions = async () => {
  if (!props.pageId) return

  try {
    const res = await pageApi.cleanupVersions(props.pageId, { period: cleanupPeriod.value })
    if (res.code === 0) {
      message.success(res.data.message)
      showCleanupConfirm.value = false
      await loadVersions()
    } else {
      message.error(res.message || 'Failed to clean up versions')
    }
  } catch (e) {
    console.error('Failed to clean up versions', e)
    message.error('Failed to clean up versions')
  }
}

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get version preview (first few characters of content)
const getVersionPreview = (version: PageVersion) => {
  if (!version.content || !version.content.content) return 'Empty content'

  try {
    const text = version.content.content
      .map((block: any) => {
        if (block.content) {
          return block.content.map((inline: any) => inline.text || '').join('')
        }
        return ''
      })
      .join(' ')
      .substring(0, 100)

    return text || 'Empty content'
  } catch (e) {
    return 'Content preview unavailable'
  }
}

// Watch for show prop changes
const handleShowChange = (show: boolean) => {
  if (show && props.pageId) {
    loadVersions()
  }
}

// Watch props
watch(() => props.show, handleShowChange)
watch(() => props.pageId, () => {
  if (props.show) {
    loadVersions()
  }
})

// Initialize on mount
onMounted(() => {
  if (props.show && props.pageId) {
    loadVersions()
  }
})
</script>

<template>
  <n-drawer
    :show="show"
    width="450"
    @update:show="$emit('update:show', $event)"
  >
    <n-drawer-content title="Version History" :closable="true">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
      </div>

      <!-- Content -->
      <div v-else class="version-history-content">
        <!-- Alert for auto-save -->
        <n-alert type="info" :show-icon="false" style="margin-bottom: 16px;">
          <template #header>
            <strong>Auto-Save Feature</strong>
          </template>
          <p style="font-size: 12px; margin: 0;">
            Versions are automatically created when you edit content, but only if at least 2 minutes have passed since the last version.
          </p>
        </n-alert>

        <!-- Create New Version Section -->
        <div class="create-section" style="margin-bottom: 24px;">
          <n-input
            v-model:value="newVersionMessage"
            placeholder="Optional message for this version..."
            size="small"
            style="margin-bottom: 8px;"
          />
          <n-button
            type="primary"
            size="small"
            :disabled="!props.pageId"
            @click="handleCreateVersion"
          >
            <template #icon>
              <n-icon><SaveOutline /></n-icon>
            </template>
            Create New Version
          </n-button>
        </div>

        <!-- Versions List -->
        <div v-if="hasVersions" class="versions-list">
          <n-list>
            <n-list-item v-for="version in sortedVersions" :key="version.id">
              <n-thing>
                <template #header>
                  <div class="version-header">
                    <span class="version-time">
                      <n-time :time="new Date(version.createdAt)" type="relative" />
                    </span>
                    <n-tag v-if="version.message" size="small" type="info">
                      {{ version.message }}
                    </n-tag>
                  </div>
                </template>
                <template #description>
                  <div class="version-description">
                    <p class="preview-text">{{ getVersionPreview(version) }}</p>
                    <div class="version-actions">
                      <n-button
                        size="tiny"
                        quaternary
                        type="primary"
                        @click="selectedVersion = version; showRestoreConfirm = true"
                      >
                        <template #icon>
                          <n-icon><RefreshOutline /></n-icon>
                        </template>
                        Restore
                      </n-button>
                      <span class="full-date">{{ formatDate(version.createdAt) }}</span>
                    </div>
                  </div>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <n-alert type="default" :show-icon="false">
            <p style="margin: 0;">No version history available yet.</p>
            <p style="margin: 8px 0 0 0; font-size: 12px;">
              Create your first version or edit the page content to trigger auto-save.
            </p>
          </n-alert>
        </div>

        <!-- Cleanup Section -->
        <div class="cleanup-section" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
          <h4 style="margin: 0 0 12px 0; font-size: 14px;">Clean Up Old Versions</h4>
          <div style="display: flex; gap: 8px; align-items: center;">
            <n-select
              v-model:value="cleanupPeriod"
              :options="[
                { label: 'Older than 1 day', value: 'day' },
                { label: 'Older than 1 week', value: 'week' },
                { label: 'Older than 1 month', value: 'month' }
              ]"
              size="small"
              style="flex: 1;"
            />
            <n-popconfirm
              v-model:show="showCleanupConfirm"
              @positive-click="handleCleanupVersions"
              :negative-text="null"
            >
              <template #trigger>
                <n-button size="small" type="error" :disabled="!hasVersions">
                  <template #icon>
                    <n-icon><TrashOutline /></n-icon>
                  </template>
                  Clean Up
                </n-button>
              </template>
              <p>Are you sure you want to delete versions older than {{ cleanupPeriod === 'day' ? '1 day' : cleanupPeriod === 'week' ? '1 week' : '1 month' }}?</p>
            </n-popconfirm>
          </div>
        </div>
      </div>

      <!-- Restore Confirmation Dialog -->
      <n-drawer
        v-model:show="showRestoreConfirm"
        width="350"
        placement="bottom"
        :mask-closable="false"
      >
        <n-drawer-content title="Confirm Restore" :closable="true">
          <n-alert type="warning" :show-icon="true" style="margin-bottom: 16px;">
            <template #icon>
              <n-icon><InformationCircleOutline /></n-icon>
            </template>
            <p style="margin: 0;">
              Restoring to a previous version will replace the current page content with the selected version.
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px;">
              This action will create a new version for the restored state.
            </p>
          </n-alert>

          <div style="margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Version Details:</p>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Created: {{ selectedVersion ? formatDate(selectedVersion.createdAt) : '' }}
            </p>
            <p v-if="selectedVersion?.message" style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
              Message: {{ selectedVersion.message }}
            </p>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <n-button size="small" @click="showRestoreConfirm = false">
              Cancel
            </n-button>
            <n-button
              size="small"
              type="primary"
              @click="handleRestoreVersion"
            >
              Restore Version
            </n-button>
          </div>
        </n-drawer-content>
      </n-drawer>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="scss">
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.version-history-content {
  padding-bottom: 24px;
}

.create-section {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.versions-list {
  :deep(.n-list) {
    background: transparent;

    .n-list-item {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 0;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.version-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  .version-time {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
}

.version-description {
  .preview-text {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .version-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .full-date {
      font-size: 11px;
      color: #999;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 24px 0;
}

.cleanup-section {
  :deep(.n-select) {
    min-width: 180px;
  }
}
</style>
