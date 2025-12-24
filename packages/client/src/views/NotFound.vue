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
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.not-found-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 40px 20px;
}
</style>