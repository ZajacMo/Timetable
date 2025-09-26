// 课程类型定义

export interface Course {
  // 课程唯一标识符
  id: string
  
  // 课程名称
  name: string
  
  // 教师姓名
  teacher: string
  
  // 教室
  classroom: string
  
  // 开始周
  startWeek: number
  
  // 结束周
  endWeek: number
  
  // 星期几 (1-7, 1表示周一，7表示周日)
  dayOfWeek: number
  
  // 开始节次
  startSection: number
  
  // 结束节次
  endSection: number
  
  // 周类型 (全部/all, 单周/odd, 双周/even)
  weekType: 'all' | 'odd' | 'even'
  
  // 课程颜色
  color: string
}

// 课程冲突信息
interface CourseConflict {
  // 冲突的课程
  course: Course
  
  // 冲突类型
  type: 'time' | 'room' | 'teacher'
  
  // 冲突描述
  description: string
}

// 课程时间段
interface CourseTimeSlot {
  // 星期几
  dayOfWeek: number
  
  // 开始节次
  startSection: number
  
  // 结束节次
  endSection: number
}

// 课程表视图选项
interface TimetableOptions {
  // 是否显示周末
  showWeekend: boolean
  
  // 是否显示教室
  showClassroom: boolean
  
  // 是否显示教师
  showTeacher: boolean
  
  // 每节课的时长（分钟）
  classDuration: number
  
  // 上午开始时间
  morningStartTime: string
  
  // 下午开始时间
  afternoonStartTime: string
  
  // 晚上开始时间
  eveningStartTime: string
}

// 课程表视图数据
interface TimetableData {
  // 星期几的数据
  [key: number]: {
    // 时间段的数据
    [key: number]: Course[]
  }
}

// 课程搜索参数
interface CourseSearchParams {
  // 课程名称关键词
  name?: string
  
  // 教师姓名关键词
  teacher?: string
  
  // 教室关键词
  classroom?: string
  
  // 周数范围
  weekRange?: [number, number]
  
  // 星期几
  dayOfWeek?: number
  
  // 节次范围
  sectionRange?: [number, number]
  
  // 周类型
  weekType?: 'all' | 'odd' | 'even'
}

// 导出所有类型
export type {
  CourseConflict,
  CourseTimeSlot,
  TimetableOptions,
  TimetableData,
  CourseSearchParams
}