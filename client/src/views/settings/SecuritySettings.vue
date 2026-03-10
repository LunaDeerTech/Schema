<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import {
  useMessage,
  useDialog,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCard,
  NAlert,
  NDescriptions,
  NDescriptionsItem,
  type FormRules,
  type FormInst
} from 'naive-ui'

const userStore = useUserStore()
const message = useMessage()
const dialog = useDialog()
const router = useRouter()

// ---- Change Password ----
const passwordFormRef = ref<FormInst | null>(null)
const passwordLoading = ref(false)
const passwordModel = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: 'Please enter your current password', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Please enter a new password', trigger: 'blur' },
    { min: 6, max: 50, message: 'Password must be 6-50 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (value !== passwordModel.newPassword) {
          return new Error('Passwords do not match')
        }
        return true
      },
      trigger: 'blur'
    }
  ]
}

async function handleChangePassword() {
  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  passwordLoading.value = true
  try {
    const response = await userApi.changePassword({
      currentPassword: passwordModel.currentPassword,
      newPassword: passwordModel.newPassword
    })
    if (response.code === 0) {
      message.success('Password changed successfully')
      passwordModel.currentPassword = ''
      passwordModel.newPassword = ''
      passwordModel.confirmPassword = ''
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to change password')
  } finally {
    passwordLoading.value = false
  }
}

// ---- Account Info ----
const accountEmail = computed(() => userStore.user?.email || '')
const accountCreated = computed(() => {
  const user = userStore.user as any
  if (!user?.createdAt) return '-'
  return new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// ---- Delete Account ----
const deletePassword = ref('')
const deleteLoading = ref(false)

function handleDeleteAccount() {
  dialog.warning({
    title: 'Delete Account',
    content: 'This action is irreversible. All your data including libraries, pages, and uploaded files will be permanently deleted. Are you sure you want to continue?',
    positiveText: 'Delete My Account',
    negativeText: 'Cancel',
    positiveButtonProps: { type: 'error' },
    onPositiveClick: () => {
      showDeleteConfirm()
    }
  })
}

function showDeleteConfirm() {
  dialog.error({
    title: 'Confirm Account Deletion',
    content: () =>
      h('div', { style: 'margin-top: 8px' }, [
        h('p', { style: 'margin-bottom: 12px; color: var(--n-text-color)' }, 'Enter your password to confirm:'),
        h(NInput, {
          type: 'password',
          showPasswordOn: 'click',
          placeholder: 'Your password',
          value: deletePassword.value,
          onUpdateValue: (v: string) => { deletePassword.value = v }
        })
      ]),
    positiveText: 'Permanently Delete',
    negativeText: 'Cancel',
    positiveButtonProps: { type: 'error', loading: deleteLoading.value },
    onPositiveClick: async () => {
      if (!deletePassword.value) {
        message.warning('Please enter your password')
        return false
      }
      deleteLoading.value = true
      try {
        const response = await userApi.deleteAccount(deletePassword.value)
        if (response.code === 0) {
          message.success('Account deleted')
          userStore.logout()
          router.push('/login')
        }
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Failed to delete account')
        return false
      } finally {
        deleteLoading.value = false
        deletePassword.value = ''
      }
    },
    onNegativeClick: () => {
      deletePassword.value = ''
    }
  })
}

import { h } from 'vue'
</script>

<template>
  <div class="settings-content">
    <div class="settings-header">
      <h2>Password & Security</h2>
    </div>

    <!-- Change Password -->
    <n-card title="Change Password" class="section-card">
      <n-form
        ref="passwordFormRef"
        :model="passwordModel"
        :rules="passwordRules"
        label-placement="top"
        class="form-wrapper"
      >
        <n-form-item label="Current Password" path="currentPassword">
          <n-input
            v-model:value="passwordModel.currentPassword"
            type="password"
            show-password-on="click"
            placeholder="Enter your current password"
          />
        </n-form-item>

        <n-form-item label="New Password" path="newPassword">
          <n-input
            v-model:value="passwordModel.newPassword"
            type="password"
            show-password-on="click"
            placeholder="Enter a new password (min 6 characters)"
          />
        </n-form-item>

        <n-form-item label="Confirm New Password" path="confirmPassword">
          <n-input
            v-model:value="passwordModel.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="Confirm your new password"
          />
        </n-form-item>

        <div class="form-actions">
          <n-button
            type="primary"
            :loading="passwordLoading"
            @click="handleChangePassword"
            size="large"
          >
            Update Password
          </n-button>
        </div>
      </n-form>
    </n-card>

    <!-- Account Information -->
    <n-card title="Account Information" class="section-card">
      <n-descriptions label-placement="left" bordered :column="1">
        <n-descriptions-item label="Email">
          {{ accountEmail }}
        </n-descriptions-item>
        <n-descriptions-item label="Account Created">
          {{ accountCreated }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <!-- Danger Zone -->
    <n-card class="section-card danger-zone">
      <template #header>
        <span class="danger-title">Danger Zone</span>
      </template>
      <n-alert type="error" :bordered="false">
        <p style="margin: 0 0 4px 0; font-weight: 500;">Delete Account</p>
        <p style="margin: 0 0 12px 0;">Once you delete your account, there is no going back. All your libraries, pages, and uploaded images will be permanently removed.</p>
        <n-button type="error" ghost @click="handleDeleteAccount">
          Delete Account
        </n-button>
      </n-alert>
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

.section-card {
  margin-bottom: 24px;
}

.form-wrapper {
  max-width: 600px;
}

.form-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
}

.danger-zone {
  :deep(.n-card-header) {
    padding-bottom: 12px;
  }
}

.danger-title {
  color: #e03e3e;
  font-weight: 600;
}
</style>
