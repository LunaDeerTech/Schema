<template>
  <div class="library-container">
    <n-layout class="layout">
      <!-- Header -->
      <n-layout-header bordered class="header">
        <div class="header-content">
          <n-breadcrumb>
            <n-breadcrumb-item @click="$router.push('/home')">
              Home
            </n-breadcrumb-item>
            <n-breadcrumb-item>
              {{ currentLibrary?.title || 'Library' }}
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>
      </n-layout-header>
      
      <!-- Content Area -->
      <n-layout-content class="content-area">
        <div class="empty-state">
          <n-empty description="Select a page from the sidebar to start editing">
          </n-empty>
        </div>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NLayout, 
  NLayoutHeader, 
  NLayoutContent, 
  NBreadcrumb, 
  NBreadcrumbItem,
  NEmpty
} from 'naive-ui'
import { useLibraryStore } from '@/stores/library'

const router = useRouter()
const libraryStore = useLibraryStore()
const currentLibrary = computed(() => libraryStore.currentLibrary)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.library-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout {
  height: 100%;
  background-color: transparent;
}

.header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.content-area {
  padding: 24px;
  height: calc(100% - 56px);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>