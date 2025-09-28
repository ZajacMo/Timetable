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

      <!-- 作业默认截止时间设置 -->
      <div class="setting-group">
        <label class="setting-label">作业默认截止时间</label>
        <div class="setting-control">
          <label class="switch">
            <input type="checkbox" v-model="assignmentDefaultDeadlineEnabled" @change="updateAssignmentSettings">
            <span class="slider round"></span>
          </label>
          <div v-if="assignmentDefaultDeadlineEnabled" class="time-setting">
            <input 
              type="time" 
              v-model="assignmentDefaultDeadlineTime" 
              @change="updateAssignmentSettings"
            >
          </div>
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

      <!-- 每日课程最大数量限制 -->
      <div class="setting-group">
        <label class="setting-label">每日课程最大数量</label>
        <div class="setting-control">
          <input 
            type="number" 
            v-model="maxDailyCourses" 
            @change="updateMaxDailyCourses"
            min="1" 
            max="20"
            placeholder="输入每日最多显示的课程数量"
          >
          <p class="setting-hint">设置为0表示不限制</p>
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

      <!-- 课程时间配置 -->
      <div class="setting-group">
        <label class="setting-label">课程时间配置</label>
        <div class="setting-control">
          <div class="section-times-container">
            <div 
              v-for="(_timeInfo, section) in sectionTimes" 
              :key="section" 
              class="section-time-row">
              <span class="section-label">第{{ section }}节</span>
              <input 
                type="time" 
                v-model="sectionTimes[section].startTime" 
                @change="updateSectionTimes"
                class="time-input"
              >
              <span class="time-separator">-</span>
              <input 
                type="time" 
                v-model="sectionTimes[section].endTime" 
                @change="updateSectionTimes"
                class="time-input"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 学期设置 -->
      <div class="setting-group">
        <label class="setting-label">学期设置</label>
        <div class="setting-control">
          <div class="semester-settings">
            <div class="semester-setting-item">
              <label>学期名称</label>
              <input 
                type="text" 
                v-model="semesterName" 
                @change="updateSemesterSettings"
                placeholder="如：2023-2024学年第1学期"
              >
            </div>
            <div class="semester-setting-item">
              <label>学期开始日期</label>
              <input 
                type="date" 
                v-model="semesterStartDate" 
                @change="updateSemesterSettings"
              >
            </div>
            <div class="semester-setting-item">
              <label>学期周数</label>
              <input 
                type="number" 
                v-model="semesterWeeksCount" 
                @change="updateSemesterSettings"
                min="1" 
                max="30"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 节假日课程调整 -->
      <div class="setting-group">
        <label class="setting-label">节假日课程调整</label>
        <div class="setting-control">
          <div class="holiday-adjustment-form">
            <div class="form-row">
              <div class="form-item">
                <label>原课程周次</label>
                <input type="number" v-model="newAdjustment.originalWeek" min="1" :max="semesterWeeksCount" placeholder="输入周次" />
              </div>
              <div class="form-item">
                <label>原课程日期</label>
                <select v-model="newAdjustment.originalDay">
                  <option value="1">星期一</option>
                  <option value="2">星期二</option>
                  <option value="3">星期三</option>
                  <option value="4">星期四</option>
                  <option value="5">星期五</option>
                  <option value="6">星期六</option>
                  <option value="7">星期日</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-item">
                <label>目标周次</label>
                <input type="number" v-model="newAdjustment.targetWeek" min="1" :max="semesterWeeksCount" placeholder="输入周次" />
              </div>
              <div class="form-item">
                <label>目标日期</label>
                <select v-model="newAdjustment.targetDay">
                  <option value="1">星期一</option>
                  <option value="2">星期二</option>
                  <option value="3">星期三</option>
                  <option value="4">星期四</option>
                  <option value="5">星期五</option>
                  <option value="6">星期六</option>
                  <option value="7">星期日</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-item full-width">
                <label>调整原因</label>
                <input type="text" v-model="newAdjustment.reason" placeholder="例如：国庆节调课" />
              </div>
            </div>
            
            <button class="action-button" @click="addAdjustment">添加调整记录</button>
          </div>
          
          <!-- 调整记录列表 -->
          <div class="adjustment-list" v-if="holidayAdjustments.length > 0">
            <h4>现有调整记录</h4>
            <div class="adjustment-item" v-for="adjustment in holidayAdjustments" :key="adjustment.id">
              <div class="adjustment-info">
                <span class="adjustment-period">第{{ adjustment.originalWeek }}周{{ getDayName(adjustment.originalDay) }}</span>
                <span class="adjustment-arrow">→</span>
                <span class="adjustment-period">第{{ adjustment.targetWeek }}周{{ getDayName(adjustment.targetDay) }}</span>
              </div>
              <div class="adjustment-reason">{{ adjustment.reason }}</div>
              <button class="delete-btn" @click="deleteAdjustment(adjustment.id)">删除</button>
            </div>
          </div>
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
import type { HolidayCourseAdjustment } from '@/stores/settings'
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
const maxDailyCourses = ref(settingsStore.settings.display.maxDailyCourses || 6)
const sectionTimes = ref({...settingsStore.settings.display.sectionTimes || {}})

// 作业默认截止时间设置
const assignmentDefaultDeadlineEnabled = ref(settingsStore.settings.assignment?.defaultDeadline?.enabled || true)
const assignmentDefaultDeadlineTime = ref(settingsStore.settings.assignment?.defaultDeadline?.time || '20:00')

