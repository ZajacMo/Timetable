import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 存储键名
const STORAGE_KEY = 'timetable-settings'

export interface HolidayCourseAdjustment {
  id: string
  originalWeek: number
  originalDay: number
  targetWeek: number
  targetDay: number
  reason: string
  createdAt: string
}

export interface AppSettings {
  // 主题设置
  theme: 'light' | 'dark' | 'system'
  
  // 语言设置
  language: 'zh-CN' | 'en-US'
  
  // 通知设置
  notifications: {
    enabled: boolean
    courseReminder: number // 提前几分钟提醒
    scheduleReminder: number // 提前几分钟提醒
  }
  
  // 显示设置
  display: {
    showWeekend: boolean
    showClassroom: boolean
    showTeacher: boolean
    timetableMode: 'daily' | 'weekly'
    classDuration: number // 每节课分钟数
    timeFormat: '12h' | '24h'
    maxDailyCourses: number // 每日最大课程数量
    // 课程时间配置
    sectionTimes: {
      [key: number]: {
        startTime: string
        endTime: string
      }
    }
  },
  
  // 学期设置
  semester: {
    startDate: string // ISO日期字符串
    weeksCount: number
    name: string
  }
  
  // 节假日课程调整设置
  holidayCourseAdjustments: HolidayCourseAdjustment[]
  
  // 其他设置
  other: {
    animationEnabled: boolean
    soundEnabled: boolean
    defaultColor: string
  }
}

