<template>
  <div class="settings-view">
    <h2>设置</h2>
    
    <!-- 设置表单 -->
    <form class="settings-form">
      <!-- 主题设置 -->
      <div class="setting-group">
        <label class="setting-label">主题</label>
        <div class="setting-control">
          <select v-model="theme" @change="updateTheme">
            <option value="light">浅色模式</option>
            <option value="dark">深色模式</option>
            <option value="system">跟随系统</option>
          </select>
        </div>
      </div>

      <!-- 语言设置 -->
      <div class="setting-group">
        <label class="setting-label">语言</label>
        <div class="setting-control">
          <select v-model="language" @change="updateLanguage">
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="setting-group">
        <label class="setting-label">通知提醒</label>
        <div class="setting-control">
          <label class="switch">
            <input type="checkbox" v-model="notifications" @change="updateNotifications">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- 显示周末 -->
      <div class="setting-group">
        <label class="setting-label">显示周末</label>
        <div class="setting-control">
          <label class="switch">
            <input type="checkbox" v-model="showWeekends" @change="updateShowWeekends">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- 课程表显示模式 -->
      <div class="setting-group">
        <label class="setting-label">课程表显示模式</label>
        <div class="setting-control">
          <select v-model="displayMode" @change="updateDisplayMode">
            <option value="grid">网格视图</option>
            <option value="list">列表视图</option>
          </select>
        </div>
      </div>

      <!-- 每节课时长 -->
      <div class="setting-group">
        <label class="setting-label">每节课时长(分钟)</label>
        <div class="setting-control">
          <input 
            type="number" 
            v-model="classDuration" 
            @change="updateClassDuration"
            min="30" 
            max="120"
          >
        </div>
      </div>

      <!-- 学期设置 -->
      <div class="setting-group">
        <label class="setting-label">学期设置</label>
        <div class="setting-control">
          <button type="button" class="button-link" @click="goToSemesterSettings">
            管理学期设置
          </button>
        </div>
      </div>

      <!-- 数据备份与恢复 -->
      <div class="setting-group">
        <label class="setting-label">数据管理</label>
        <div class="setting-actions">
          <button type="button" class="action-button" @click="exportData">
            导出数据
          </button>
          <button type="button" class="action-button" @click="importData">
            导入数据
          </button>
          <button type="button" class="action-button danger" @click="resetData">
            重置数据
          </button>
        </div>
      </div>

      <!-- 关于 -->
      <div class="setting-group">
        <label class="setting-label">关于</label>
        <div class="setting-control">
          <div class="about-info">
            <p>课程表管理系统</p>
            <p>版本: v3.0.0</p>
            <p>Vue3 + Cordova 版本</p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useSemesterStore } from '@/stores/semester'
import { useCoursesStore } from '@/stores/courses'
import { useScheduleStore } from '@/stores/schedule'
const settingsStore = useSettingsStore()
const semesterStore = useSemesterStore()
const coursesStore = useCoursesStore()
const scheduleStore = useScheduleStore()

// 响应式数据
const theme = ref(settingsStore.settings.theme)
const language = ref(settingsStore.settings.language)
const notifications = ref(settingsStore.settings.notifications.enabled)
const showWeekends = ref(settingsStore.settings.display.showWeekend || false)
const displayMode = ref(settingsStore.settings.display.timetableMode || 'grid')
const classDuration = ref(settingsStore.settings.display.classDuration || 45)

// 方法
const updateTheme = () => {
  settingsStore.updateSettings({
    theme: theme.value
  })
}

const updateLanguage = () => {
  settingsStore.updateSettings({
    language: language.value
  })
}

const updateNotifications = () => {
  settingsStore.updateSettings({
    notifications: {
      ...settingsStore.settings.notifications,
      enabled: notifications.value
    }
  })
}

const updateShowWeekends = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      showWeekend: showWeekends.value
    }
  })
}

const updateDisplayMode = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      timetableMode: displayMode.value
    }
  })
}

const updateClassDuration = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      classDuration: Number(classDuration.value)
    }
  })
}

const goToSemesterSettings = () => {
  // 在实际实现中，这里可以导航到学期设置页面
  alert('学期设置功能正在开发中')
}

const exportData = async () => {
  try {
    // 收集所有数据
    const allData = {
      courses: coursesStore.courses,
      schedules: scheduleStore.schedules,
      semesters: semesterStore.semesters,
      settings: settingsStore.settings
    }
    
    // 将数据转换为JSON字符串
    const jsonData = JSON.stringify(allData, null, 2)
    
    // 创建一个Blob对象
    const blob = new Blob([jsonData], { type: 'application/json' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timetable_backup_${new Date().toISOString().split('T')[0]}.json`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('数据导出成功')
  } catch (error) {
    console.error('数据导出失败:', error)
    alert('数据导出失败，请重试')
  }
}

const importData = () => {
  // 创建一个隐藏的input元素用于文件选择
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            
            // 导入数据
            if (data.courses) await coursesStore.importCourses(data.courses)
            if (data.schedules) await scheduleStore.importSchedules(data.schedules)
            if (data.semesters) await semesterStore.importSemesters(data.semesters)
            if (data.settings) await settingsStore.importSettings(data.settings)
            
            alert('数据导入成功')
          } catch (jsonError) {
            console.error('JSON解析失败:', jsonError)
            alert('文件格式错误，请确保是有效的备份文件')
          }
        }
        reader.readAsText(file)
      } catch (error) {
        console.error('文件读取失败:', error)
        alert('文件读取失败，请重试')
      }
    }
  }
  
  // 触发文件选择对话框
  input.click()
}

const resetData = () => {
  if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
    coursesStore.clearCourses()
    scheduleStore.clearSchedules()
    // 清空所有学期
    semesterStore.semesters.forEach(semester => {
      semesterStore.deleteSemester(semester.id)
    })
    settingsStore.resetToDefaults()
    alert('数据已重置')
  }
}

// 监听设置变化并更新本地状态
watch(
  () => settingsStore.settings.theme,
  (newTheme) => {
    theme.value = newTheme
  }
)

watch(
  () => settingsStore.settings.notifications.enabled,
  (newNotifications) => {
    notifications.value = newNotifications
  }
)

watch(
  () => settingsStore.settings.display.showWeekend,
  (newShowWeekends) => {
    showWeekends.value = newShowWeekends
  }
)

watch(
  () => settingsStore.settings.display.timetableMode,
  (newDisplayMode) => {
    displayMode.value = newDisplayMode
  }
)

watch(
  () => settingsStore.settings.display.classDuration,
  (newClassDuration) => {
    classDuration.value = newClassDuration
  }
)
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

.settings-view h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* 设置表单 */
.settings-form {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 设置组 */
.setting-group {
  border-bottom: 1px solid #eee;
}

.setting-group:last-child {
  border-bottom: none;
}

.setting-label {
  display: block;
  padding: 15px 20px;
  font-weight: 600;
  color: #333;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.setting-control {
  padding: 15px 20px;
  background-color: #fff;
}

/* 表单控件 */
select, input[type="number"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.button-link {
  background: none;
  border: none;
  color: #00a2ae;
  cursor: pointer;
  font-size: 16px;
  text-decoration: underline;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #00a2ae;
}

input:focus + .slider {
  box-shadow: 0 0 1px #00a2ae;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 设置操作 */
.setting-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 20px;
}

.action-button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  background-color: #00a2ae;
  color: white;
}

.action-button.danger {
  background-color: #f44336;
}

/* 关于信息 */
.about-info {
  padding: 15px 0;
}

.about-info p {
  margin: 5px 0;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-view {
    padding: 10px;
  }
}
</style>