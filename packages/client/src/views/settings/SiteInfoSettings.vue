<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  NForm, 
  NFormItem, 
  NInput, 
  NButton, 
  NSpace, 
  NCard, 
  type FormInst,
  useMessage 
} from 'naive-ui'
import { systemApi } from '@/api/system'

const route = useRoute()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const saving = ref(false)

const title = computed(() => route.meta.title as string || 'Site Information')

const formValue = ref({
  title: '',
  description: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: 'Please enter the website title', trigger: ['blur', 'input'] },
    { max: 100, message: 'The website title cannot exceed 100 characters', trigger: ['blur', 'input'] }
  ],
  description: [
    { required: true, message: 'Please enter the website description', trigger: ['blur', 'input'] },
    { max: 500, message: 'The website description cannot exceed 500 characters', trigger: ['blur', 'input'] }
  ]
}

// 获取网站信息
async function loadSiteInfo() {
  try {
    loading.value = true
    const response = await systemApi.getSiteInfo()
    formValue.value = {
      title: response.data.title || '',
      description: response.data.description || ''
    }
  } catch (error) {
    message.error('Failed to load site information')
    console.error('Failed to load site info:', error)
  } finally {
    loading.value = false
  }
}

// 保存网站信息
async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true
    
    const response = await systemApi.updateSiteInfo(formValue.value)
    
    formValue.value = {
      title: response.data.title,
      description: response.data.description
    }
    
    message.success('Site information updated successfully')
  } catch (error) {
    message.error('Save failed, please check your input')
    console.error('Failed to save site info:', error)
  } finally {
    saving.value = false
  }
}

// 重置表单
function handleReset() {
  loadSiteInfo()
  message.info('Reset to last saved values')
}

onMounted(() => {
  loadSiteInfo()
})
</script>

<template>
  <div class="settings-content">
    <div class="settings-header">
      <h2>{{ title }}</h2>
    </div>
    <n-card>

      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        :disabled="loading || saving"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="Site Title" path="title">
          <n-input
            v-model:value="formValue.title"
            placeholder="Enter your site title"
            :maxlength="100"
            clearable
          />
        </n-form-item>

        <n-form-item label="Site Description" path="description">
          <n-input
            v-model:value="formValue.description"
            placeholder="Enter a brief description of your site"
            type="textarea"
            :maxlength="500"
            :autosize="{
              minRows: 3,
              maxRows: 6
            }"
            clearable
          />
        </n-form-item>

        <n-form-item>
          <n-space>
            <n-button
              type="primary"
              :loading="saving"
              :disabled="loading"
              @click="handleSave"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </n-button>
            <n-button
              :disabled="loading || saving"
              @click="handleReset"
            >
              Reset
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
.settings-content {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;

  .settings-header {
    margin-bottom: 24px;
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .n-card {
    :deep(.n-card__content) {
      padding: 24px;
    }
  }
}
</style>