export const useSettingsStore = defineStore('settings', () => {
  // 默认设置
  const defaultSettings: AppSettings = {
    theme: 'system',
    language: 'zh-CN',
    notifications: {
      enabled: true,
      courseReminder: 15,
      scheduleReminder: 30
    },
    display: {
      showWeekend: true,
      showClassroom: true,
      showTeacher: true,
      timetableMode: 'weekly',
      classDuration: 45,
      timeFormat: '24h',
      maxDailyCourses: 6, // 默认每日最大课程数为6
      // 默认课程时间配置
      sectionTimes: {
        1: { startTime: '08:00', endTime: '08:45' },
        2: { startTime: '08:55', endTime: '09:40' },
        3: { startTime: '10:00', endTime: '10:45' },
        4: { startTime: '10:55', endTime: '11:40' },
        5: { startTime: '13:30', endTime: '14:15' },
        6: { startTime: '14:25', endTime: '15:10' },
        7: { startTime: '15:30', endTime: '16:15' },
        8: { startTime: '16:25', endTime: '17:10' },
        9: { startTime: '18:00', endTime: '18:45' },
        10: { startTime: '18:55', endTime: '19:40' },
        11: { startTime: '19:50', endTime: '20:35' }
      }
    },
    semester: {
      startDate: new Date(new Date().getFullYear(), 7, 1).toISOString(), // 假设9月1日开学
      weeksCount: 20,
      name: new Date().getFullYear() + '-' + (parseInt(String(new Date().getFullYear()).slice(2)) + 1) + '学年第1学期'
    },
    // 初始化节假日课程调整为空数组
    holidayCourseAdjustments: [],
    other: {
      animationEnabled: true,
      soundEnabled: false,
      defaultColor: '#3b82f6'
    }
  }
  
  // 状态
  const settings = ref<AppSettings>(defaultSettings)
  
  // 初始化
  const initialize = () => {
    loadSettings()
    applyTheme()
  }
  
  // 从本地存储加载设置
  const loadSettings = () => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY)
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings)
        // 合并默认设置和存储的设置，确保所有字段都存在
      settings.value = {
        ...defaultSettings,
        ...parsedSettings,
        notifications: {
          ...defaultSettings.notifications,
          ...parsedSettings.notifications
        },
        display: {
          ...defaultSettings.display,
          ...parsedSettings.display
        },
        semester: {
          ...defaultSettings.semester,
          ...parsedSettings.semester
        },
        holidayCourseAdjustments: parsedSettings.holidayCourseAdjustments || defaultSettings.holidayCourseAdjustments,
        other: {
          ...defaultSettings.other,
          ...parsedSettings.other
        }
      }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
      // 使用默认设置
      settings.value = defaultSettings
      saveSettings()
    }
  }
  
  // 保存设置到本地存储
  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }
  
  // 更新设置
  const updateSettings = async (updatedSettings: Partial<AppSettings>): Promise<void> => {
    // 合并更新的设置
    settings.value = {
      ...settings.value,
      ...updatedSettings,
      // 处理嵌套对象的合并
      notifications: updatedSettings.notifications
        ? { ...settings.value.notifications, ...updatedSettings.notifications }
        : settings.value.notifications,
      display: updatedSettings.display
        ? { ...settings.value.display, ...updatedSettings.display }
        : settings.value.display,
      semester: updatedSettings.semester
        ? { ...settings.value.semester, ...updatedSettings.semester }
        : settings.value.semester,
      holidayCourseAdjustments: updatedSettings.holidayCourseAdjustments || settings.value.holidayCourseAdjustments,
      other: updatedSettings.other
        ? { ...settings.value.other, ...updatedSettings.other }
        : settings.value.other
    }
    
    // 保存并应用设置
    saveSettings()
    applyTheme()
  }
  
  // 重置为默认设置
  const resetToDefaults = async (): Promise<void> => {
    settings.value = defaultSettings
    saveSettings()
    applyTheme()
  }
  
  // 应用主题
  const applyTheme = (): void => {
    // 获取实际应该使用的主题
    const effectiveTheme = settings.value.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.value.theme
    
    // 应用主题类到文档根元素
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark')
    document.documentElement.classList.toggle('light', effectiveTheme === 'light')
    
    // 设置主题颜色
    if (effectiveTheme === 'dark') {
      document.documentElement.style.setProperty('--background-color', '#121212')
      document.documentElement.style.setProperty('--text-color', '#ffffff')
      document.documentElement.style.setProperty('--secondary-text-color', '#b0b0b0')
      document.documentElement.style.setProperty('--border-color', '#333333')
      document.documentElement.style.setProperty('--card-background', '#1e1e1e')
    } else {
      document.documentElement.style.setProperty('--background-color', '#ffffff')
      document.documentElement.style.setProperty('--text-color', '#000000')
      document.documentElement.style.setProperty('--secondary-text-color', '#666666')
      document.documentElement.style.setProperty('--border-color', '#e0e0e0')
      document.documentElement.style.setProperty('--card-background', '#f5f5f5')
    }
  }
  
  // 计算属性：获取有效的主题
  const effectiveTheme = computed(() => {
    return settings.value.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.value.theme
  })
  
  // 计算属性：获取学期开始日期的Date对象
  const semesterStartDate = computed(() => {
    return new Date(settings.value.semester.startDate)
  })
  
  // 计算属性：获取当前周数
  const currentWeek = computed(() => {
    const startDate = semesterStartDate.value
    const today = new Date()
    
    // 计算两个日期之间的天数差
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // 计算周数（周一为一周的开始）
    const startDayOfWeek = startDate.getDay() || 7 // 将周日(0)转换为7
    const weekNumber = Math.floor((diffDays + startDayOfWeek - 1) / 7) + 1
    
    // 确保周数在有效范围内
    return Math.max(1, Math.min(weekNumber, settings.value.semester.weeksCount))
  })
  
  // 计算属性：获取时间格式函数
  const formatTime = computed(() => {
    return (date: Date): string => {
      let hours = date.getHours()
      const minutes = date.getMinutes()
      const period = settings.value.display.timeFormat === '12h' ? 
        (hours >= 12 ? 'PM' : 'AM') : ''
      
      if (settings.value.display.timeFormat === '12h') {
        hours = hours % 12
        hours = hours ? hours : 12 // 0 应该显示为 12
      }
      
      const minutesStr = minutes < 10 ? '0' + minutes : minutes
      
      return settings.value.display.timeFormat === '12h' 
        ? `${hours}:${minutesStr} ${period}`
        : `${hours}:${minutesStr}`
    }
  })
  
  // 导出功能
  const exportSettings = (): string => {
    return JSON.stringify(settings.value, null, 2)
  }
  
  // 导入功能
  const importSettings = async (settingsJson: string): Promise<boolean> => {
    try {
      const importedSettings = JSON.parse(settingsJson)
      // 验证导入的数据结构
      if (typeof importedSettings === 'object' && importedSettings !== null) {
        await updateSettings(importedSettings)
        return true
      }
      return false
    } catch (error) {
      console.error('导入设置失败:', error)
      return false
    }
  }
  
  // 添加节假日课程调整记录
  const addHolidayCourseAdjustment = async (adjustment: Omit<HolidayCourseAdjustment, 'id' | 'createdAt'>): Promise<HolidayCourseAdjustment> => {
    const newAdjustment: HolidayCourseAdjustment = {
      ...adjustment,
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    }
    
    settings.value.holidayCourseAdjustments.push(newAdjustment)
    saveSettings()
    
    return newAdjustment
  }
  
  // 删除节假日课程调整记录
  const deleteHolidayCourseAdjustment = async (id: string): Promise<boolean> => {
    const index = settings.value.holidayCourseAdjustments.findIndex(adj => adj.id === id)
    if (index !== -1) {
      settings.value.holidayCourseAdjustments.splice(index, 1)
      saveSettings()
      return true
    }
    return false
  }
  
  // 获取特定的节假日课程调整记录
  const getHolidayCourseAdjustment = (id: string): HolidayCourseAdjustment | undefined => {
    return settings.value.holidayCourseAdjustments.find(adj => adj.id === id)
  }
  
  // 清空所有节假日课程调整记录
  const clearHolidayCourseAdjustments = async (): Promise<void> => {
    settings.value.holidayCourseAdjustments = []
    saveSettings()
  }
  
  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (settings.value.theme === 'system') {
        applyTheme()
      }
    })
  }
  
  return {
    settings,
    initialize,
    updateSettings,
    resetToDefaults,
    applyTheme,
    effectiveTheme,
    semesterStartDate,
    currentWeek,
    formatTime,
    exportSettings,
    importSettings,
    addHolidayCourseAdjustment,
    deleteHolidayCourseAdjustment,
    getHolidayCourseAdjustment,
    clearHolidayCourseAdjustments
  }
})