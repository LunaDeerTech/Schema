<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui'
import PublicSidebar from '@/components/layout/PublicSidebar.vue'
import { usePublicStore } from '@/stores/public'
import { storeToRefs } from 'pinia'
import { usePageTitle } from '@/composables/usePageTitle'

const publicStore = usePublicStore()
const { tree, currentPageId, currentLibrary } = storeToRefs(publicStore)

// 使用页面标题composable
usePageTitle()
</script>

<template>
  <NLayout has-sider style="height: 100vh">
    <PublicSidebar 
      :tree="tree" 
      :current-id="currentPageId" 
      :library="currentLibrary"
    />
    <NLayoutContent content-style="padding: 24px; background-color: #fff; overflow-y: auto;">
      <router-view />
    </NLayoutContent>
  </NLayout>
</template>
