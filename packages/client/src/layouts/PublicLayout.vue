<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui'
import PublicTopNavigation from '@/components/layout/PublicTopNavigation.vue'
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
  <NLayout style="height: 100vh">
    <PublicTopNavigation />
    <NLayout has-sider style="height: calc(100vh - 64px)">
      <PublicSidebar 
        :tree="tree" 
        :current-id="currentPageId" 
        :library="currentLibrary"
      />
      <NLayoutContent content-style="padding: 24px; background-color: #fff;">
        <router-view />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
