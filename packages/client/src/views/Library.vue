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
          <div class="header-actions">
            <n-button 
              type="primary" 
              size="small" 
              :loading="saving"
              @click="saveLibraryContent"
            >
              Save
            </n-button>
          </div>
        </div>
      </n-layout-header>
      
      <!-- Content Area -->
      <n-layout-content class="content-area">
        <div class="editor-wrapper">
          <TiptapEditor 
            v-if="currentLibrary"
            :content="libraryContent"
            :editable="true"
            @update="handleContentUpdate"
          />
        </div>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  NLayout, 
  NLayoutHeader, 
  NLayoutContent, 
  NBreadcrumb, 
  NBreadcrumbItem, 
  NButton,
  useMessage 
} from 'naive-ui'
import { useLibraryStore } from '@/stores/library'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'

const libraryStore = useLibraryStore()
const message = useMessage()

const currentLibrary = computed(() => libraryStore.currentLibrary)
const libraryContent = ref<any>(null)
const saving = ref(false)

// Initialize content when library changes
watch(currentLibrary, (newLib) => {
  if (newLib) {
    try {
      libraryContent.value = typeof newLib.content === 'string' 
        ? JSON.parse(newLib.content) 
        : newLib.content
    } catch (e) {
      libraryContent.value = newLib.content || { type: 'doc', content: [] }
    }
  }
}, { immediate: true })

// Handle content updates from editor
const handleContentUpdate = (content: any) => {
  libraryContent.value = content
}

// Save library content
const saveLibraryContent = async () => {
  if (!currentLibrary.value) return
  
  saving.value = true
  try {
    const success = await libraryStore.updateLibrary(currentLibrary.value.id, {
      content: libraryContent.value
    })
    
    if (success) {
      message.success('Library content saved successfully')
    } else {
      message.error('Failed to save library content')
    }
  } catch (error) {
    message.error('Failed to save library content')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // Ensure we have the current library loaded
  if (!currentLibrary.value && libraryStore.libraries.length > 0) {
    libraryStore.setCurrentLibrary(libraryStore.libraries[0])
  }
})
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
  justify-content: space-between;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.content-area {
  padding: 0;
  height: calc(100% - 56px);
  background-color: #fff;
}

.editor-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Ensure the editor takes full height */
.editor-wrapper :deep(.tiptap) {
  min-height: calc(100% - 48px);
  outline: none;
}
</style>