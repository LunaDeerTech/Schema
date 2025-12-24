<template>
  <div class="register-container">
    <n-card class="register-card" title="Schema - 注册新账号">
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <n-form-item path="email" label="邮箱">
          <n-input
            v-model:value="formValue.email"
            placeholder="请输入邮箱"
            type="email"
            :disabled="userStore.loading"
          />
        </n-form-item>
        
        <n-form-item path="displayName" label="显示名称">
          <n-input
            v-model:value="formValue.displayName"
            placeholder="请输入显示名称（可选）"
            :disabled="userStore.loading"
          />
        </n-form-item>
        
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formValue.password"
            placeholder="请输入密码"
            type="password"
            show-password-on="mousedown"
            :disabled="userStore.loading"
          />
        </n-form-item>
        
        <n-form-item path="confirmPassword" label="确认密码">
          <n-input
            v-model:value="formValue.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
            show-password-on="mousedown"
            :disabled="userStore.loading"
          />
        </n-form-item>
        
        <n-space vertical :size="16">
          <n-button
            type="primary"
            size="large"
            :loading="userStore.loading"
            :disabled="userStore.loading"
            block
            attr-type="submit"
          >
            注册
          </n-button>
          
          <n-button
            text
            type="primary"
            @click="$router.push('/login')"
            :disabled="userStore.loading"
          >
            已有账号？立即登录
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)

const formValue = reactive({
  email: '',
  displayName: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value) => value === formValue.password,
      message: '两次输入的密码不一致',
      trigger: ['blur', 'input']
    }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const result = await userStore.register({
      email: formValue.email,
      password: formValue.password,
      displayName: formValue.displayName || undefined
    })
    
    if (result.success) {
      message.success('注册成功')
      router.push('/home')
    } else {
      message.error(result.error || '注册失败')
    }
  } catch (error) {
    message.error('请检查表单输入')
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $ios-background-primary;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
  box-shadow: $ios-shadow-2;
  border-radius: $ios-border-radius-xl;
  background-color: $ios-background-secondary;
  border: none;
  
  :deep(.n-card-header) {
    text-align: center;
    font-weight: 600;
    font-size: 20px;
    color: $ios-text-primary;
  }
  
  :deep(.n-card__content) {
    padding: 32px 24px;
  }
}
</style>