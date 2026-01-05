<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
</script>

<template>
  <node-view-wrapper class="image-block-wrapper">
    <div class="image-view" :class="{ 'is-selected': props.selected }">
      <img :src="props.node.attrs.src" :alt="props.node.attrs.alt" :title="props.node.attrs.title" />
    </div>
  </node-view-wrapper>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.image-block-wrapper {
    margin: 1rem 0;
    
    .image-view {
        display: flex;
        justify-content: center;
        
        img {
            max-width: 100%;
            border-radius: 4px;
            display: block;
        }
        
        &.is-selected img {
            outline: 2px solid $ios-system-blue;
        }
    }
}
</style>

