<template>
  <div class="settings-view">
    <h2>设置</h2>
    
    <!-- 设置表单 -->
    <div class="settings-list">
      <!-- 主题设置 -->
      <div class="setting-item" @click="openDrawer('theme')">
        <span class="setting-label">主题</span>
        <div class="setting-value">
          {{ themeOptions.find(opt => opt.value === theme)?.label || '' }}
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 语言设置 -->
      <div class="setting-item" @click="openDrawer('language')">
        <span class="setting-label">语言</span>
        <div class="setting-value">
          {{ languageOptions.find(opt => opt.value === language)?.label || '' }}
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="setting-item">
        <span class="setting-label">通知提醒</span>
        <div class="setting-value">
          <label class="switch">
            <input type="checkbox" v-model="notifications" @change="updateNotifications">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- 作业默认截止时间设置 -->
      <div class="setting-item">
        <span class="setting-label">作业默认截止时间</span>
        <div class="setting-value">
          <label class="switch">
            <input type="checkbox" v-model="assignmentDefaultDeadlineEnabled" @change="updateAssignmentSettings">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- 显示周末 -->
      <div class="setting-item">
        <span class="setting-label">显示周末</span>
        <div class="setting-value">
          <label class="switch">
            <input type="checkbox" v-model="showWeekends" @change="updateShowWeekends">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- 每日课程最大数量限制 -->
      <div class="setting-item" @click="openDrawer('maxDailyCourses')">
        <span class="setting-label">每日课程最大数量</span>
        <div class="setting-value">
          {{ maxDailyCourses || '不限制' }}
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 课程表显示模式 -->
      <div class="setting-item" @click="openDrawer('displayMode')">
        <span class="setting-label">课程表显示模式</span>
        <div class="setting-value">
          {{ displayModeOptions.find(opt => opt.value === displayMode)?.label || '' }}
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 每节课时长 -->
      <div class="setting-item" @click="openDrawer('classDuration')">
        <span class="setting-label">每节课时长(分钟)</span>
        <div class="setting-value">
          {{ classDuration }}
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 课程时间配置 -->
      <div class="setting-item" @click="openDrawer('sectionTimes')">
        <span class="setting-label">课程时间配置</span>
        <div class="setting-value">
          <span class="summary-text">点击配置各节课时间</span>
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 学期设置 -->
      <div class="setting-item" @click="openDrawer('semester')">
        <span class="setting-label">学期设置</span>
        <div class="setting-value">
          <span class="summary-text">{{ semesterName }}</span>
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 节假日课程调整 -->
      <div class="setting-item" @click="openDrawer('holidayAdjustments')">
        <span class="setting-label">节假日课程调整</span>
        <div class="setting-value">
          <span class="summary-text">{{ holidayAdjustments.length }}条记录</span>
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 数据备份与恢复 -->
      <div class="setting-item" @click="openDrawer('dataManager')">
        <span class="setting-label">数据管理</span>
        <div class="setting-value">
          <span class="summary-text">导出/导入/重置</span>
          <span class="chevron"></span>
        </div>
      </div>

      <!-- 关于 -->
      <div class="setting-item" @click="openDrawer('about')">
        <span class="setting-label">关于</span>
        <div class="setting-value">
          <span class="summary-text">课程表管理系统</span>
          <span class="chevron"></span>
        </div>
      </div>
    </div>

    <!-- 抽屉组件 -->
    <div v-if="drawerVisible" class="drawer-overlay" @click="closeDrawer">
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <h3>{{ getDrawerTitle() }}</h3>
          <button class="drawer-close" @click="closeDrawer">×</button>
        </div>
        <div class="drawer-content">
          <!-- 主题选择 -->
          <div v-if="currentDrawer === 'theme'" class="option-list">
            <div 
              v-for="option in themeOptions" 
              :key="option.value" 
              class="option-item" 
              :class="{ selected: theme === option.value }"
              @click="selectOption('theme', option.value)"
            >
              <span>{{ option.label }}</span>
              <div v-if="theme === option.value" class="check-icon"></div>
            </div>
          </div>

          <!-- 语言选择 -->
          <div v-if="currentDrawer === 'language'" class="option-list">
            <div 
              v-for="option in languageOptions" 
              :key="option.value" 
              class="option-item" 
              :class="{ selected: language === option.value }"
              @click="selectOption('language', option.value)"
            >
              <span>{{ option.label }}</span>
              <div v-if="language === option.value" class="check-icon"></div>
            </div>
          </div>

          <!-- 每日课程最大数量 -->
          <div v-if="currentDrawer === 'maxDailyCourses'" class="input-section">
            <label>每日课程最大数量</label>
            <input 
              type="number" 
              v-model="maxDailyCourses" 
              min="1" 
              max="20"
              placeholder="输入每日最多显示的课程数量"
              class="drawer-input"
            >
            <p class="input-hint">设置为0表示不限制</p>
            <button class="drawer-action-btn" @click="updateMaxDailyCourses">保存</button>
          </div>

          <!-- 课程表显示模式 -->
          <div v-if="currentDrawer === 'displayMode'" class="option-list">
            <div 
              v-for="option in displayModeOptions" 
              :key="option.value" 
              class="option-item" 
              :class="{ selected: displayMode === option.value }"
              @click="selectOption('displayMode', option.value)"
            >
              <span>{{ option.label }}</span>
              <div v-if="displayMode === option.value" class="check-icon"></div>
            </div>
          </div>

          <!-- 每节课时长 -->
          <div v-if="currentDrawer === 'classDuration'" class="input-section">
            <label>每节课时长(分钟)</label>
            <input 
              type="number" 
              v-model="classDuration" 
              min="30" 
              max="120"
              class="drawer-input"
            >
            <button class="drawer-action-btn" @click="updateClassDuration">保存</button>
          </div>

          <!-- 课程时间配置 -->
          <div v-if="currentDrawer === 'sectionTimes'" class="section-times-container">
            <div 
              v-for="(_timeInfo, section) in sectionTimes" 
              :key="section" 
              class="section-time-row">
              <span class="section-label">第{{ section }}节</span>
              <input 
                type="time" 
                v-model="sectionTimes[section].startTime" 
                class="time-input"
              >
              <span class="time-separator">-</span>
              <input 
                type="time" 
                v-model="sectionTimes[section].endTime" 
                class="time-input"
              >
            </div>
            <button class="drawer-action-btn" @click="updateSectionTimes">保存</button>
          </div>

          <!-- 学期设置 -->
          <div v-if="currentDrawer === 'semester'" class="semester-settings">
            <div class="semester-setting-item">
              <label>学期名称</label>
              <input 
                type="text" 
                v-model="semesterName" 
                placeholder="如：2023-2024学年第1学期"
                class="drawer-input"
              >
            </div>
            <div class="semester-setting-item">
              <label>学期开始日期</label>
              <input 
                type="date" 
                v-model="semesterStartDate" 
                class="drawer-input"
              >
            </div>
            <div class="semester-setting-item">
              <label>学期周数</label>
              <input 
                type="number" 
                v-model="semesterWeeksCount" 
                min="1" 
                max="30"
                class="drawer-input"
              >
            </div>
            <button class="drawer-action-btn" @click="updateSemesterSettings">保存</button>
          </div>

          <!-- 节假日课程调整 -->
          <div v-if="currentDrawer === 'holidayAdjustments'" class="holiday-adjustment-section">
            <div class="holiday-adjustment-form">
              <div class="form-row">
                <div class="form-item">
                  <label>原课程周次</label>
                  <input type="number" v-model="newAdjustment.originalWeek" min="1" :max="semesterWeeksCount" placeholder="输入周次" class="drawer-input" />
                </div>
                <div class="form-item">
                  <label>原课程日期</label>
                  <select v-model="newAdjustment.originalDay" class="drawer-select">
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
                  <input type="number" v-model="newAdjustment.targetWeek" min="1" :max="semesterWeeksCount" placeholder="输入周次" class="drawer-input" />
                </div>
                <div class="form-item">
                  <label>目标日期</label>
                  <select v-model="newAdjustment.targetDay" class="drawer-select">
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
                  <input type="text" v-model="newAdjustment.reason" placeholder="例如：国庆节调课" class="drawer-input" />
                </div>
              </div>
              
              <button class="drawer-action-btn" @click="addAdjustment">添加调整记录</button>
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

          <!-- 数据管理 -->
          <div v-if="currentDrawer === 'dataManager'" class="data-manager-section">
            <button class="drawer-action-btn" @click="exportData">导出数据</button>
            <button class="drawer-action-btn" @click="importData">导入数据</button>
            <button class="drawer-action-btn danger" @click="resetData">重置数据</button>
          </div>

          <!-- 关于 -->
          <div v-if="currentDrawer === 'about'" class="about-section">
            <div class="about-info">
              <p>课程表管理系统</p>
              <p>版本: v3.0.0</p>
              <p>Vue3 + Cordova 版本</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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

