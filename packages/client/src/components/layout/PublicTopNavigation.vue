<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NLayoutHeader, NSpace, NText, NButton, NIcon, NAutoComplete } from 'naive-ui'
import { HelpCircleOutline, SearchOutline } from '@vicons/ionicons5'
import { api } from '@/api/http'
import { useSystemStore } from '@/stores/system'

const router = useRouter()
const systemStore = useSystemStore()
const searchValue = ref('')
const options = ref<{label: string, value: string}[]>([])
const loading = ref(false)

async function handleSearch(value: string) {
  searchValue.value = value
  if (!value || value.length < 2) {
    options.value = []
    return
  }
  
  loading.value = true
  try {
    const res = await api.get('/public/search', { params: { q: value } })
    options.value = res.data.map((p: any) => ({
      label: p.title,
      value: p.publicSlug || p.id
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleSelect(value: string) {
  router.push(`/public/pages/${value}`)
}
</script>

<template>
  <NLayoutHeader bordered class="header">
    <NSpace justify="space-between" align="center" style="height: 100%; padding: 0 20px;">
      <NSpace align="center">
        <!-- Logo (No-op) -->
        <NText strong style="font-size: 18px; cursor: default;">{{ systemStore.siteTitle }}</NText>
      </NSpace>
      
      <NSpace align="center" style="flex: 1; max-width: 600px; margin: 0 20px;">
        <NAutoComplete
          v-model:value="searchValue"
          :options="options"
          :loading="loading"
          placeholder="Search public pages..."
          @update:value="handleSearch"
          @select="handleSelect"
          style="width: 100%"
        >
          <template #prefix>
            <NIcon><SearchOutline /></NIcon>
          </template>
        </NAutoComplete>
      </NSpace>
      
      <NSpace align="center">
        <NButton quaternary circle>
          <template #icon>
            <NIcon><HelpCircleOutline /></NIcon>
          </template>
        </NButton>
      </NSpace>
    </NSpace>
  </NLayoutHeader>
</template>

<style scoped>
.header {
  height: 64px;
}
</style>
