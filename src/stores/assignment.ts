import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Assignment } from '@/core/types'
import { CourseDataProcessor } from '@/core/courseDataProcessor'
import { useCoursesStore } from './courses'

// 存储键名
const STORAGE_KEY = 'timetable-assignments'

// 定义作业存储模块
export const useAssignmentStore = defineStore('assignment', () => {
  // 状态
  const assignments = ref<Assignment[]>([])
  
  // 初始化
  const initialize = () => {
    loadAssignments()
  }
  
  // 从本地存储加载作业数据
  const loadAssignments = () => {
    try {
      const storedAssignments = localStorage.getItem(STORAGE_KEY)
      if (storedAssignments) {
        assignments.value = JSON.parse(storedAssignments, (_key, value) => {
          // 将字符串日期转换为Date对象
          if (_key === 'deadline' && typeof value === 'string') {
            return new Date(value)
          }
          return value
        })
      }
    } catch (error) {
      console.error('加载作业数据失败:', error)
      // 初始化一些模拟数据，方便测试
      assignments.value = getMockAssignments()
      saveAssignments()
    }
  }
  
  // 保存作业数据到本地存储
  const saveAssignments = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments.value))
    } catch (error) {
      console.error('保存作业数据失败:', error)
    }
  }
  
  // 添加作业
  const addAssignment = async (assignmentData: Omit<Assignment, 'id'>): Promise<Assignment> => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: generateId()
    }
    
    assignments.value.push(newAssignment)
    saveAssignments()
    
    return newAssignment
  }
  
  // 更新作业
  const updateAssignment = async (id: string, updatedData: Partial<Assignment>): Promise<Assignment | null> => {
    const index = assignments.value.findIndex((assignment: Assignment) => assignment.id === id)
    if (index === -1) {
      return null
    }
    
    assignments.value[index] = {
      ...assignments.value[index],
      ...updatedData
    }
    
    saveAssignments()
    return assignments.value[index]
  }
  
  // 更新作业状态
  const updateAssignmentStatus = async (id: string, status: 'pending' | 'submitted' | 'late'): Promise<Assignment | null> => {
    return await updateAssignment(id, { status })
  }
  
  // 删除作业
  const deleteAssignment = async (id: string): Promise<boolean> => {
    const initialLength = assignments.value.length
    assignments.value = assignments.value.filter((assignment: Assignment) => assignment.id !== id)
    
    if (assignments.value.length < initialLength) {
      saveAssignments()
      return true
    }
    
    return false
  }
  
  // 清空所有作业
  const clearAssignments = async (): Promise<void> => {
    assignments.value = []
    saveAssignments()
  }
  
  // 根据课程ID删除所有作业
  const deleteAssignmentsByCourseId = async (courseId: string): Promise<boolean> => {
    const initialLength = assignments.value.length
    assignments.value = assignments.value.filter((assignment: Assignment) => assignment.courseId !== courseId)
    
    if (assignments.value.length < initialLength) {
      saveAssignments()
      return true
    }
    
    return false
  }
  
  // 获取所有作业
  const getAllAssignments = computed(() => {
    return assignments.value
  })
  
  // 获取指定课程的作业
  const getAssignmentsByCourseId = computed(() => {
    return (courseId: string): Assignment[] => {
      return assignments.value.filter((assignment: Assignment) => assignment.courseId === courseId)
    }
  })
  
  // 获取即将截止的作业（默认7天内）
  const getUpcomingAssignments = computed(() => {
    return (days: number = 7): Assignment[] => {
      return CourseDataProcessor.getUpcomingAssignments(assignments.value, days)
    }
  })
  
  // 获取过期的作业
  const getOverdueAssignments = computed(() => {
    return (): Assignment[] => {
      return CourseDataProcessor.getOverdueAssignments(assignments.value)
    }
  })
  
  // 根据状态获取作业
  const getAssignmentsByStatus = computed(() => {
    return (status: 'pending' | 'submitted' | 'late'): Assignment[] => {
      return CourseDataProcessor.getAssignmentsByStatus(assignments.value, status)
    }
  })
  
  // 辅助函数
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 生成模拟作业数据
  function getMockAssignments(): Assignment[] {
    const coursesStore = useCoursesStore()
    // 确保课程数据已加载
    if (coursesStore.courses.length === 0) {
      coursesStore.initialize()
    }
    
    const mockAssignments: Assignment[] = []
    const courses = coursesStore.courses.slice(0, 3) // 只使用前3门课程
    
    // 为每门课程生成一些作业
    courses.forEach((course, courseIndex) => {
      // 生成2-3个作业
      const assignmentCount = 2 + Math.floor(Math.random() * 2)
      
      for (let i = 0; i < assignmentCount; i++) {
        // 生成不同状态的作业
        let status: 'pending' | 'submitted' | 'late' = 'pending'
        if (i === 0) {
          status = 'pending'
        } else if (i === 1) {
          status = 'submitted'
        } else {
          status = 'late'
        }
        
        // 生成截止日期
        const deadline = new Date()
        if (status === 'late') {
          // 已逾期的作业，截止日期在过去
          deadline.setDate(deadline.getDate() - (i + 1) * 2)
        } else {
          // 待提交或已提交的作业，截止日期在未来
          deadline.setDate(deadline.getDate() + (i + 1) * 3)
        }
        
        // 设置时间为23:59:59
        deadline.setHours(23, 59, 59, 0)
        
        // 作业内容
        const contents = [
          '完成教材第' + (courseIndex * 3 + i + 1) + '章的习题',
          '准备下周的小组讨论，主题：' + course.name + '的应用案例分析',
          '撰写' + course.name + '的课程论文，不少于2000字',
          '完成在线平台的测验',
          '阅读指定参考资料并准备读书笔记'
        ]
        
        mockAssignments.push({
          id: generateId(),
          courseId: course.id,
          content: contents[i % contents.length],
          deadline: deadline,
          status: status
        })
      }
    })
    
    return mockAssignments
  }
  
  return {
    assignments,
    initialize,
    loadAssignments,
    addAssignment,
    updateAssignment,
    updateAssignmentStatus,
    deleteAssignment,
    clearAssignments,
    deleteAssignmentsByCourseId,
    getAllAssignments,
    getAssignmentsByCourseId,
    getUpcomingAssignments,
    getOverdueAssignments,
    getAssignmentsByStatus
  }
})

// 定义存储类型
export type AssignmentStore = ReturnType<typeof useAssignmentStore>

// 扩展类型声明（如果需要）
// declare module 'pinia' {
//   export interface PiniaCustomProperties {
//     $assignmentStore: AssignmentStore
//   }
// }