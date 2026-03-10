<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import { ref, computed } from 'vue'
import { CopyOutline, CheckmarkOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

const props = defineProps<{
  node: {
    attrs: {
      language: string | null
    }
    textContent: string
  }
  updateAttributes: (attrs: any) => void
  editor: { isEditable: boolean }
  extension: any
}>()

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const isEditable = computed(() => props.editor.isEditable)

const languages = [
  '', 'arduino', 'bash', 'c', 'cpp', 'csharp', 'css', 'diff', 'go',
  'graphql', 'ini', 'java', 'javascript', 'json', 'kotlin', 'less',
  'lua', 'makefile', 'markdown', 'objectivec', 'perl', 'php',
  'php-template', 'plaintext', 'python', 'python-repl', 'r', 'ruby',
  'rust', 'scss', 'shell', 'sql', 'swift', 'typescript', 'vbnet',
  'wasm', 'xml', 'yaml',
]

const handleLanguageChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  props.updateAttributes({ language: value || null })
}

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <node-view-wrapper class="code-block-wrapper">
    <div class="code-block-header">
      <select
        v-if="isEditable"
        class="code-block-language-select"
        :value="node.attrs.language || ''"
        @change="handleLanguageChange"
        contenteditable="false"
      >
        <option value="">auto</option>
        <option v-for="lang in languages.filter(l => l)" :key="lang" :value="lang">{{ lang }}</option>
      </select>
      <span v-else class="code-block-language">{{ node.attrs.language || '' }}</span>
      <button
        class="copy-button"
        :class="{ copied }"
        @click="handleCopy(node.textContent)"
        :title="copied ? '已复制' : '复制代码'"
      >
        <n-icon :size="14">
          <CheckmarkOutline v-if="copied" />
          <CopyOutline v-else />
        </n-icon>
        <span class="copy-label">{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    <pre><node-view-content as="code" /></pre>
  </node-view-wrapper>
</template>

<style scoped>
.code-block-wrapper {
  position: relative;
  margin: 1.2em 0;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #E8ECF1;
  border-radius: 6px 6px 0 0;
  padding: 4px 8px 4px 12px;
  min-height: 32px;
}

.code-block-language {
  font-size: 12px;
  color: #6B7280;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  user-select: none;
}

.code-block-language-select {
  font-size: 12px;
  color: #6B7280;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 1px 4px;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;

  &:hover {
    border-color: #D1D5DB;
    background: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: #93C5FD;
    background: rgba(255, 255, 255, 0.7);
  }
}

.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: none;
  background: transparent;
  color: #6B7280;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #374151;
  }

  &.copied {
    color: #16a34a;
  }
}

.copy-label {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.code-block-wrapper :deep(pre) {
  background: #F5F7FA;
  border-radius: 0 0 6px 6px;
  padding: 1em;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  overflow-x: auto;
  margin: 0;
}

.code-block-wrapper :deep(pre code) {
  background: none;
  padding: 0;
  margin: 0;
  font-size: 0.9em;
  color: inherit;
  border-radius: 0;
}
</style>
