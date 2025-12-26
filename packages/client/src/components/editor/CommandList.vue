<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Component } from 'vue'

interface CommandItem {
  title: string
  icon?: Component
  command: (editor: any, range: any) => void
}

const props = defineProps<{
  items: CommandItem[]
  command: (item: CommandItem) => void
}>()

const selectedIndex = ref(0)

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
)

function onKeyDown({ event }: { event: KeyboardEvent }) {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    enterHandler()
    return true
  }

  return false
}

function upHandler() {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
}

function downHandler() {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

function enterHandler() {
  selectItem(selectedIndex.value)
}

function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

defineExpose({
  onKeyDown,
})
</script>

<template>
  <div class="command-list">
    <button
      v-for="(item, index) in items"
      :key="index"
      class="item"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="selectItem(index)"
    >
      <n-icon v-if="item.icon" class="icon" :component="item.icon" />
      <span class="label">{{ item.title }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.command-list {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
  width: 15rem;
  max-height: 20rem;
  overflow-y: auto;

  .item {
    align-items: center;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    color: #1a202c;
    cursor: pointer;
    display: flex;
    font-size: 0.875rem;
    gap: 0.5rem;
    padding: 0.5rem;
    text-align: left;
    width: 100%;

    &.is-selected,
    &:hover {
      background-color: #edf2f7;
      color: #2d3748;
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
  }
}
</style>
