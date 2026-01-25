<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NDrawer, NDrawerContent, NSwitch, NInput, NButton, NSpace, NText, useMessage } from 'naive-ui'
import { pageApi } from '@/api/page'
import { libraryApi } from '@/api/library'
import type { Page, Library } from '@/types'

const props = defineProps<{
  show: boolean
  type: 'page' | 'library'
  data: Page | Library | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update', data: Page | Library): void
}>()

const message = useMessage()
const isPublic = ref(false)
const publicSlug = ref('')
const loading = ref(false)

watch(() => props.data, (newData) => {
  if (newData) {
    isPublic.value = !!newData.isPublic
    publicSlug.value = newData.publicSlug || ''
  }
}, { immediate: true })

const publicLink = computed(() => {
  if (!publicSlug.value) return ''
  const baseUrl = window.location.origin
  const typePath = props.type === 'library' ? 'libraries' : 'pages'
  return `${baseUrl}/public/${typePath}/${publicSlug.value}`
})

async function handlePublicChange(value: boolean) {
  if (!props.data) return
  
  console.debug('handlePublicChange', { value, type: props.type, id: props.data.id });
  loading.value = true
  try {
    let updatedData
    if (props.type === 'page') {
      // @ts-ignore
      const res = await pageApi.updatePage(props.data.id, { isPublic: value })
      updatedData = res.data
    } else {
      // @ts-ignore
      console.debug('Calling updateLibrary with', { isPublic: value });
      const res = await libraryApi.updateLibrary(props.data.id, { isPublic: value })
      console.debug('updateLibrary response', res);
      updatedData = res.data
    }
    
    isPublic.value = value
    if (updatedData.publicSlug) {
      publicSlug.value = updatedData.publicSlug
    }
    emit('update', updatedData)
    message.success(value ? 'Public access enabled' : 'Public access disabled')
  } catch (error) {
    console.error('handlePublicChange error', error);
    message.error('Failed to update public status')
    isPublic.value = !value // Revert
  } finally {
    loading.value = false
  }
}

function copyLink() {
  if (!publicLink.value) return
  navigator.clipboard.writeText(publicLink.value)
  message.success('Link copied to clipboard')
}
</script>

<template>
  <NDrawer :show="show" @update:show="emit('update:show', $event)" width="400">
    <NDrawerContent title="Public Access Settings">
      <NSpace vertical size="large">
        <NSpace justify="space-between" align="center">
          <NText>Public Access</NText>
          <NSwitch :value="isPublic" @update:value="handlePublicChange" :loading="loading" />
        </NSpace>

        <div v-if="isPublic">
          <NText depth="3" class="label">Public Link</NText>
          <NSpace>
            <NInput :value="publicLink" readonly placeholder="No public link generated" />
            <NButton @click="copyLink" :disabled="!publicLink">Copy</NButton>
          </NSpace>
        </div>

        <div class="notes">
          <NText strong>Notes:</NText>
          <ul>
            <li>When you change the public status of a library or page, all its child pages will automatically follow the setting.</li>
            <li>If a child page is not public, it will not appear in the sidebar of the public page.</li>
            <li>If a page is public but its parent is not, the sidebar will not show the parent hierarchy.</li>
            <li>Public pages are read-only for everyone.</li>
          </ul>
        </div>
      </NSpace>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.label {
  display: block;
  margin-bottom: 8px;
}
.notes ul {
  padding-left: 20px;
  margin-top: 8px;
}
.notes li {
  margin-bottom: 4px;
  color: var(--n-text-color-3);
}
</style>
