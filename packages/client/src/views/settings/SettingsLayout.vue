<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NLayout, 
  NLayoutSider, 
  NLayoutContent, 
  NMenu, 
  NIcon,
  type MenuOption 
} from 'naive-ui'
import {
  PersonOutline,
  LockClosedOutline,
  LibraryOutline,
  DocumentTextOutline,
  ArchiveOutline,
  ImagesOutline,
  CopyOutline,
  InformationCircleOutline,
  MailOutline,
  ShieldCheckmarkOutline
} from '@vicons/ionicons5'
import TopNavigation from '@/components/layout/TopNavigation.vue'

const router = useRouter()
const route = useRoute()

// Assumption: User is always admin in single-user mode, or check store if implemented
const isAdmin = ref(true) 
const collapsed = ref(false)

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed<MenuOption[]>(() => {
  const options: MenuOption[] = [
    {
      label: 'Personal Information',
      key: 'personal',
      type: 'group',
      children: [
        {
          label: 'Account Information',
          key: 'profile',
          icon: renderIcon(PersonOutline)
        },
        {
          label: 'Password & Security',
          key: 'security',
          icon: renderIcon(LockClosedOutline)
        }
      ]
    },
    {
      label: 'Document Management',
      key: 'documents',
      type: 'group',
      children: [
        {
          label: 'Libraries',
          key: 'libraries',
          icon: renderIcon(LibraryOutline)
        },
        {
          label: 'Pages',
          key: 'pages',
          icon: renderIcon(DocumentTextOutline)
        },
        {
          label: 'Archived',
          key: 'archived',
          icon: renderIcon(ArchiveOutline)
        },
        {
          label: 'Image Resources',
          key: 'assets',
          icon: renderIcon(ImagesOutline)
        },
        {
          label: 'Templates',
          key: 'templates',
          icon: renderIcon(CopyOutline)
        }
      ]
    }
  ]

  if (isAdmin.value) {
    options.push({
      label: 'System Settings',
      key: 'system',
      type: 'group',
      children: [
        {
          label: 'Site Information',
          key: 'site-info',
          icon: renderIcon(InformationCircleOutline)
        },
        {
          label: 'SMTP Configuration',
          key: 'smtp',
          icon: renderIcon(MailOutline)
        },
        {
          label: 'Access Configuration',
          key: 'access',
          icon: renderIcon(ShieldCheckmarkOutline)
        }
      ]
    })
  }

  return options
})

// Current selected key mapping
const activeKey = computed(() => {
  const path = route.path
  const parts = path.split('/')
  return parts[parts.length - 1]
})

function handleUpdateValue(key: string) {
  router.push(`/settings/${key}`)
}
</script>

<template>
  <n-layout class="settings-layout-wrapper">
    <TopNavigation v-model:collapsed="collapsed" />
    <n-layout has-sider class="settings-layout">
      <n-layout-sider
        bordered
        :width="240"
        :collapsed="collapsed"
        collapse-mode="width"
        :native-scrollbar="false"
        class="settings-sider"
      >
        <div class="settings-title" v-if="!collapsed">Settings</div>
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleUpdateValue"
          default-expand-all
        />
      </n-layout-sider>
      <n-layout-content class="settings-content-wrapper">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped lang="scss">
.settings-layout-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-layout {
  flex: 1;
  height: calc(100vh - 56px);
}

.settings-sider {
  padding-top: 12px;
}

.settings-title {
  padding: 0 24px;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

.settings-content-wrapper {
  background-color: var(--n-color);
}
</style>
