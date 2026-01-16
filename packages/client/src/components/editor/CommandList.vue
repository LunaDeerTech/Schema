<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import NavigableList from './common/NavigableList.vue'

interface CommandItem {
  title: string
  icon?: Component
  command: (editor: any, range: any) => void
}

const props = defineProps<{
  items: CommandItem[]
  command: (item: CommandItem) => void
}>()

const listRef = ref()

function onKeyDown({ event }: { event: KeyboardEvent }) {
  return listRef.value?.onKeyDown({ event })
}

defineExpose({
  onKeyDown,
})
</script>

<template>
  <NavigableList 
    ref="listRef" 
    :items="items" 
    @select="command"
    class="command-list"
  >
    <template #item="{ item }">
      <n-icon v-if="item.icon" class="icon" :component="item.icon" />
      <span class="label">{{ item.title }}</span>
    </template>
  </NavigableList>
</template>

<style lang="scss" scoped>
.command-list {
  /* Overrides or additional styles if needed, though NavigableList sets width/maxHeight */
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  font-size: 1.1rem;
}

.label {
  flex: 1;
}
</style>