// 抽屉相关数据
const drawerVisible = ref(false)
const currentDrawer = ref('')

// 选项列表
const themeOptions = ref([
  { value: 'light', label: '浅色模式' },
  { value: 'dark', label: '深色模式' },
  { value: 'system', label: '跟随系统' }
])

const languageOptions = ref([
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' }
])

const displayModeOptions = ref([
  { value: 'grid', label: '网格视图' },
  { value: 'list', label: '列表视图' }
])

// 方法
const updateTheme = () => {
  settingsStore.updateSettings({
    theme: theme.value
  })
  closeDrawer()
}

const updateLanguage = () => {
  settingsStore.updateSettings({
    language: language.value
  })
  closeDrawer()
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
  closeDrawer()
}

const updateClassDuration = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      classDuration: Number(classDuration.value)
    }
  })
  closeDrawer()
}

const updateMaxDailyCourses = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      maxDailyCourses: Number(maxDailyCourses.value) || 999 // 0表示不限制
    }
  })
  closeDrawer()
}

const updateSectionTimes = () => {
  settingsStore.updateSettings({
    display: {
      ...settingsStore.settings.display,
      sectionTimes: sectionTimes.value
    }
  })
  closeDrawer()
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
  closeDrawer()
}

// 抽屉控制方法
const openDrawer = (drawerType: string) => {
  currentDrawer.value = drawerType
  drawerVisible.value = true
}

