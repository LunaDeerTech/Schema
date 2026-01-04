<script setup lang="ts">
import { ref } from 'vue'
import { NPopover, NIcon, NTabs, NTabPane, NScrollbar, NInput } from 'naive-ui'
import { AddOutline, SearchOutline } from '@vicons/ionicons5'

const props = defineProps<{
  value?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string | undefined): void
}>()

const showPopover = ref(false)

const emojiCategories = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
  },
  {
    name: 'Objects',
    emojis: ['👋', '🤚', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸']
  },
  {
    name: 'Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦅', '🦉', '🦇', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🦈', '🐟', '🐠', '🐳', '🐋', '🐬', '🐀', '🐁', '🐂', '🐃', '🐄', '🐅', '🐆', '🐇', '🐈', '🐉', '🐊', '🐌', '🐍', '🐎', '🐖', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐁', '🐀', '🐹', '🐰', '🐿️', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖']
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '🛑', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '#️⃣', '*️⃣', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '🔀', '🔁', '🔂', '◀️', '🔼', '🔽', '⏫', '⏬', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '🔄', '↪️', '↩️', '⤴️', '⤵️', 'ℹ️', '🔣', '➕', '➖', '〰️', '➗', '✖️', '✔️', '🔃', '™️', '©️', '®️', '💱', '💲', '➰', '➿']
  }
]

const handleSelect = (emoji: string) => {
  emit('update:value', emoji)
  showPopover.value = false
}

const handleClear = () => {
  emit('update:value', undefined)
}

const handleInput = (val: string | null) => {
  if (!val) {
    emit('update:value', undefined)
    return
  }
  
  // Match any extended pictographic character (emojis)
  const match = val.match(/\p{Extended_Pictographic}/u)
  if (match) {
    emit('update:value', match[0])
  } else {
    // If no emoji found, revert to current value (or clear if it was empty)
    // We emit the current prop value to force the input to revert
    emit('update:value', props.value)
  }
}
</script>

<template>
  <n-popover
    trigger="click"
    placement="bottom-start"
    v-model:show="showPopover"
    class="emoji-picker-popover"
    :show-arrow="false"
  >
    <template #trigger>
      <div class="icon-trigger" :class="{ 'has-icon': !!value }">
        <span v-if="value" class="emoji-icon">{{ value }}</span>
        <div v-else class="placeholder-icon">
          <n-icon><AddOutline /></n-icon>
        </div>
      </div>
    </template>
    
    <div class="emoji-picker">
      <div class="picker-header">
        <n-input
          :value="value"
          placeholder="Type or paste an emoji"
          size="small"
          clearable
          @update:value="handleInput"
          @clear="handleClear"
        >
          <template #prefix>
            <n-icon :component="SearchOutline" />
          </template>
        </n-input>
      </div>
      <n-tabs type="line" size="small" animated>
        <n-tab-pane v-for="category in emojiCategories" :key="category.name" :name="category.name" :tab="category.name">
          <n-scrollbar style="max-height: 200px">
            <div class="emoji-grid">
              <button 
                v-for="emoji in category.emojis" 
                :key="emoji" 
                class="emoji-btn"
                @click="handleSelect(emoji)"
                :title="emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-popover>
</template>

<style scoped lang="scss">
.icon-trigger {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  margin-right: 12px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .emoji-icon {
    font-size: 24px;
    line-height: 1;
  }
  
  .placeholder-icon {
    width: 32px;
    height: 32px;
    border: 1px dashed #ccc;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    
    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  }
}

.emoji-picker {
  width: 320px;
  
  .picker-header {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
    gap: 4px;
    padding: 8px;
    
    .emoji-btn {
      border: none;
      background: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
