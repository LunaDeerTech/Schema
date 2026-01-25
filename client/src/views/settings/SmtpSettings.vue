<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSwitch,
  NButton,
  NTabs,
  NTabPane,
  NCard,
  NSpace
} from 'naive-ui'
import { systemApi, type SmtpConfig } from '@/api/system'

const route = useRoute()
const message = useMessage()
const loading = ref(false)
const testing = ref(false)
const testEmail = ref('')

const title = computed(() => route.meta.title as string || 'SMTP Configuration')

const formValue = ref<SmtpConfig>({
  host: '',
  port: 465,
  user: '',
  pass: '',
  from: '',
  secure: true,
  registerSubject: 'Welcome to Schema',
  registerTemplate: 'Your verification code is: {{code}}',
  resetPasswordSubject: 'Reset Password',
  resetPasswordTemplate: 'Your reset code is: {{code}}'
})

import type { FormRules } from 'naive-ui'

const rules: FormRules = {
  host: { required: true, message: 'Host is required', trigger: 'blur' },
  port: { required: true, type: 'number', message: 'Port is required', trigger: 'blur' },
  user: { required: true, message: 'User is required', trigger: 'blur' },
  pass: { required: true, message: 'Password is required', trigger: 'blur' },
  from: { required: true, message: 'From address is required', trigger: 'blur' }
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await systemApi.getSmtpConfig()
    if (Object.keys(data).length > 0) {
      formValue.value = { ...formValue.value, ...data }
    }
  } catch (error) {
    message.error('Failed to load settings')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  loading.value = true
  try {
    await systemApi.updateSmtpConfig(formValue.value)
    message.success('Settings saved')
  } catch (error) {
    message.error('Failed to save settings')
  } finally {
    loading.value = false
  }
}

async function handleTest() {
  if (!testEmail.value) {
    message.warning('Please enter a test email address')
    return
  }
  testing.value = true
  try {
    const testConfig = {
      host: formValue.value.host || '',
      port: formValue.value.port || 465,
      user: formValue.value.user || '',
      pass: formValue.value.pass || '',
      from: formValue.value.from || '',
      secure: formValue.value.secure ?? true,
      testEmail: testEmail.value
    }
    const response = await systemApi.testSmtpConnection(testConfig)
    message.success(response.data.message || 'Connection successful')
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Connection failed'
    message.error(Array.isArray(msg) ? msg[0] : msg)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="settings-content">
    <div class="settings-header">
      <h2>{{ title }}</h2>
    </div>
    <n-card :bordered="false">
      <n-tabs type="line" animated>
        <n-tab-pane name="server" tab="Server Configuration">
          <n-form
            ref="formRef"
            :model="formValue"
            :rules="rules"
            label-placement="left"
            label-width="120"
            style="max-width: 600px"
          >
            <n-form-item label="SMTP Host" path="host">
              <n-input v-model:value="formValue.host" placeholder="smtp.example.com" />
            </n-form-item>
            <n-form-item label="SMTP Port" path="port">
              <n-input-number v-model:value="formValue.port" placeholder="465" />
            </n-form-item>
            <n-form-item label="Username" path="user">
              <n-input v-model:value="formValue.user" placeholder="user@example.com" />
            </n-form-item>
            <n-form-item label="Password" path="pass">
              <n-input
                v-model:value="formValue.pass"
                type="password"
                show-password-on="click"
                placeholder="password"
              />
            </n-form-item>
            <n-form-item label="From Address" path="from">
              <n-input v-model:value="formValue.from" placeholder="My App <no-reply@example.com>" />
            </n-form-item>
            <n-form-item label="Secure (SSL)" path="secure">
              <n-switch v-model:value="formValue.secure" />
            </n-form-item>
            <n-form-item label="Test Email" path="testEmail">
              <n-input v-model:value="testEmail" placeholder="Enter email to receive test message" />
            </n-form-item>
            <n-form-item>
              <n-space>
                <n-button type="primary" @click="handleSave" :loading="loading">Save</n-button>
                <n-button @click="handleTest" :loading="testing">Test Connection & Send Email</n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="templates" tab="Email Templates">
          <n-form
            :model="formValue"
            label-placement="top"
            style="max-width: 800px"
          >
            <n-card title="Registration Email" size="small" style="margin-bottom: 24px">
              <n-form-item label="Subject" path="registerSubject">
                <n-input v-model:value="formValue.registerSubject" />
              </n-form-item>
              <n-form-item label="Content (HTML)" path="registerTemplate">
                <n-input
                  v-model:value="formValue.registerTemplate"
                  type="textarea"
                  :rows="6"
                  placeholder="Use {{code}} for verification code"
                />
              </n-form-item>
            </n-card>

            <n-card title="Reset Password Email" size="small">
              <n-form-item label="Subject" path="resetPasswordSubject">
                <n-input v-model:value="formValue.resetPasswordSubject" />
              </n-form-item>
              <n-form-item label="Content (HTML)" path="resetPasswordTemplate">
                <n-input
                  v-model:value="formValue.resetPasswordTemplate"
                  type="textarea"
                  :rows="6"
                  placeholder="Use {{code}} for verification code"
                />
              </n-form-item>
            </n-card>
            
            <div style="margin-top: 24px">
              <n-button type="primary" @click="handleSave" :loading="loading">Save Templates</n-button>
            </div>
          </n-form>
        </n-tab-pane>
      </n-tabs>
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
</style>
