<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { CopyOutline, CheckmarkOutline, ChevronDownOutline } from '@vicons/ionicons5'
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
  'arduino', 'bash', 'c', 'cpp', 'csharp', 'css', 'diff', 'docker',
  'go', 'graphql', 'html', 'ini', 'java', 'javascript', 'json',
  'kotlin', 'less', 'lua', 'makefile', 'markdown', 'nginx',
  'objectivec', 'perl', 'php', 'php-template', 'plaintext', 'python',
  'python-repl', 'r', 'ruby', 'rust', 'scss', 'shell', 'sql',
  'swift', 'toml', 'typescript', 'vbnet', 'wasm', 'xml', 'yaml',
]

const currentLanguage = computed(() => props.node.attrs.language || 'auto')

// Language dropdown state
const dropdownOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)

const filteredLanguages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return ['auto', ...languages]
  return ['auto', ...languages].filter(lang => lang.includes(q))
})

const openDropdown = () => {
  if (!isEditable.value) return
  dropdownOpen.value = true
  searchQuery.value = ''
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeDropdown = () => {
  dropdownOpen.value = false
  searchQuery.value = ''
}

const selectLanguage = (lang: string) => {
  props.updateAttributes({ language: lang === 'auto' ? null : lang })
  closeDropdown()
}

const handleDropdownKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.stopPropagation()
    closeDropdown()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!dropdownOpen.value) return
  const target = event.target as Node
  if (
    dropdownRef.value && !dropdownRef.value.contains(target) &&
    triggerRef.value && !triggerRef.value.contains(target)
  ) {
    closeDropdown()
  }
}

document.addEventListener('mousedown', handleClickOutside)
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

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
      <div v-if="isEditable" class="code-block-language-picker" contenteditable="false">
        <div
          ref="triggerRef"
          class="language-trigger"
          @click.stop="openDropdown"
        >
          <span class="language-label">{{ currentLanguage }}</span>
          <n-icon :size="12" class="language-arrow">
            <ChevronDownOutline />
          </n-icon>
        </div>
        <div
          v-if="dropdownOpen"
          ref="dropdownRef"
          class="language-dropdown"
          @keydown="handleDropdownKeydown"
        >
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            class="language-search"
            placeholder="搜索语言..."
            @keydown.stop
          />
          <div class="language-list">
            <div
              v-for="lang in filteredLanguages"
              :key="lang"
              class="language-option"
              :class="{ active: lang === currentLanguage }"
              @click.stop="selectLanguage(lang)"
            >
              {{ lang }}
            </div>
            <div v-if="filteredLanguages.length === 0" class="language-empty">
              无匹配结果
            </div>
          </div>
        </div>
      </div>
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
  border-radius: 8px;
  border: 1px solid var(--color-border-code);
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-code-header);
  padding: 6px 12px 6px 16px;
  min-height: 34px;
  border-bottom: 1px solid var(--color-border-code);
  border-radius: 7px 7px 0 0;
}

.code-block-language {
  font-size: 12px;
  color: var(--color-code-lang-text);
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  user-select: none;
}

/* Language picker */
.code-block-language-picker {
  position: relative;
}

.language-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-code-lang-text);
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  padding: 2px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    border-color: var(--color-code-lang-hover-border);
    background: var(--color-code-lang-hover-bg);
    color: var(--color-code-lang-hover-text);
  }
}

.language-arrow {
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.language-trigger:hover .language-arrow {
  opacity: 1;
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  width: 180px;
  background: var(--color-code-dropdown-bg);
  border: 1px solid var(--color-border-code);
  border-radius: 8px;
  box-shadow: var(--shadow-popup);
  overflow: hidden;
}

.language-search {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--color-border-code);
  outline: none;
  font-size: 12px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  color: var(--color-code-search-text);
  background: var(--color-code-search-bg);
  box-sizing: border-box;

  &::placeholder {
    color: var(--color-code-search-placeholder);
  }
}

.language-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 4px;
}

