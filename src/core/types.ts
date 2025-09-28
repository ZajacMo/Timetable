// 课程信息接口
export interface Course {
  id: string;
  name: string;
  teacher?: string;
  classroom?: string;
  location?: string;
  startWeek: number;
  endWeek: number;
  dayOfWeek: number; // 1-7 表示周一到周日
  startSection: number;
  endSection: number;
  color?: string;
  weekType?: 'all' | 'odd' | 'even';
}

// 日程信息接口
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  color?: string;
  isCourseRelated?: boolean;
  courseId?: string;
}

// 学期信息接口
export interface Semester {
  id: string;
  name: string;
  startDate: Date;
  totalWeeks: number;
  currentWeek?: number;
}

// 用户设置接口
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  notificationEnabled: boolean;
  calendarSyncEnabled: boolean;
}

// 应用设置接口
export interface Settings {
  activeSemesterId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: 'zh-CN' | 'en-US';
  displayMode?: 'grid' | 'list';
  showWeekends?: boolean;
  maxSections?: number;
}

// 平台存储接口
export interface Assignment {
  id: string;
  courseId: string;
  content: string;
  deadline: Date;
  status: 'pending' | 'submitted' | 'late';
}

export interface StorageProvider {
  save<T>(key: string, data: T): Promise<boolean>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// 重叠类型
export enum OverlapType {
  NO_OVERLAP = 0,
  COURSE_COURSE = 1,
  COURSE_SCHEDULE = 2,
  SCHEDULE_SCHEDULE = 3
}