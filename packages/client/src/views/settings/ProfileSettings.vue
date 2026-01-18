<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage, NForm, NFormItem, NInput, NButton, NUpload, NAvatar, NCard, type UploadCustomRequestOptions } from 'naive-ui'
import { uploadApi } from '@/api/upload'

const userStore = useUserStore()
const message = useMessage()

const formRef = ref(null)
const model = reactive({
  displayName: '',
  email: '',
  avatar: ''
})
const loading = ref(false)

// Function to populate model from userStore
const populateModel = () => {
  if (userStore.user) {
    model.displayName = userStore.user.displayName || ''
    model.email = userStore.user.email
    model.avatar = userStore.user.avatar || ''
  }
}

onMounted(() => {
  populateModel()
})

// Update model if user store changes (e.g. initial load)
watch(() => userStore.user, () => {
  populateModel()
})

async function handleSave() {
  loading.value = true
  const result = await userStore.updateProfile({
    displayName: model.displayName,
    avatar: model.avatar
  })
  
  if (result.success) {
    message.success('Profile updated successfully')
  } else {
    message.error(result.error || 'Update failed')
  }
  loading.value = false
}

async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  try {
    const res = await uploadApi.uploadImage(file.file as File)
    if (res && res.url) {
      model.avatar = res.url
      onFinish()
      message.success('Avatar updated successfully')
    } else {
      throw new Error('Invalid response')
    }
  } catch (e) {
    message.error('Upload failed')
    onError()
  }
}
</script>

<template>
  <div class="settings-content">
    <div class="settings-header">
      <h2>Account Information</h2>
    </div>

    <n-card>
      <n-form ref="formRef" :model="model" label-placement="top" class="form-wrapper">
        <div class="avatar-section">
          <n-avatar :size="80" :src="model.avatar" class="avatar" fallback-src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
          <div class="avatar-info">
            <div class="upload-row">
              <n-upload 
                action="" 
                :custom-request="handleUpload" 
                :show-file-list="false"
                accept="image/*"
              >
                <n-button secondary>Change Avatar</n-button>
              </n-upload>
            </div>
            <div class="upload-hint">
              Supported formats: JPG, PNG, GIF
            </div>
          </div>
        </div>

        <n-form-item label="Display Name" path="displayName">
          <n-input v-model:value="model.displayName" placeholder="How should we call you?" />
        </n-form-item>
        
        <n-form-item label="Email Address" path="email">
          <n-input v-model:value="model.email" disabled placeholder="Email" />
          <template #feedback>
            Contact administrator to change your email
          </template>
        </n-form-item>
        
        <div class="form-actions">
          <n-button type="primary" :loading="loading" @click="handleSave" size="large">
            Save Changes
          </n-button>
        </div>
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
}

.form-wrapper {
  max-width: 600px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  
  .avatar {
    flex-shrink: 0;
    border: 1px solid var(--n-border-color);
  }
  
  .avatar-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .upload-hint {
      font-size: 12px;
      color: var(--n-text-color-3);
    }
  }
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
}
</style>
