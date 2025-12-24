<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div id="app">
        <router-view />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NConfigProvider, NMessageProvider, type GlobalThemeOverrides } from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui'

// Use light theme
const theme = ref(null)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#007AFF',
    primaryColorHover: '#0071E3',
    primaryColorPressed: '#005BB5',
    primaryColorSuppl: '#007AFF',
    borderRadius: '10px',
    borderRadiusSmall: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    bodyColor: '#F2F2F7',
    cardColor: '#FFFFFF',
    textColorBase: '#000000',
    textColor1: '#000000',
    textColor2: '#8E8E93',
    textColor3: '#C7C7CC',
  },
  Button: {
    borderRadiusMedium: '10px',
    fontWeight: '500',
  },
  Card: {
    borderRadius: '12px',
    borderColor: 'transparent',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  Input: {
    borderRadius: '10px',
  }
}
</script>

<style lang="scss">
// Global styles are imported in main.ts via assets/main.scss
</style>