<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'

const content = ref({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello Tiptap!' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'This is a test of the Tiptap editor integration.' }],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task 1' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task 2 (Done)' }],
            },
          ],
        },
      ],
    },
  ],
})

const handleUpdate = (newContent: any) => {
  console.log('Content updated:', newContent)
  // In a real app, we might not update the ref directly to avoid loops, 
  // but for testing we want to see if it works.
  // Actually, Tiptap manages its own state, so we don't need to update `content` ref 
  // unless we want to sync it back for saving.
}
</script>

<template>
  <div class="editor-test-page">
    <h1>Editor Test Page</h1>
    <div class="editor-container">
      <TiptapEditor :content="content" @update="handleUpdate" />
    </div>
  </div>
</template>

<style scoped>
.editor-test-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.editor-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  min-height: 400px;
  background: white;
}
</style>
