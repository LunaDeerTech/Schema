<script setup lang="ts">
import { h, computed } from 'vue'
import { NLayoutSider, NTree, NText } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { Page as RawPage, Library } from '@/types'
import type { TreeOption } from 'naive-ui'

// Extend Page type to include optional children for tree rendering
type Page = RawPage & { children?: Page[] }

const props = defineProps<{
  tree: Page[]
  currentId?: string
  library?: Library | null
}>()

const router = useRouter()

// Recursively map Page[] to TreeOption[] for NTree compatibility
const mapToTreeOptions = (nodes: Page[]): TreeOption[] => {
  return nodes.map(node => {
    const option: TreeOption = {
      key: node.id,
      id: node.id,
      title: node.title,
      icon: node.icon,
      publicSlug: node.publicSlug,
      children: node.children && node.children.length > 0 ? mapToTreeOptions(node.children) : undefined,
      // Add any other fields needed for rendering or selection
    }
    return option
  })
}

const processedTree = computed<TreeOption[]>(() => mapToTreeOptions(props.tree))

function handleSelect(keys: Array<string | number>) {
  if (keys.length) {
    const findNode = (nodes: Page[], key: string): Page | undefined => {
      for (const node of nodes) {
        if (node.id === key) return node
        if (node.children) {
          const found = findNode(node.children, key)
          if (found) return found
        }
      }
    }
    
    // Use original tree for lookup as processedTree is just for display
    const node = findNode(props.tree, keys[0] as string)
    if (node) {
      const slug = node.publicSlug || node.id
      router.push(`/public/pages/${slug}`)
    }
  }
}

function goToLibrary() {
  if (props.library) {
    const slug = props.library.publicSlug || props.library.id
    router.push(`/public/libraries/${slug}`)
  }
}

const renderLabel = ({ option }: { option: TreeOption }) => {
  return h(NText, { depth: 1 }, { default: () => option.title as string })
}

const renderPrefix = ({ option }: { option: TreeOption }) => {
  const page = option as unknown as Page
  if (page.icon) {
    return h('span', { style: 'margin-right: 4px; font-size: 18px; line-height: 1;' }, page.icon)
  }
  return ''
}
</script>

<template>
  <NLayoutSider
    bordered
    width="260"
    :native-scrollbar="false"
  >
    <div v-if="library" class="library-header" @click="goToLibrary" :class="{ active: currentId === library.id }">
      <div class="icon-wrapper">
        <span v-if="library.icon" class="library-icon">{{ library.icon }}</span>
      </div>
      <span class="library-title">{{ library.title }}</span>
    </div>
    
    <NTree
      block-line
      :data="processedTree"
      key-field="id"
      label-field="title"
      children-field="children"
      :selected-keys="currentId ? [currentId] : []"
      @update:selected-keys="handleSelect"
      :render-label="renderLabel"
      :render-prefix="renderPrefix"
      default-expand-all
    />
  </NLayoutSider>
</template>

<style scoped>
.library-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--n-border-color);
  transition: background-color 0.2s;
}

.library-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.library-header.active {
  background-color: rgba(24, 160, 88, 0.1);
  color: var(--n-primary-color);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  width: 24px;
  height: 24px;
}

.library-icon {
  font-size: 20px;
  line-height: 1;
}

.library-title {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