// 学期设置
const semesterName = ref(settingsStore.settings.semester.name)
const semesterStartDate = ref(settingsStore.settings.semester.startDate.split('T')[0]) // 格式化为YYYY-MM-DD
const semesterWeeksCount = ref(settingsStore.settings.semester.weeksCount)

// 节假日课程调整相关数据
const holidayAdjustments = ref<HolidayCourseAdjustment[]>([])
const newAdjustment = ref({
  originalWeek: 0,
  originalDay: 1,
  targetWeek: 0,
  targetDay: 1,
  reason: ''
})

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

// 更新作业设置
const updateAssignmentSettings = () => {
  settingsStore.updateSettings({
    assignment: {
      ...settingsStore.settings.assignment,
      defaultDeadline: {
        enabled: assignmentDefaultDeadlineEnabled.value,
        time: assignmentDefaultDeadlineTime.value
      }
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

const updateMaxDailyCourses = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      maxDailyCourses: Number(maxDailyCourses.value) || 999 // 0表示不限制
    }
  })
}

const updateSectionTimes = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      sectionTimes: sectionTimes.value
    }
  })
}

// 更新学期设置
const updateSemesterSettings = () => {
  settingsStore.updateSettings({
    semester: {
      ...settingsStore.settings.semester,
      name: semesterName.value,
      startDate: new Date(semesterStartDate.value).toISOString(),
      weeksCount: Number(semesterWeeksCount.value)
    }
  })
}

// 添加节假日课程调整记录
const addAdjustment = async () => {
  // 验证输入
  if (!newAdjustment.value.originalWeek || !newAdjustment.value.targetWeek || !newAdjustment.value.reason) {
    alert('请填写完整的调整信息')
    return
  }
  
  // 检查周次范围
  if (newAdjustment.value.originalWeek < 1 || newAdjustment.value.originalWeek > semesterWeeksCount.value || 
      newAdjustment.value.targetWeek < 1 || newAdjustment.value.targetWeek > semesterWeeksCount.value) {
    alert('周次超出了学期范围')
    return
  }
  
  try {
    // 添加调整记录
    const adjustment = await settingsStore.addHolidayCourseAdjustment({
      originalWeek: Number(newAdjustment.value.originalWeek),
      originalDay: Number(newAdjustment.value.originalDay),
      targetWeek: Number(newAdjustment.value.targetWeek),
      targetDay: Number(newAdjustment.value.targetDay),
      reason: newAdjustment.value.reason
    })
    
    // 更新本地状态
    holidayAdjustments.value.push(adjustment)
    
    // 重置表单
    newAdjustment.value = {
      originalWeek: 0,
      originalDay: 1,
      targetWeek: 0,
      targetDay: 1,
      reason: ''
    }
    
    alert('调整记录添加成功')
  } catch (error) {
    console.error('添加调整记录失败:', error)
    alert('添加调整记录失败，请重试')
  }
}

// 删除节假日课程调整记录
const deleteAdjustment = async (id: string) => {
  if (confirm('确定要删除这条调整记录吗？')) {
    try {
      const success = await settingsStore.deleteHolidayCourseAdjustment(id)
      if (success) {
        // 更新本地状态
        holidayAdjustments.value = holidayAdjustments.value.filter(adj => adj.id !== id)
        alert('调整记录删除成功')
      } else {
        alert('调整记录不存在')
      }
    } catch (error) {
      console.error('删除调整记录失败:', error)
      alert('删除调整记录失败，请重试')
    }
  }
}

// 获取星期名称
const getDayName = (day: number): string => {
  const days = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
  return days[day] || ''
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

watch(
  () => settingsStore.settings.display.maxDailyCourses,
  (newMaxDailyCourses) => {
    maxDailyCourses.value = newMaxDailyCourses
  }
)

// 监听节假日课程调整记录变化
watch(
  () => settingsStore.settings.holidayCourseAdjustments,
  (newAdjustments) => {
    holidayAdjustments.value = [...newAdjustments]
  },
  { deep: true }
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

.setting-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  margin-bottom: 0;
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

.section-times-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.section-time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.section-label {
  width: 60px;
  font-size: 14px;
}

.time-input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;
}

.time-separator {
  font-size: 14px;
  color: #666;
}

/* 学期设置样式 */
.semester-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.semester-setting-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.semester-setting-item label {
  font-size: 14px;
  color: #666;
}

.semester-setting-item input[type="text"],
.semester-setting-item input[type="date"],
.semester-setting-item input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 节假日课程调整样式 */
.holiday-adjustment-form {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 150px;
}

.form-item.full-width {
  flex: 100%;
}

.form-item label {
  font-size: 14px;
  color: #666;
}

.form-item input[type="number"],
.form-item input[type="text"],
.form-item select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.adjustment-list {
  margin-top: 20px;
}

.adjustment-list h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.adjustment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.adjustment-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.adjustment-period {
  font-weight: 500;
  color: #333;
}

.adjustment-arrow {
  color: #999;
  font-size: 16px;
}

.adjustment-reason {
  margin-left: 20px;
  color: #666;
  font-size: 14px;
  flex: 1;
}

.delete-btn {
  padding: 6px 12px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: #ff7875;
}
</style>