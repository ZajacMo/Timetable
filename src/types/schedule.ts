// 日程类型定义

export interface Schedule {
  // 日程唯一标识符
  id: string
  
  // 日程标题
  title: string
  
  // 日程描述
  description: string
  
  // 开始日期
  startDate: Date
  
  // 结束日期
  endDate: Date
  
  // 是否为全天日程
  isAllDay: boolean
  
  // 日程颜色
  color: string
}

// 日程类型
interface ScheduleType {
  // 类型名称
  name: string
  
  // 类型颜色
  color: string
}

// 日程提醒设置
interface ScheduleReminder {
  // 提前几分钟提醒
  minutes: number
  
  // 是否启用
  enabled: boolean
}

// 日程冲突信息
interface ScheduleConflict {
  // 冲突的日程
  schedule: Schedule
  
  // 冲突程度 (高/中/低)
  level: 'high' | 'medium' | 'low'
  
  // 冲突描述
  description: string
}

// 日程搜索参数
interface ScheduleSearchParams {
  // 标题关键词
  title?: string
  
  // 描述关键词
  description?: string
  
  // 日期范围
  dateRange?: [Date, Date]
  
  // 是否全天日程
  isAllDay?: boolean
  
  // 颜色
  color?: string
}

// 日历视图模式
interface CalendarViewMode {
  // 当前视图类型 (日/周/月/列表)
  type: 'day' | 'week' | 'month' | 'list'
  
  // 当前选中的日期
  selectedDate: Date
  
  // 是否显示周数
  showWeekNumbers: boolean
  
  // 一周的开始日 (0=周日, 1=周一, ..., 6=周六)
  weekStart: number
}

// 导出所有类型
export type {
  ScheduleType,
  ScheduleReminder,
  ScheduleConflict,
  ScheduleSearchParams,
  CalendarViewMode
}