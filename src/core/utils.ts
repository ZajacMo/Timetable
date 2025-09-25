// 日期工具函数

// 格式化日期为YYYY-MM-DD格式
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化时间为HH:mm格式
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 格式化日期时间为YYYY-MM-DD HH:mm格式
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// 解析日期字符串YYYY-MM-DD为Date对象
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 解析日期时间字符串YYYY-MM-DD HH:mm为Date对象
export function parseDateTime(dateTimeString: string): Date {
  const [datePart, timePart] = dateTimeString.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

// 获取两个日期之间的天数
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 获取指定日期是星期几（1-7表示周一到周日）
export function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day; // 将周日(0)转换为7
}

// 获取星期几的中文表示
export function getDayOfWeekChinese(dayOfWeek: number): string {
  const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days[dayOfWeek] || '';
}

// 获取星期几的英文表示
export function getDayOfWeekEnglish(dayOfWeek: number): string {
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayOfWeek] || '';
}

// 获取指定月份的第一天
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 获取指定月份的最后一天
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// 颜色工具函数

// 生成颜色方案（从预定义的颜色列表中选择）
export function generateColor(index: number): string {
  const colors = [
    '#f05261', '#48a8e4', '#ffd061', '#52db9a', '#70d3e6',
    '#3f51b5', '#f3d147', '#4adbc3', '#673ab7', '#f3db49',
    '#76bfcd', '#b495e1', '#ff9800', '#8bc34a', '#e91e63'
  ];
  return colors[index % colors.length];
}

// 根据字符串生成一致的颜色
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

// 检查颜色是否为深色（用于确定文本颜色）
export function isDarkColor(hexColor: string): boolean {
  // 移除#号
  hexColor = hexColor.replace('#', '');
  
  // 解析RGB值
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // 计算亮度（YIQ公式）
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // 亮度小于128的为深色
  return brightness < 128;
}

// 获取文本颜色（根据背景颜色自动选择黑白）
export function getTextColor(backgroundColor: string): string {
  return isDarkColor(backgroundColor) ? '#ffffff' : '#000000';
}

// 数组工具函数

// 按指定键对数组进行分组
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// 从数组中根据ID查找项
export function findById<T extends { id: string }>(array: T[], id: string): T | undefined {
  return array.find(item => item.id === id);
}

// 从数组中根据ID删除项
export function removeById<T extends { id: string }>(array: T[], id: string): T[] {
  return array.filter(item => item.id !== id);
}

// 对象工具函数

// 深度复制对象
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const clonedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone((obj as any)[key]);
    }
  }
  
  return clonedObj;
}

// 合并两个对象，保留非空值
export function mergeObjects<T extends object>(target: T, source: Partial<T>): T {
  const result: any = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key) && (source as any)[key] !== undefined && (source as any)[key] !== null) {
      result[key] = (source as any)[key];
    }
  }
  
  return result as T;
}

// 验证工具函数

// 验证课程数据
export function validateCourseData(courseData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!courseData.name || typeof courseData.name !== 'string' || courseData.name.trim() === '') {
    errors.push('课程名称不能为空');
  }
  
  if (!courseData.startWeek || typeof courseData.startWeek !== 'number' || courseData.startWeek < 1) {
    errors.push('开始周数必须为大于0的数字');
  }
  
  if (!courseData.endWeek || typeof courseData.endWeek !== 'number' || courseData.endWeek < courseData.startWeek) {
    errors.push('结束周数必须大于或等于开始周数');
  }
  
  if (!courseData.dayOfWeek || typeof courseData.dayOfWeek !== 'number' || courseData.dayOfWeek < 1 || courseData.dayOfWeek > 7) {
    errors.push('星期几必须为1-7之间的数字');
  }
  
  if (!courseData.startSection || typeof courseData.startSection !== 'number' || courseData.startSection < 1) {
    errors.push('开始节次必须为大于0的数字');
  }
  
  if (!courseData.endSection || typeof courseData.endSection !== 'number' || courseData.endSection < courseData.startSection) {
    errors.push('结束节次必须大于或等于开始节次');
  }
  
  return { isValid: errors.length === 0, errors };
}

// 验证日程数据
export function validateScheduleData(scheduleData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!scheduleData.title || typeof scheduleData.title !== 'string' || scheduleData.title.trim() === '') {
    errors.push('日程标题不能为空');
  }
  
  if (!scheduleData.startTime || !(scheduleData.startTime instanceof Date)) {
    errors.push('开始时间必须为有效的日期对象');
  }
  
  if (!scheduleData.endTime || !(scheduleData.endTime instanceof Date)) {
    errors.push('结束时间必须为有效的日期对象');
  }
  
  if (scheduleData.startTime && scheduleData.endTime && scheduleData.startTime >= scheduleData.endTime) {
    errors.push('开始时间必须早于结束时间');
  }
  
  return { isValid: errors.length === 0, errors };
}

// 验证学期数据
export function validateSemesterData(semesterData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!semesterData.name || typeof semesterData.name !== 'string' || semesterData.name.trim() === '') {
    errors.push('学期名称不能为空');
  }
  
  if (!semesterData.startDate || !(semesterData.startDate instanceof Date)) {
    errors.push('开始日期必须为有效的日期对象');
  }
  
  if (!semesterData.totalWeeks || typeof semesterData.totalWeeks !== 'number' || semesterData.totalWeeks < 1) {
    errors.push('总周数必须为大于0的数字');
  }
  
  return { isValid: errors.length === 0, errors };
}

// 其他工具函数

// 生成唯一标识符
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 延迟执行函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}