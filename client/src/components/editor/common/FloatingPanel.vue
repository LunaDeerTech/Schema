<script setup lang="ts">
defineProps<{
  width?: string
  padding?: string
  maxHeight?: string
  fixed?: boolean
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
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-float);
  display: flex;
  flex-direction: column;
}
</style>
