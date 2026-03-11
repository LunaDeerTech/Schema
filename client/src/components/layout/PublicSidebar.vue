<script setup lang="ts">
import { h, computed, ref } from 'vue'
import { NLayoutSider, NTree, NText, NIcon, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { BookOutline, ChevronBackOutline, ChevronForwardOutline, SunnyOutline, MoonOutline } from '@vicons/ionicons5'
import { useSystemStore } from '@/stores/system'
import { useTheme } from '@/composables/useTheme'
import type { Page as RawPage, Library } from '@/types'
import type { TreeOption } from 'naive-ui'

const systemStore = useSystemStore()
const { isDark, toggleTheme } = useTheme()
const collapsed = ref(false)

// Extend Page type to include optional children for tree rendering
type Page = RawPage & { children?: Page[] }

const props = defineProps<{
  tree: Page[]
  currentId?: string
  library?: Library | null
  isMobile?: boolean
}>()

const componentType = computed(() => {
  return props.isMobile ? 'div' : NLayoutSider
})

const bindProps = computed(() => {
  if (props.isMobile) {
    return {
      class: 'public-sidebar mobile-sidebar'
    }
  }
  return {
    bordered: true,
    width: collapsed.value ? 64 : 280,
    'collapsed-width': 64,
    'native-scrollbar': false,
    class: 'public-sidebar',
    collapsed: collapsed.value,
    'show-trigger': false
  }
})

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
  return h(NText, { depth: 1, style: 'font-size: 14px;' }, { default: () => option.title as string })
}

const renderPrefix = ({ option }: { option: TreeOption }) => {
  const page = option as unknown as Page
  if (page.icon) {
    return h('span', { class: 'page-icon' }, page.icon)
  }
  return ''
}
</script>

<template>
  <component :is="componentType" v-bind="bindProps">
    <div class="sidebar-content" style="padding-bottom: 60px;">
      <!-- Library Info with Collapse Toggle -->
      <div v-if="library" class="library-info">
        <div 
          class="library-card" 
          :class="{ active: currentId === library.id, collapsed: collapsed && !isMobile }"
          @click="goToLibrary"
        >
          <div class="library-icon-wrapper">
            <span v-if="library.icon" class="emoji-icon">{{ library.icon }}</span>
            <NIcon v-else size="20">
              <BookOutline />
            </NIcon>
          </div>
          <div v-if="!collapsed || isMobile" class="library-details">
            <span class="library-name">{{ library.title }}</span>
          </div>
          <NButton
            v-if="(!collapsed || isMobile) && !isMobile"
            text
            size="small"
            class="collapse-btn"
            @click.stop="collapsed = !collapsed"
          >
            <template #icon>
              <NIcon><ChevronBackOutline /></NIcon>
            </template>
          </NButton>
        </div>
        
        <!-- Expand button when collapsed -->
        <NButton
          v-if="collapsed && !isMobile"
          text
          size="small"
          class="expand-btn"
          @click="collapsed = false"
        >
          <template #icon>
            <NIcon><ChevronForwardOutline /></NIcon>
          </template>
        </NButton>
      </div>
      
      <!-- Pages Tree -->
      <div v-if="!collapsed || isMobile" class="tree-container">
        <div class="tree-label">PAGES</div>
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
          class="custom-tree"
        />
      </div>
    </div>
    
    <!-- Footer Section (Fixed at absolute bottom) -->
    <div class="sidebar-footer" v-if="!collapsed || isMobile">
      <div class="footer-content">
        <div class="footer-top">
          <NText depth="3" style="font-size: 12px">
            {{ systemStore.siteTitle }}
          </NText>
          <NButton quaternary circle size="small" @click="toggleTheme">
            <template #icon>
              <NIcon :size="16"><MoonOutline v-if="!isDark" /><SunnyOutline v-else /></NIcon>
            </template>
          </NButton>
        </div>
        <NText depth="3" style="font-size: 11px; margin-top: 4px">
          Powered by 
          <a 
            href="https://github.com/LunaDeerTech/Schema" 
            target="_blank" 
            rel="noopener noreferrer"
            style="color: var(--n-primary-color); text-decoration: none;"
          >
            Schema
          </a>
        </NText>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.public-sidebar {
  background-color: var(--color-bg-sidebar);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.sidebar-content {
  padding: 16px 12px;
  flex: 1;
  overflow-y: auto;
}

.library-info {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.library-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  position: relative;
  
  &.collapsed {
    justify-content: center;
    padding: 12px;
  }
  
  .collapse-btn {
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    .collapse-btn {
      opacity: 1;
    }
    background-color: var(--color-bg-secondary);
    border-color: var(--n-primary-color);
    box-shadow: var(--shadow-card);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--n-primary-color);
    background-color: rgba(24, 160, 88, 0.05);
  }
}

.expand-btn {
  margin-top: 8px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.library-icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-hover);
  border-radius: 8px;
  color: var(--color-text-muted);
  
  .emoji-icon {
    font-size: 20px;
    line-height: 1;
  }
}

.library-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .library-name {
    font-weight: 600;
    font-size: 15px;
    color: var(--n-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .library-meta {
    font-size: 12px;
    color: var(--n-text-color-3);
  }
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  
  .tree-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--n-text-color-3);
    margin-bottom: 8px;
    padding-left: 8px;
    letter-spacing: 0.05em;
  }
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-bg-sidebar);
  padding: 0 16px 16px;
  border-top: 1px solid var(--n-border-color);
  
  .footer-content {
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .footer-top {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

:deep(.n-tree) {
  .n-tree-node {
    border-radius: 6px;
    margin-bottom: 2px;
    padding: 4px 0;
    
    &:hover {
      background-color: var(--color-bg-hover);
    }
    
    &.n-tree-node--selected {
      background-color: rgba(24, 160, 88, 0.1);
      
      .n-tree-node-content__text {
        color: var(--n-primary-color);
        font-weight: 500;
      }
    }
  }
}

.page-icon {
  font-size: 16px;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
