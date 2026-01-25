import type { App } from 'vue'
import {
  // Layout
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NLayoutFooter,
  
  // Navigation
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  
  // Input
  NInput,
  NInputGroup,
  NInputNumber,
  
  // Button
  NButton,
  NButtonGroup,
  
  // Data Display
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NText,
  NH1,
  NH2,
  NH3,
  NH4,
  NH5,
  NH6,
  NP,
  NBlockquote,
  NCode,
  
  // Feedback
  NAlert,
  NDrawer,
  NModal,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
  
  // Data Entry
  NForm,
  NFormItem,
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NSelect,
  NSwitch,
  
  // Utility
  NSpace,
  NDivider,
  NEmpty,
  NSpin,
  
  // Icons
  NIcon
} from 'naive-ui'

const naiveComponents = [
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NLayoutFooter,
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NButton,
  NButtonGroup,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NText,
  NH1,
  NH2,
  NH3,
  NH4,
  NH5,
  NH6,
  NP,
  NBlockquote,
  NCode,
  NAlert,
  NDrawer,
  NModal,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
  NForm,
  NFormItem,
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NSelect,
  NSwitch,
  NSpace,
  NDivider,
  NEmpty,
  NSpin,
  NIcon
]

export default {
  install(app: App) {
    naiveComponents.forEach(component => {
      const name = component.name
      if (name) {
        app.component(name, component)
      }
    })
  }
}