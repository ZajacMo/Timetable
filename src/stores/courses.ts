import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Course } from '@/types/course'

// 在Cordova环境中使用localStorage，在浏览器环境中也可以使用
const STORAGE_KEY = 'timetable-courses'

export const useCoursesStore = defineStore('courses', () => {
  // 状态
  const courses = ref<Course[]>([])
  
  // 初始化
  const initialize = () => {
    loadCourses()
  }
  
  // 从本地存储加载课程数据
  const loadCourses = () => {
    try {
      const storedCourses = localStorage.getItem(STORAGE_KEY)
      if (storedCourses) {
        courses.value = JSON.parse(storedCourses, (_key, value) => {
          // 不需要特别处理日期，因为课程数据中没有Date对象
          return value
        })
      }
    } catch (error) {
      console.error('加载课程数据失败:', error)
      // 初始化一些模拟数据，方便测试
      courses.value = getMockCourses()
      saveCourses()
    }
  }
  
  // 保存课程数据到本地存储
  const saveCourses = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses.value))
    } catch (error) {
      console.error('保存课程数据失败:', error)
    }
  }
  
  // 添加课程
  const addCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
    const newCourse: Course = {
      ...courseData,
      id: generateId(),
      color: courseData.color || generateColor(courseData.name)
    }
    
    courses.value.push(newCourse)
    saveCourses()
    
    return newCourse
  }
  
  // 更新课程
  const updateCourse = async (id: string, updatedData: Partial<Course>): Promise<Course | null> => {
    const index = courses.value.findIndex(course => course.id === id)
    if (index === -1) {
      return null
    }
    
    courses.value[index] = {
      ...courses.value[index],
      ...updatedData
    }
    
    saveCourses()
    return courses.value[index]
  }
  
  // 删除课程
  const deleteCourse = async (id: string): Promise<boolean> => {
    const initialLength = courses.value.length
    courses.value = courses.value.filter(course => course.id !== id)
    
    if (courses.value.length < initialLength) {
      saveCourses()
      return true
    }
    
    return false
  }
  
  // 清空所有课程
  const clearCourses = async (): Promise<void> => {
    courses.value = []
    saveCourses()
  }
  
  // 导入课程数据
  const importCourses = async (importedCourses: Course[]): Promise<void> => {
    courses.value = [...courses.value, ...importedCourses]
    saveCourses()
  }
  
  // 获取指定周的课程
  const getCoursesForWeek = computed(() => {
    return (week: number): Course[] => {
      return courses.value.filter(course => {
        // 检查是否在周范围内
        if (week < course.startWeek || week > course.endWeek) {
          return false
        }
        
        // 检查单双周设置
        if (course.weekType === 'odd' && week % 2 === 0) {
          return false
        }
        if (course.weekType === 'even' && week % 2 !== 0) {
          return false
        }
        
        return true
      })
    }
  })
  
  // 获取指定日期的课程
  const getCoursesForDate = computed(() => {
    return (date: Date, weekNumber: number): Course[] => {
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay() // 将周日(0)转换为7
      
      return courses.value.filter(course => {
        // 检查星期几
        if (course.dayOfWeek !== dayOfWeek) {
          return false
        }
        
        // 检查周范围和单双周
        return (
          weekNumber >= course.startWeek && 
          weekNumber <= course.endWeek &&
          ((course.weekType === 'all') ||
           (course.weekType === 'odd' && weekNumber % 2 !== 0) ||
           (course.weekType === 'even' && weekNumber % 2 === 0))
        )
      })
    }
  })
  
  // 检查是否有课程冲突
  const checkForConflicts = computed(() => {
    return (newCourse: Omit<Course, 'id'>): Course[] => {
      return courses.value.filter(course => {
        // 检查是否是同一天
        if (course.dayOfWeek !== newCourse.dayOfWeek) {
          return false
        }
        
        // 检查时间是否重叠
        const timeOverlap = !(newCourse.endSection < course.startSection || 
                             newCourse.startSection > course.endSection)
        
        // 检查周范围是否重叠
        const weekOverlap = !(newCourse.endWeek < course.startWeek || 
                             newCourse.startWeek > course.endWeek)
        
        // 检查单双周设置是否有重叠
        const weekTypeOverlap = course.weekType === 'all' || 
                               newCourse.weekType === 'all' ||
                               course.weekType === newCourse.weekType
        
        return timeOverlap && weekOverlap && weekTypeOverlap
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
  
  // 生成模拟课程数据
  function getMockCourses(): Course[] {
    const mockCourses: Course[] = [
      {
        id: generateId(),
        name: '大学英语(Ⅳ)',
        teacher: '张老师',
        classroom: '10203',
        startWeek: 1,
        endWeek: 16,
        dayOfWeek: 1,
        startSection: 1,
        endSection: 2,
        weekType: 'all',
        color: '#f05261'
      },
      {
        id: generateId(),
        name: '毛概',
        teacher: '李老师',
        classroom: '14208',
        startWeek: 1,
        endWeek: 16,
        dayOfWeek: 1,
        startSection: 7,
        endSection: 8,
        weekType: 'all',
        color: '#48a8e4'
      },
      {
        id: generateId(),
        name: '信号与系统',
        teacher: '王老师',
        classroom: '11302',
        startWeek: 1,
        endWeek: 16,
        dayOfWeek: 3,
        startSection: 3,
        endSection: 4,
        weekType: 'all',
        color: '#ffd061'
      },
      {
        id: generateId(),
        name: '模拟电子技术基础',
        teacher: '赵老师',
        classroom: '16204',
        startWeek: 1,
        endWeek: 16,
        dayOfWeek: 3,
        startSection: 5,
        endSection: 6,
        weekType: 'all',
        color: '#52db9a'
      },
      {
        id: generateId(),
        name: '大学体育(Ⅳ)',
        teacher: '刘老师',
        classroom: '操场',
        startWeek: 1,
        endWeek: 16,
        dayOfWeek: 2,
        startSection: 1,
        endSection: 2,
        weekType: 'all',
        color: '#70d3e6'
      }
    ]
    return mockCourses
  }
  
  return {
    courses,
    initialize,
    addCourse,
    updateCourse,
    deleteCourse,
    clearCourses,
    importCourses,
    getCoursesForWeek,
    getCoursesForDate,
    checkForConflicts
  }
})