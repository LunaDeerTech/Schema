<script setup lang="ts">
import { h } from 'vue'
import { NLayoutSider, NTree, NText } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { Page } from '@/types'
import type { TreeOption } from 'naive-ui'

const props = defineProps<{
  tree: Page[]
  currentId?: string
}>()

const router = useRouter()

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
    
    const node = findNode(props.tree, keys[0] as string)
    if (node) {
      const slug = node.publicSlug || node.id
      router.push(`/public/pages/${slug}`)
    }
  }
}

const renderLabel = ({ option }: { option: TreeOption }) => {
  return h(NText, { depth: 1 }, { default: () => option.title as string })
}
</script>

<template>
  <NLayoutSider
    bordered
    width="260"
    :native-scrollbar="false"
  >
    <NTree
      block-line
      :data="tree"
      key-field="id"
      label-field="title"
      children-field="children"
      :selected-keys="currentId ? [currentId] : []"
      @update:selected-keys="handleSelect"
      :render-label="renderLabel"
      default-expand-all
    />
  </NLayoutSider>
</template>
