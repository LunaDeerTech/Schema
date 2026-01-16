<script setup lang="ts">
interface Props {
  fixed?: boolean
}

defineProps<{
  width?: string
  padding?: string
  maxHeight?: string
}>()
</script>

<template>
  <div 
    class="floating-panel"
    :style="{
      width: width,
      padding: padding,
      maxHeight: maxHeight,
    }"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.floating-panel {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}
</style>
