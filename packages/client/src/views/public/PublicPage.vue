<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NSpin, NResult } from 'naive-ui'
import { api } from '@/api/http'
import { usePublicStore } from '@/stores/public'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'
import type { Page } from '@/types'

const route = useRoute()
const publicStore = usePublicStore()
const page = ref<Page | null>(null)
const loading = ref(false)
const error = ref('')

async function fetchPage() {
  const slug = route.params.slug as string
  if (!slug) return

  loading.value = true
  error.value = ''
  try {
    const isLibrary = route.path.includes('/libraries/')
    const url = isLibrary ? `/public/libraries/${slug}` : `/public/pages/${slug}`
    const res = await api.get(url)
    page.value = res.data
    
    // Update store
    publicStore.currentPageId = page.value?.id || ''
    const libId = isLibrary ? page.value?.id : page.value?.libraryId
    if (libId) {
      publicStore.fetchTree(libId)
    }
  } catch (err) {
    error.value = 'Page not found or not public'
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug, fetchPage, { immediate: true })
</script>

<template>
  <div v-if="loading" class="loading">
    <NSpin size="large" />
  </div>
  <div v-else-if="error" class="error">
    <NResult status="404" title="404 Not Found" :description="error" />
  </div>
  <div v-else-if="page" class="page-content">
    <h1>{{ page.title }}</h1>
    <TiptapEditor 
      :content="page.content" 
      :editable="false" 
    />
  </div>
</template>

<style scoped>
.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.page-content {
  max-width: 900px;
  margin: 0 auto;
}
</style>
