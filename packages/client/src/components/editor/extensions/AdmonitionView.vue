<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import { computed } from 'vue'
import {
  InformationCircleOutline,
  WarningOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
} from '@vicons/ionicons5'

const props = defineProps<{
  node: {
    attrs: {
      type: string
      title?: string | null
    }
  }
  updateAttributes: (attrs: any) => void
}>()

const typeConfig = {
  info: {
    icon: InformationCircleOutline,
    bgColor: '#e0f2fe',
    borderColor: '#0ea5e9',
    textColor: '#0369a1',
    title: 'Info',
  },
  warning: {
    icon: WarningOutline,
    bgColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    title: 'Warning',
  },
  success: {
    icon: CheckmarkCircleOutline,
    bgColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
    title: 'Success',
  },
  danger: {
    icon: CloseCircleOutline,
    bgColor: '#fee2e2',
    borderColor: '#ef4444',
    textColor: '#991b1b',
    title: 'Danger',
  },
}

const config = computed(() => {
  return typeConfig[props.node.attrs.type as keyof typeof typeConfig] || typeConfig.info
})

</script>

<template>
  <node-view-wrapper class="admonition">
    <div
      class="admonition-content"
      :style="{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }"
    >
      <div class="admonition-header">
        <n-icon size="18" :style="{ color: config.textColor }">
          <component :is="config.icon" />
        </n-icon>
        <input
          class="admonition-title"
          :value="node.attrs.title"
          :placeholder="config.title"
          @input="
            updateAttributes({
              title: ($event.target as HTMLInputElement).value,
            })
          "
          :style="{ color: config.textColor }"
        />
      </div>
      <div class="admonition-body">
        <node-view-content class="content" />
      </div>
    </div>
  </node-view-wrapper>
</template>

<style scoped>
.admonition {
  margin: 1em 0;
}

.admonition-content {
  border-radius: 8px;
  border: 1px solid;
  padding: 12px 16px;
  position: relative;
}

.admonition-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.admonition-title {
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  width: 100%;
}

.admonition-title::placeholder {
  color: currentColor;
  opacity: 0.8;
}

.admonition-body {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.admonition-body :deep(p) {
  margin: 0;
}

.admonition-body :deep(p:first-child) {
  margin-top: 0;
}

.admonition-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