.language-option {
  padding: 5px 10px;
  font-size: 12px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  color: var(--color-code-option-text);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: var(--color-code-option-hover);
  }

  &.active {
    background: var(--color-code-option-active-bg);
    color: var(--color-code-option-active-text);
    font-weight: 500;
  }
}

.language-empty {
  padding: 12px;
  font-size: 12px;
  color: var(--color-code-search-placeholder);
  text-align: center;
}

.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: none;
  background: transparent;
  color: var(--color-code-lang-text);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background: var(--color-code-copy-hover-bg);
    color: var(--color-code-copy-hover-text);
  }

  &.copied {
    color: var(--color-code-copy-success);
  }
}

.copy-label {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.code-block-wrapper :deep(pre) {
  background: var(--color-bg-code);
  padding: 16px 20px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  overflow-x: auto;
  margin: 0;
  border-radius: 0 0 7px 7px;
}

.code-block-wrapper :deep(pre code) {
  background: none;
  padding: 0;
  margin: 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--color-hljs-text);
  border-radius: 0;
  font-family: inherit;
}

/* Syntax highlighting theme (GitHub-inspired) */
.code-block-wrapper :deep(.hljs-comment),
.code-block-wrapper :deep(.hljs-quote) {
  color: var(--color-hljs-comment);
  font-style: italic;
}

.code-block-wrapper :deep(.hljs-keyword),
.code-block-wrapper :deep(.hljs-selector-tag),
.code-block-wrapper :deep(.hljs-type) {
  color: var(--color-hljs-keyword);
}

.code-block-wrapper :deep(.hljs-string),
.code-block-wrapper :deep(.hljs-addition),
.code-block-wrapper :deep(.hljs-attr) {
  color: var(--color-hljs-string);
}

.code-block-wrapper :deep(.hljs-literal),
.code-block-wrapper :deep(.hljs-number),
.code-block-wrapper :deep(.hljs-symbol) {
  color: var(--color-hljs-number);
}

.code-block-wrapper :deep(.hljs-built_in),
.code-block-wrapper :deep(.hljs-builtin-name) {
  color: var(--color-hljs-builtin);
}

.code-block-wrapper :deep(.hljs-function),
.code-block-wrapper :deep(.hljs-title),
.code-block-wrapper :deep(.hljs-section) {
  color: var(--color-hljs-function);
}

.code-block-wrapper :deep(.hljs-variable),
.code-block-wrapper :deep(.hljs-template-variable) {
  color: var(--color-hljs-builtin);
}

.code-block-wrapper :deep(.hljs-deletion) {
  color: var(--color-hljs-deletion-text);
  background-color: var(--color-hljs-deletion-bg);
}

.code-block-wrapper :deep(.hljs-addition) {
  background-color: var(--color-hljs-addition-bg);
}

.code-block-wrapper :deep(.hljs-meta) {
  color: var(--color-hljs-meta);
}

.code-block-wrapper :deep(.hljs-tag) {
  color: var(--color-hljs-tag);
}

.code-block-wrapper :deep(.hljs-name),
.code-block-wrapper :deep(.hljs-attribute) {
  color: var(--color-hljs-attribute);
}

.code-block-wrapper :deep(.hljs-selector-id),
.code-block-wrapper :deep(.hljs-selector-class) {
  color: var(--color-hljs-selector);
}

.code-block-wrapper :deep(.hljs-regexp),
.code-block-wrapper :deep(.hljs-link) {
  color: var(--color-hljs-string);
}

.code-block-wrapper :deep(.hljs-doctag) {
  color: var(--color-hljs-keyword);
}

.code-block-wrapper :deep(.hljs-params) {
  color: var(--color-hljs-params);
}

.code-block-wrapper :deep(.hljs-emphasis) {
  font-style: italic;
}

.code-block-wrapper :deep(.hljs-strong) {
  font-weight: 700;
}

.code-block-wrapper :deep(.hljs-subst) {
  color: var(--color-hljs-params);
}
</style>
