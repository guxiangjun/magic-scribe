import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Import cnchar core and plugins
import cnchar from 'cnchar'
import 'cnchar-order'
import 'cnchar-poly'
import 'cnchar-draw'

createApp(App).mount('#app')
