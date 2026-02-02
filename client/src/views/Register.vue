<template>
  <div class="register-container">
    <n-card class="register-card" :title="cardTitle">
      <!-- Step 1: 输入邮箱 -->
      <div v-if="currentStep === 1">
        <n-form
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          @submit.prevent="handleSendVerification"
        >
          <n-form-item path="email" label="邮箱">
            <n-input
              v-model:value="emailForm.email"
              placeholder="请输入邮箱"
              type="email"
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
              验证邮箱
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
      </div>

      <!-- Step 2: 输入验证码 -->
      <div v-if="currentStep === 2">
        <n-form
          ref="codeFormRef"
          :model="codeForm"
          :rules="codeRules"
          @submit.prevent="handleVerifyCode"
        >
          <n-form-item path="code" label="验证码">
            <n-input
              v-model:value="codeForm.code"
              placeholder="请输入6位验证码"
              :maxlength="6"
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
              验证
            </n-button>

            <n-button
              text
              type="primary"
              @click="handleResendCode"
              :disabled="userStore.loading || countdown > 0"
            >
              {{ countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送' }}
            </n-button>

            <n-button
              text
              type="primary"
              @click="currentStep = 1"
              :disabled="userStore.loading"
            >
              返回修改邮箱
            </n-button>
          </n-space>
        </n-form>
      </div>

      <!-- Step 3: 完成注册 -->
      <div v-if="currentStep === 3">
        <n-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          @submit.prevent="handleCompleteRegister"
        >
          <n-form-item path="displayName" label="显示名称">
            <n-input
              v-model:value="registerForm.displayName"
              placeholder="请输入显示名称（可选）"
              :disabled="userStore.loading"
            />
          </n-form-item>

          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="registerForm.password"
              placeholder="请输入密码"
              type="password"
              show-password-on="mousedown"
              :disabled="userStore.loading"
            />
          </n-form-item>

          <n-form-item path="confirmPassword" label="确认密码">
            <n-input
              v-model:value="registerForm.confirmPassword"
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
              完成注册
            </n-button>

            <n-button
              text
              type="primary"
              @click="currentStep = 2"
              :disabled="userStore.loading"
            >
              返回修改验证码
            </n-button>
          </n-space>
        </n-form>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const message = useMessage()

// Step state
const currentStep = ref<1 | 2 | 3>(1)
const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

// Step 1: Email form
const emailFormRef = ref<FormInst | null>(null)
const emailForm = reactive({
  email: ''
})

const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// Step 2: Code form
const codeFormRef = ref<FormInst | null>(null)
const codeForm = reactive({
  code: ''
})

const codeRules: FormRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '请输入6位验证码', trigger: 'blur' }
  ]
}

// Step 3: Register form
const registerFormRef = ref<FormInst | null>(null)
const registerForm = reactive({
  displayName: '',
  password: '',
  confirmPassword: ''
})

const registerRules: FormRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value) => value === registerForm.password,
      message: '两次输入的密码不一致',
      trigger: ['blur', 'input']
    }
  ]
}

// Computed
const cardTitle = computed(() => {
  switch (currentStep.value) {
    case 1:
      return 'Schema - 邮箱验证'
    case 2:
      return 'Schema - 输入验证码'
    case 3:
      return 'Schema - 完成注册'
    default:
      return 'Schema - 注册新账号'
  }
})

// Methods
const startCountdown = (seconds: number = 60) => {
  countdown.value = seconds
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

const handleSendVerification = async () => {
  try {
    await emailFormRef.value?.validate()

    const result = await userStore.sendVerification({
      email: emailForm.email
    })

    if (result.success) {
      message.success('验证码已发送')
      startCountdown(60)
      currentStep.value = 2
    } else {
      message.error(result.error || '发送验证码失败')
    }
  } catch (error) {
    message.error('请检查表单输入')
  }
}

const handleVerifyCode = async () => {
  try {
    await codeFormRef.value?.validate()

    const result = await userStore.verifyCode({
      email: emailForm.email,
      code: codeForm.code
    })

    if (result.success) {
      message.success('验证码验证成功')
      currentStep.value = 3
    } else {
      message.error(result.error || '验证码验证失败')
    }
  } catch (error) {
    message.error('请检查表单输入')
  }
}

const handleResendCode = async () => {
  if (countdown.value > 0) return

  const result = await userStore.sendVerification({
    email: emailForm.email
  })

  if (result.success) {
    message.success('验证码已重新发送')
    startCountdown(60)
  } else {
    message.error(result.error || '发送验证码失败')
  }
}

const handleCompleteRegister = async () => {
  try {
    await registerFormRef.value?.validate()

    const result = await userStore.registerWithCode({
      email: emailForm.email,
      password: registerForm.password,
      displayName: registerForm.displayName || undefined,
      verificationCode: codeForm.code
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

// Cleanup countdown timer on unmount
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
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

  @media (max-width: 480px) {
    padding: 12px;
  }
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
    
    @media (max-width: 480px) {
      padding: 24px 16px;
    }
  }
}
</style>
