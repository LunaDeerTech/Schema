<script setup lang="ts">
import { ref } from 'vue'
import { NModal, NCard, NTabs, NTabPane, NInput, NButton, NUpload, NSpace, useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'import', content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const message = useMessage()
const markdownContent = ref('')
const activeTab = ref('paste')

const handlePaste = () => {
  if (!markdownContent.value.trim()) {
    message.warning('请输入Markdown内容')
    return
  }
  emit('import', markdownContent.value)
  handleClose()
}

const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0]?.file
  if (file) {
    if (!file.name.endsWith('.md')) {
      message.error('请上传.md文件')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      markdownContent.value = content
      message.success('文件加载成功')
    }
    reader.onerror = () => {
      message.error('文件读取失败')
    }
    reader.readAsText(file)
  }
}

const handleClose = () => {
  markdownContent.value = ''
  activeTab.value = 'paste'
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="props.show"
    @update:show="(val: boolean) => emit('update:show', val)"
    :mask-closable="true"
  >
    <NCard
      style="width: 600px; max-width: 90vw"
      title="导入Markdown"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <NButton text @click="handleClose">
          <template #icon>
            <span style="font-size: 20px">×</span>
          </template>
        </NButton>
      </template>

      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="paste" tab="粘贴内容">
          <NSpace vertical :size="16">
            <NInput
              v-model:value="markdownContent"
              type="textarea"
              placeholder="在此粘贴Markdown内容..."
              :rows="12"
              :autosize="{ minRows: 12, maxRows: 20 }"
            />
            <div style="display: flex; justify-content: flex-end; gap: 8px">
              <NButton @click="handleClose">取消</NButton>
              <NButton type="primary" @click="handlePaste">导入</NButton>
            </div>
          </NSpace>
        </NTabPane>

        <NTabPane name="upload" tab="上传文件">
          <NSpace vertical :size="16">
            <NUpload
              :max="1"
              accept=".md"
              :show-file-list="true"
              @change="handleFileChange"
              :default-upload="false"
            >
              <NButton>选择Markdown文件</NButton>
            </NUpload>
            
            <NInput
              v-model:value="markdownContent"
              type="textarea"
              placeholder="文件内容预览..."
              :rows="10"
              :autosize="{ minRows: 10, maxRows: 15 }"
              readonly
            />

            <div style="display: flex; justify-content: flex-end; gap: 8px">
              <NButton @click="handleClose">取消</NButton>
              <NButton
                type="primary"
                @click="handlePaste"
                :disabled="!markdownContent"
              >
                导入
              </NButton>
            </div>
          </NSpace>
        </NTabPane>
      </NTabs>
    </NCard>
  </NModal>
</template>

<style scoped lang="scss">
:deep(.n-card__header) {
  padding-bottom: 16px;
}

:deep(.n-tabs-nav) {
  margin-bottom: 16px;
}
</style>
