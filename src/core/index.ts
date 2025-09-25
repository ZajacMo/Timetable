// 导出核心类型
export * from './types';

// 导出数据管理器
export { DataManager } from './dataManager';

// 导出存储实现
export { MemoryStorage } from './memoryStorage';

// 导出课程表渲染器
export { TimetableRenderer } from './timetableRenderer';

// 导出工具函数
export * from './utils';

/**
 * 核心库版本
 */
export const VERSION = '1.0.0';

/**
 * 初始化核心库
 * @returns Promise<void>
 */
export async function initCore(): Promise<void> {
  console.log(`Core library initialized (v${VERSION})`);
  // 核心库初始化逻辑
}

/**
 * 创建默认数据管理器实例
 * @returns DataManager 实例
 */
export function createDefaultDataManager(): import('./dataManager').DataManager {
  const { DataManager, MemoryStorage } = require('./dataManager');
  const storage = new MemoryStorage();
  return new DataManager(storage);
}

/**
 * 创建默认课程表渲染器实例
 * @returns TimetableRenderer 实例
 */
export function createDefaultTimetableRenderer(): import('./timetableRenderer').TimetableRenderer {
  const { TimetableRenderer } = require('./timetableRenderer');
  return new TimetableRenderer();
}

/**
 * 获取当前日期对应的教学周
 * @param semesterStartDate 学期开始日期
 * @param currentDate 当前日期（可选，默认当前系统日期）
 * @returns 当前教学周数
 */
export function getCurrentWeek(semesterStartDate: Date, currentDate: Date = new Date()): number {
  // 确保日期对象正确
  if (!(semesterStartDate instanceof Date) || isNaN(semesterStartDate.getTime())) {
    throw new Error('Invalid semester start date');
  }
  
  if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
    currentDate = new Date();
  }
  
  // 如果当前日期在学期开始之前，返回第1周
  if (currentDate < semesterStartDate) {
    return 1;
  }
  
  // 计算两个日期之间的毫秒差
  const diffTime = currentDate.getTime() - semesterStartDate.getTime();
  // 转换为天数
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // 计算周数（向下取整加1，因为第1天就是第1周）
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  return weekNumber;
}

/**
 * 检查两个时间段是否重叠
 * @param start1 第一个开始时间
 * @param end1 第一个结束时间
 * @param start2 第二个开始时间
 * @param end2 第二个结束时间
 * @returns 是否重叠
 */
export function isTimeOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // 确保日期对象正确
  if (!(
    start1 instanceof Date && !isNaN(start1.getTime()) &&
    end1 instanceof Date && !isNaN(end1.getTime()) &&
    start2 instanceof Date && !isNaN(start2.getTime()) &&
    end2 instanceof Date && !isNaN(end2.getTime())
  )) {
    throw new Error('Invalid date parameters');
  }
  
  // 时间段重叠的条件：开始时间小于对方的结束时间，且结束时间大于对方的开始时间
  return start1 < end2 && end1 > start2;
}

/**
 * 计算重叠时间段
 * @param start1 第一个开始时间
 * @param end1 第一个结束时间
 * @param start2 第二个开始时间
 * @param end2 第二个结束时间
 * @returns 重叠时间段对象，如果不重叠则返回null
 */
export function calculateOverlapTime(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): { start: Date; end: Date } | null {
  if (!isTimeOverlapping(start1, end1, start2, end2)) {
    return null;
  }
  
  // 重叠开始时间是两个开始时间的最大值
  const overlapStart = start1 > start2 ? start1 : start2;
  // 重叠结束时间是两个结束时间的最小值
  const overlapEnd = end1 < end2 ? end1 : end2;
  
  return { start: overlapStart, end: overlapEnd };
}

/**
 * 获取默认设置配置
 * @returns 默认设置对象
 */
export function getDefaultSettings(): import('./types').Settings {
  return {
    activeSemesterId: '',
    theme: 'light',
    notifications: true,
    language: 'zh-CN',
    displayMode: 'grid',
    showWeekends: true,
    maxSections: 10
  };
}

/**
 * 获取支持的主题列表
 * @returns 主题名称数组
 */
export function getSupportedThemes(): string[] {
  return ['light', 'dark', 'system'];
}

/**
 * 获取支持的显示模式列表
 * @returns 显示模式数组
 */
export function getSupportedDisplayModes(): string[] {
  return ['grid', 'list', 'calendar'];
}

/**
 * 获取支持的语言列表
 * @returns 语言代码数组
 */
export function getSupportedLanguages(): string[] {
  return ['zh-CN', 'en-US'];
}