const closeDrawer = () => {
  drawerVisible.value = false
  // 延迟重置当前抽屉类型，确保动画完成
  setTimeout(() => {
    currentDrawer.value = ''
  }, 300)
}

const getDrawerTitle = (): string => {
  const titles: Record<string, string> = {
    'theme': '主题',
    'language': '语言',
    'maxDailyCourses': '每日课程最大数量',
    'displayMode': '课程表显示模式',
    'classDuration': '每节课时长',
    'sectionTimes': '课程时间配置',
    'semester': '学期设置',
    'holidayAdjustments': '节假日课程调整',
    'dataManager': '数据管理',
    'about': '关于'
  }
  return titles[currentDrawer.value] || ''
}

const selectOption = (type: string, value: string) => {
  switch (type) {
    case 'theme':
      theme.value = value as "light" | "dark" | "system"
      updateTheme()
      break
    case 'language':
      language.value = value as "zh-CN" | "en-US"
      updateLanguage()
      break
    case 'displayMode':
      displayMode.value = value as "daily" | "weekly"
      updateDisplayMode()
      break
  }
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
/* 整体样式 - 安卓风格 */
.settings-view {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.settings-view h2 {
  margin: 0;
  padding: 16px;
  background-color: #fff;
  font-size: 20px;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

/* 设置列表 - 安卓风格单行布局 */
.settings-list {
  background-color: #f5f5f5;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  margin-bottom: 8px;
  border-radius: 0;
  position: relative;
  transition: background-color 0.2s;
}

.setting-item:hover {
  background-color: #f9f9f9;
}

.setting-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background-color: #e0e0e0;
}

.setting-item:last-child::after {
  display: none;
}

.setting-label {
  font-size: 16px;
  color: #333;
}

.setting-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-value .summary-text {
  font-size: 14px;
  color: #999;
}

/* 右侧箭头图标 */
.chevron {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 12px;
}

.chevron::after {
  content: '>';
  transform: rotate(90deg);
  font-size: 16px;
}

/* 开关样式 - 安卓风格 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
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
  transition: .2s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 抽屉组件样式 - 安卓风格底部弹出 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.drawer {
  background-color: #fff;
  width: 100%;
  max-height: calc(80vh);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  /* 调整抽屉位置，使其不被底部导航栏遮挡 */
  transform: translateY(0);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drawer-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.drawer-close:hover {
  background-color: #f0f0f0;
}

.drawer-content {
  padding: 20px;
  padding-bottom: 80px; /* 添加足够的底部内边距，确保内容不被底部导航栏遮挡 */
  overflow-y: auto;
  flex: 1;
}

/* 选项列表样式 - 安卓风格 */
.option-list {
  display: flex;
  flex-direction: column;
}

.option-item {
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.option-item:last-child {
  border-bottom: none;
}

.option-item.selected {
  color: #4CAF50;
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon::after {
  content: '✓';
  color: white;
  font-size: 14px;
  font-weight: bold;
}

/* 输入区域样式 */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-section label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.drawer-input,
.drawer-select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
}

.drawer-input:focus,
.drawer-select:focus {
  outline: none;
  border-color: #4CAF50;
}

.input-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 抽屉操作按钮 */
.drawer-action-btn {
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;
  align-self: flex-end;
}

.drawer-action-btn:hover {
  background-color: #45a049;
}

.drawer-action-btn.danger {
  background-color: #f44336;
}

.drawer-action-btn.danger:hover {
  background-color: #d32f2f;
}

/* 课程时间配置 */
.section-times-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-time-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.section-label {
  min-width: 80px;
  font-weight: 500;
  color: #333;
}

.time-input {
  width: 100px !important;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-separator {
  margin: 0 5px;
  color: #666;
}

/* 学期设置 */
.semester-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.semester-setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.semester-setting-item label {
  font-weight: 500;
  color: #333;
}

/* 节假日课程调整 */
.holiday-adjustment-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.holiday-adjustment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  flex: 1 1 100%;
}

.form-item label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

/* 调整记录列表 */
.adjustment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.adjustment-list h4 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.adjustment-item {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.adjustment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.adjustment-period {
  font-weight: 500;
  color: #333;
}

.adjustment-arrow {
  font-size: 18px;
  color: #666;
}

.adjustment-reason {
  color: #666;
  font-size: 14px;
}

.delete-btn {
  align-self: flex-start;
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 数据管理 */
.data-manager-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-manager-section .drawer-action-btn {
  align-self: stretch;
}

/* 关于信息 */
.about-section {
  text-align: center;
  padding: 20px 0;
}

.about-info {
  color: #666;
}

.about-info p {
  margin: 8px 0;
}

/* 响应式设计 - 适配小屏幕设备 */
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .setting-item {
    padding: 14px 16px;
  }
  
  .drawer-content {
    padding: 16px;
  }
}
</style>