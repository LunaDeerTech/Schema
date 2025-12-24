<template>
  <div class="not-found-container">
    <n-card class="not-found-card">
      <n-result
        status="404"
        title="页面未找到"
        description="您访问的页面不存在或已被移除"
      >
        <template #footer>
          <n-space>
            <n-button type="primary" @click="$router.push('/home')">
              返回首页
            </n-button>
            <n-button @click="$router.back()">
              返回上一页
            </n-button>
          </n-space>
        </template>
      </n-result>
    </n-card>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for this simple 404 page
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $ios-background-primary;
  padding: 20px;
}

.not-found-card {
  width: 100%;
  max-width: 500px;
  box-shadow: $ios-shadow-2;
  border-radius: $ios-border-radius-xl;
  background-color: $ios-background-secondary;
  border: none;
  padding: 40px 20px;
}
</style>