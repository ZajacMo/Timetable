import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Schedule } from '@/types/schedule'

// 存储键名
const STORAGE_KEY = 'timetable-schedules'

export const useSchedulesStore = defineStore('schedules', () => {
  // 状态
  const schedules = ref<Schedule[]>([])
  
  // 初始化
  const initialize = () => {
    loadSchedules()
  }
  
  // 从本地存储加载日程数据
  const loadSchedules = () => {
    try {
      const storedSchedules = localStorage.getItem(STORAGE_KEY)
      if (storedSchedules) {
        schedules.value = JSON.parse(storedSchedules, (key, value) => {
          // 将日期字符串转换回Date对象
          if (key === 'startDate' || key === 'endDate') {
            return new Date(value)
          }
          return value
        })
      }
    } catch (error) {
      console.error('加载日程数据失败:', error)
      // 初始化一些模拟数据，方便测试
      schedules.value = getMockSchedules()
      saveSchedules()
    }
  }
  
  // 保存日程数据到本地存储
  const saveSchedules = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules.value))
    } catch (error) {
      console.error('保存日程数据失败:', error)
    }
  }
  
  // 添加日程
  const addSchedule = async (scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> => {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: generateId(),
      color: scheduleData.color || generateColor(scheduleData.title)
    }
    
    schedules.value.push(newSchedule)
    saveSchedules()
    
    return newSchedule
  }
  
  // 更新日程
  const updateSchedule = async (id: string, updatedData: Partial<Schedule>): Promise<Schedule | null> => {
    const index = schedules.value.findIndex(schedule => schedule.id === id)
    if (index === -1) {
      return null
    }
    
    // 确保日期对象正确处理
    if (updatedData.startDate && typeof updatedData.startDate === 'string') {
      updatedData.startDate = new Date(updatedData.startDate)
    }
    if (updatedData.endDate && typeof updatedData.endDate === 'string') {
      updatedData.endDate = new Date(updatedData.endDate)
    }
    
    schedules.value[index] = {
      ...schedules.value[index],
      ...updatedData
    }
    
    saveSchedules()
    return schedules.value[index]
  }
  
  // 删除日程
  const deleteSchedule = async (id: string): Promise<boolean> => {
    const initialLength = schedules.value.length
    schedules.value = schedules.value.filter(schedule => schedule.id !== id)
    
    if (schedules.value.length < initialLength) {
      saveCourses()
      return true
    }
    
    return false
  }
  
  // 修复函数名称错误
  function saveCourses() {
    saveSchedules()
  }
  
  // 清空所有日程
  const clearSchedules = async (): Promise<void> => {
    schedules.value = []
    saveSchedules()
  }
  
  // 导入日程数据
  const importSchedules = async (importedSchedules: Schedule[]): Promise<void> => {
    // 处理导入的日期对象
    const processedSchedules = importedSchedules.map(schedule => ({
      ...schedule,
      startDate: schedule.startDate instanceof Date ? schedule.startDate : new Date(schedule.startDate),
      endDate: schedule.endDate instanceof Date ? schedule.endDate : new Date(schedule.endDate)
    }))
    
    schedules.value = [...schedules.value, ...processedSchedules]
    saveSchedules()
  }
  
  // 获取指定日期的日程
  const getSchedulesForDate = computed(() => {
    return (date: Date): Schedule[] => {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      return schedules.value.filter(schedule => {
        const scheduleStart = schedule.startDate instanceof Date ? schedule.startDate : new Date(schedule.startDate)
        const scheduleEnd = schedule.endDate instanceof Date ? schedule.endDate : new Date(schedule.endDate)
        
        // 检查是否是全天日程
        if (schedule.isAllDay) {
          // 全天日程的开始日期与目标日期相同
          const scheduleDate = new Date(scheduleStart)
          scheduleDate.setHours(0, 0, 0, 0)
          return scheduleDate.getTime() === startOfDay.getTime()
        }
        
        // 非全天日程，检查是否与目标日期重叠
        return !(scheduleEnd < startOfDay || scheduleStart > endOfDay)
      }).sort((a, b) => {
        // 按开始时间排序
        const aStart = a.startDate instanceof Date ? a.startDate : new Date(a.startDate)
        const bStart = b.startDate instanceof Date ? b.startDate : new Date(b.startDate)
        return aStart.getTime() - bStart.getTime()
      })
    }
  })
  
  // 获取指定日期范围的日程
  const getSchedulesForDateRange = computed(() => {
    return (startDate: Date, endDate: Date): Schedule[] => {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      
      return schedules.value.filter(schedule => {
        const scheduleStart = schedule.startDate instanceof Date ? schedule.startDate : new Date(schedule.startDate)
        const scheduleEnd = schedule.endDate instanceof Date ? schedule.endDate : new Date(schedule.endDate)
        
        // 检查是否与日期范围重叠
        return !(scheduleEnd < start || scheduleStart > end)
      }).sort((a, b) => {
        // 按开始时间排序
        const aStart = a.startDate instanceof Date ? a.startDate : new Date(a.startDate)
        const bStart = b.startDate instanceof Date ? b.startDate : new Date(b.startDate)
        return aStart.getTime() - bStart.getTime()
      })
    }
  })
  
  // 获取今天的日程
  const getTodaySchedules = computed(() => {
    return (): Schedule[] => {
      return getSchedulesForDate.value(new Date())
    }
  })
  
  // 获取即将到来的日程
  const getUpcomingSchedules = computed(() => {
    return (count: number = 5): Schedule[] => {
      const now = new Date()
      
      return schedules.value
        .filter(schedule => {
          const scheduleStart = schedule.startDate instanceof Date ? schedule.startDate : new Date(schedule.startDate)
          return scheduleStart >= now
        })
        .sort((a, b) => {
          const aStart = a.startDate instanceof Date ? a.startDate : new Date(a.startDate)
          const bStart = b.startDate instanceof Date ? b.startDate : new Date(b.startDate)
          return aStart.getTime() - bStart.getTime()
        })
        .slice(0, count)
    }
  })
  
  // 检查是否有日程冲突
  const checkForConflicts = computed(() => {
    return (newSchedule: Omit<Schedule, 'id'>): Schedule[] => {
      const newStart = newSchedule.startDate instanceof Date ? newSchedule.startDate : new Date(newSchedule.startDate)
      const newEnd = newSchedule.endDate instanceof Date ? newSchedule.endDate : new Date(newSchedule.endDate)
      
      return schedules.value.filter(schedule => {
        const scheduleStart = schedule.startDate instanceof Date ? schedule.startDate : new Date(schedule.startDate)
        const scheduleEnd = schedule.endDate instanceof Date ? schedule.endDate : new Date(schedule.endDate)
        
        // 检查时间是否重叠
        return !(newEnd <= scheduleStart || newStart >= scheduleEnd)
      })
    }
  })
  
  // 辅助函数
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  function generateColor(str: string): string {
    // 根据字符串生成一致的颜色
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF
      color += ('00' + value.toString(16)).substr(-2)
    }
    return color
  }
  
  // 生成模拟日程数据
  function getMockSchedules(): Schedule[] {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const mockSchedules: Schedule[] = [
      {
        id: generateId(),
        title: '班级会议',
        description: '讨论下周课程安排和活动计划',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
        isAllDay: false,
        color: '#ff6b6b'
      },
      {
        id: generateId(),
        title: '生日聚会',
        description: '庆祝同学生日',
        startDate: tomorrow,
        endDate: tomorrow,
        isAllDay: true,
        color: '#4ecdc4'
      },
      {
        id: generateId(),
        title: '项目答辩',
        description: '小组项目最终答辩',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
        isAllDay: false,
        color: '#ffe66d'
      },
      {
        id: generateId(),
        title: '体育考试',
        description: '大学体育期末测试',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 8, 30),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 30),
        isAllDay: false,
        color: '#1a535c'
      }
    ]
    return mockSchedules
  }
  
  return {
    schedules,
    initialize,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    clearSchedules,
    importSchedules,
    getSchedulesForDate,
    getSchedulesForDateRange,
    getTodaySchedules,
    getUpcomingSchedules,
    checkForConflicts
  }
})