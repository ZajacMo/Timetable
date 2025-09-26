import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 学期类型定义
export interface Semester {
  id: string
  name: string
  startDate: string
  endDate: string
  totalWeeks: number
}

// Mock学期数据
const mockSemesters: Semester[] = [
  {
    id: '2024-1',
    name: '2024-2025学年第一学期',
    startDate: '2024-09-02',
    endDate: '2025-01-17',
    totalWeeks: 18
  },
  {
    id: '2024-2',
    name: '2024-2025学年第二学期',
    startDate: '2025-02-24',
    endDate: '2025-07-04',
    totalWeeks: 18
  }
]

export const useSemesterStore = defineStore('semester', () => {
  // 状态
  const semesters = ref<Semester[]>([])
  const activeSemesterId = ref<string>('')
  const currentWeek = ref<number>(1)

  // 计算属性
  const getActiveSemester = computed(() => {
    return semesters.value.find(s => s.id === activeSemesterId.value)
  })

  // 方法
  const initialize = () => {
    // 从本地存储加载数据
    const savedSemesters = localStorage.getItem('semesters')
    const savedActiveSemesterId = localStorage.getItem('activeSemesterId')
    const savedCurrentWeek = localStorage.getItem('currentWeek')

    if (savedSemesters) {
      semesters.value = JSON.parse(savedSemesters)
    } else {
      // 如果没有保存的数据，使用mock数据
      semesters.value = mockSemesters
    }

    if (savedActiveSemesterId) {
      activeSemesterId.value = savedActiveSemesterId
    } else {
      // 默认选择第一个学期
      activeSemesterId.value = semesters.value[0]?.id || ''
    }

    if (savedCurrentWeek) {
      currentWeek.value = parseInt(savedCurrentWeek)
    } else {
      // 计算当前周
      updateCurrentWeek()
    }

    // 保存到本地存储
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('semesters', JSON.stringify(semesters.value))
    localStorage.setItem('activeSemesterId', activeSemesterId.value)
    localStorage.setItem('currentWeek', currentWeek.value.toString())
  }

  const addSemester = (semester: Omit<Semester, 'id'>) => {
    const newSemester: Semester = {
      ...semester,
      id: `semester-${Date.now()}`
    }
    semesters.value.push(newSemester)
    saveToLocalStorage()
    return newSemester
  }

  const updateSemester = (id: string, updates: Partial<Semester>) => {
    const index = semesters.value.findIndex(s => s.id === id)
    if (index !== -1) {
      semesters.value[index] = { ...semesters.value[index], ...updates }
      saveToLocalStorage()
    }
  }

  const deleteSemester = (id: string) => {
    const index = semesters.value.findIndex(s => s.id === id)
    if (index !== -1) {
      semesters.value.splice(index, 1)
      // 如果删除的是当前活跃的学期，切换到第一个学期
      if (activeSemesterId.value === id) {
        activeSemesterId.value = semesters.value[0]?.id || ''
      }
      saveToLocalStorage()
    }
  }

  const setActiveSemester = (id: string) => {
    activeSemesterId.value = id
    saveToLocalStorage()
  }

  const setCurrentWeek = (week: number) => {
    currentWeek.value = week
    saveToLocalStorage()
  }

  const updateCurrentWeek = () => {
    const activeSemester = getActiveSemester.value
    if (!activeSemester) return

    const startDate = new Date(activeSemester.startDate)
    const today = new Date()
    
    // 计算两个日期之间的周数差
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(diffDays / 7) + 1
    
    // 确保周数在学期范围内
    currentWeek.value = Math.min(Math.max(1, weekNumber), activeSemester.totalWeeks)
    saveToLocalStorage()
  }

  const getWeekDateRange = (week: number) => {
    const activeSemester = getActiveSemester.value
    if (!activeSemester) return null

    const startDate = new Date(activeSemester.startDate)
    startDate.setDate(startDate.getDate() + (week - 1) * 7)
    
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    
    return {
      start: startDate,
      end: endDate
    }
  }

  const importSemesters = (newSemesters: Semester[]) => {
    semesters.value = newSemesters
    // 如果没有活跃的学期，设置第一个为活跃
    if (!activeSemesterId.value || !semesters.value.find(s => s.id === activeSemesterId.value)) {
      activeSemesterId.value = semesters.value[0]?.id || ''
    }
    saveToLocalStorage()
  }

  return {
    // 状态
    semesters,
    activeSemesterId,
    currentWeek,
    
    // 计算属性
    getActiveSemester,
    
    // 方法
    initialize,
    addSemester,
    updateSemester,
    deleteSemester,
    setActiveSemester,
    setCurrentWeek,
    updateCurrentWeek,
    getWeekDateRange,
    importSemesters
  }
})