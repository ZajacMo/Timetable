import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

// 等待Cordova设备准备就绪
let app: any

function initApp() {
  const pinia = createPinia()
  app = createApp(App)
  
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus)
  
  // 全局注册Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  app.mount('#app')
}

// 检查是否在Cordova环境中
if (window.hasOwnProperty('cordova')) {
  document.addEventListener('deviceready', () => {
    console.log('Cordova设备已准备就绪')
    initApp()
  }, false)
} else {
  // 在浏览器环境中直接初始化应用
  console.log('在浏览器环境中运行')
  initApp()
}