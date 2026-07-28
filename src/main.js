import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeAuth } from './services/auth'
import { firebaseApp } from './Firebase/init'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

initializeAuth(firebaseApp)

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')
