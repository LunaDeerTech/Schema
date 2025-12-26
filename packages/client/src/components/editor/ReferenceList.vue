<script setup lang="ts">
import { ref, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { DocumentTextOutline } from '@vicons/ionicons5'

interface PageItem {
  id: string
  title: string
  icon?: string
}

const props = defineProps<{
  items: PageItem[]
  command: (item: { id: string; label: string }) => void
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
    props.command({ id: item.id, label: item.title })
  }
}

defineExpose({
  onKeyDown,
})
</script>

<template>
  <div class="reference-list">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      class="item"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="selectItem(index)"
    >
      <n-icon class="icon">
        <DocumentTextOutline />
      </n-icon>
      <span class="label">{{ item.title }}</span>
    </button>
    <div v-if="items.length === 0" class="item no-result">
      No pages found
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reference-list {
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

    &.no-result {
      color: #718096;
      cursor: default;
      &:hover {
        background-color: transparent;
      }
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
