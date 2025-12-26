<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  NLayout, 
  NLayoutContent
} from 'naive-ui'
import TopNavigation from '@/components/layout/TopNavigation.vue'
import Sidebar from '@/components/layout/Sidebar.vue'

const route = useRoute()

const collapsed = ref(false)
const showSidebar = computed(() => route.name !== 'Home')
</script>

<template>
  <n-layout class="main-layout">
    <TopNavigation v-model:collapsed="collapsed" />
    <n-layout :has-sider="showSidebar" class="content-layout">
      <Sidebar 
        v-if="showSidebar" 
        v-model:collapsed="collapsed" 
      />
      <n-layout-content class="main-content">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-layout {
  flex: 1;
  height: calc(100vh - 56px);
}

.sidebar {
  background-color: #f8f9fa; // Light gray background for sidebar
}

.main-content {
  padding: 20px;
  background-color: #fff;
}
</style>
