import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'

// Import styles
import './assets/main.scss'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')