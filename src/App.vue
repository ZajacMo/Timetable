<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <h1>日程管理系统</h1>
      <div class="header-actions">
        <button @click="switchTheme" class="theme-button">
          {{ isDarkMode ? '🌞' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- 主要内容区 - 路由视图 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 底部导航 -->
    <nav class="app-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">📅</span>
        <span class="nav-text">课程</span>
      </router-link>
      <router-link to="/schedule" class="nav-item">
        <span class="nav-icon">📝</span>
        <span class="nav-text">日程</span>
      </router-link>
      <router-link to="/settings" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">设置</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSemesterStore } from './stores/semester'
import { useSettingsStore } from './stores/settings'


const semesterStore = useSemesterStore()
const settingsStore = useSettingsStore()

// 计算属性
const isDarkMode = computed(() => settingsStore.settings.theme === 'dark')

const switchTheme = () => {
  const newTheme = settingsStore.settings.theme === 'light' ? 'dark' : 'light'
  settingsStore.updateSettings({ theme: newTheme })
}

// 生命周期钩子
onMounted(() => {
  // 初始化数据
  semesterStore.initialize()
  settingsStore.initialize()
})
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  color: #333;
}

/* 应用容器 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 60px; /* 为底部导航留出空间 */
}

/* 头部导航 */
.app-header {
  background-color: #fff;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.app-header h1 {
  font-size: 20px;
  font-weight: 600;
}

.theme-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

/* 主要内容 */
.app-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 底部导航 */
.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.nav-text {
  font-size: 12px;
}

/* 深色模式 */
.dark-mode {
  background-color: #1e1e1e;
  color: #fff;
}

.dark-mode .app-header,
.dark-mode .semester-selector,
.dark-mode .timetable-container,
.dark-mode .app-nav {
  background-color: #2d2d2d;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-mode .nav-item {
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-main {
    padding: 10px;
  }
}
</style>