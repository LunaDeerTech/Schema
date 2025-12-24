<template>
  <div class="login-container">
    <n-card class="login-card" title="Schema - 知识管理系统">
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
        
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formValue.password"
            placeholder="请输入密码"
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
            登录
          </n-button>
          
          <n-button
            text
            type="primary"
            @click="$router.push('/register')"
            :disabled="userStore.loading"
          >
            没有账号？立即注册
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
import { useRoute, useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const message = useMessage()

const formRef = ref<FormInst | null>(null)

const formValue = reactive({
  email: '',
  password: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const result = await userStore.login({
      email: formValue.email,
      password: formValue.password
    })
    
    if (result.success) {
      message.success('登录成功')
      
      // Redirect to original destination or home
      const redirect = route.query.redirect as string
      router.push(redirect || '/home')
    } else {
      message.error(result.error || '登录失败')
    }
  } catch (error) {
    message.error('请检查表单输入')
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  
  :deep(.n-card-header) {
    text-align: center;
    font-weight: 600;
    font-size: 18px;
    color: #333;
  }
  
  :deep(.n-card__content) {
    padding: 24px;
  }
}
</style>