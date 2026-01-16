<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NInput, NButton, NIcon, useMessage } from 'naive-ui'
import { CloudUploadOutline } from '@vicons/ionicons5'
import { uploadApi } from '@/api/upload'
import FloatingPanel from './common/FloatingPanel.vue'

const props = defineProps<{
  visible: boolean
  position: { top: number; left: number }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'insert', url: string): void
}>()

const message = useMessage()
const loading = ref(false)
const imageUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const popoverRef = ref<InstanceType<typeof FloatingPanel> | null>(null)

const handleUpload = async (file: File) => {
  loading.value = true
  try {
    const res = await uploadApi.uploadImage(file)
    // Check if res.data exists, otherwise use res directly if interceptor unwraps it
    const url = res.url || (res.data && res.data.url)
    if (url) {
      emit('insert', url)
      emit('close')
    } else {
      console.error('Invalid response format', res)
      message.error('Upload failed: Invalid response')
    }
  } catch (error) {
    console.error(error)
    message.error('Upload failed')
  } finally {
    loading.value = false
  }
}

const handleUrlSubmit = () => {
  if (imageUrl.value) {
    emit('insert', imageUrl.value)
    emit('close')
  }
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    handleUpload(target.files[0])
  }
  if (target) target.value = ''
}

const triggerUpload = () => {
  fileInput.value?.click()
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const el = popoverRef.value?.$el
  if (props.visible && el && !el.contains(event.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <FloatingPanel
    v-if="visible"
    ref="popoverRef"
    class="image-uploader-popover"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
    width="300px"
    padding="1rem"
  >
    <div class="content">
      <div class="input-group">
        <n-input
          v-model:value="imageUrl"
          placeholder="Paste image URL..."
          @keydown.enter="handleUrlSubmit"
          size="small"
          autofocus
        />
        <n-button @click="handleUrlSubmit" :disabled="!imageUrl" size="small">Embed</n-button>
      </div>
      <div class="divider">or</div>
      <div class="upload-btn-wrapper">
        <input type="file" accept="image/*" @change="onFileChange" style="display: none" ref="fileInput" />
        <n-button @click="triggerUpload" :loading="loading" size="small" block>
          <template #icon>
            <n-icon :component="CloudUploadOutline" />
          </template>
          Upload
        </n-button>
      </div>
    </div>
  </FloatingPanel>
</template>

<style lang="scss" scoped>
.image-uploader-popover {
  position: absolute;
  z-index: 1000;
  transform: translateY(10px);

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    .divider {
      text-align: center;
      font-size: 0.8rem;
      color: #94a3b8;
      position: relative;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background-color: #e2e8f0;
      }

      &::before {
        left: 0;
      }
      &::after {
        right: 0;
      }
    }
  }
}
</style>
