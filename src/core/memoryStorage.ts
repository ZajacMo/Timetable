import { StorageProvider, Course, Schedule, Semester, Settings } from './types';

/**
 * 内存存储实现类
 * 用于在内存中存储和管理数据
 * 适用于开发环境或作为默认存储提供者
 */
export class MemoryStorage implements StorageProvider {
  private courses: Course[] = [];
  private schedules: Schedule[] = [];
  private semesters: Semester[] = [];
  private settings: Settings = {
    activeSemesterId: '',
    theme: 'light',
    notifications: true,
    language: 'zh-CN'
  };
  
  // 内部存储对象用于实现StorageProvider接口
  private storage: Record<string, any> = {};

  /**
   * 初始化存储
   * @returns Promise<void>
   */
  async init(): Promise<void> {
    // 内存存储无需额外初始化
    console.log('Memory storage initialized');
  }
  
  // StorageProvider接口方法实现
  async save<T>(key: string, data: T): Promise<boolean> {
    try {
      this.storage[key] = JSON.stringify(data);
      return true;
    } catch (error) {
      console.error(`Error saving data with key ${key}:`, error);
      return false;
    }
  }
  
  async load<T>(key: string): Promise<T | null> {
    try {
      if (key in this.storage) {
        return JSON.parse(this.storage[key]) as T;
      }
      return null;
    } catch (error) {
      console.error(`Error loading data with key ${key}:`, error);
      return null;
    }
  }
  
  async remove(key: string): Promise<boolean> {
    try {
      if (key in this.storage) {
        delete this.storage[key];
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error removing data with key ${key}:`, error);
      return false;
    }
  }
  
  async clear(): Promise<boolean> {
    try {
      this.storage = {};
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // 课程相关方法

  /**
   * 获取所有课程
   * @returns Promise<Course[]>
   */
  async getAllCourses(): Promise<Course[]> {
    return [...this.courses]; // 返回副本以避免直接修改
  }

  /**
   * 根据ID获取课程
   * @param id 课程ID
   * @returns Promise<Course | undefined>
   */
  async getCourseById(id: string): Promise<Course | undefined> {
    return this.courses.find(course => course.id === id);
  }

  /**
   * 添加课程
   * @param course 课程对象
   * @returns Promise<Course>
   */
  async addCourse(course: Course): Promise<Course> {
    // 检查是否已存在相同ID的课程
    if (this.courses.some(c => c.id === course.id)) {
      throw new Error(`Course with id ${course.id} already exists`);
    }
    this.courses.push(course);
    return course;
  }

  /**
   * 更新课程
   * @param course 更新后的课程对象
   * @returns Promise<Course>
   */
  async updateCourse(course: Course): Promise<Course> {
    const index = this.courses.findIndex(c => c.id === course.id);
    if (index === -1) {
      throw new Error(`Course with id ${course.id} not found`);
    }
    this.courses[index] = course;
    return course;
  }

  /**
   * 删除课程
   * @param id 课程ID
   * @returns Promise<boolean>
   */
  async deleteCourse(id: string): Promise<boolean> {
    const initialLength = this.courses.length;
    this.courses = this.courses.filter(course => course.id !== id);
    return this.courses.length < initialLength;
  }

  /**
   * 批量添加课程
   * @param courses 课程数组
   * @returns Promise<Course[]>
   */
  async addCourses(courses: Course[]): Promise<Course[]> {
    courses.forEach(course => {
      if (this.courses.some(c => c.id === course.id)) {
        throw new Error(`Course with id ${course.id} already exists`);
      }
    });
    this.courses.push(...courses);
    return courses;
  }

  // 日程相关方法

  /**
   * 获取所有日程
   * @returns Promise<Schedule[]>
   */
  async getAllSchedules(): Promise<Schedule[]> {
    return [...this.schedules]; // 返回副本以避免直接修改
  }

  /**
   * 根据ID获取日程
   * @param id 日程ID
   * @returns Promise<Schedule | undefined>
   */
  async getScheduleById(id: string): Promise<Schedule | undefined> {
    return this.schedules.find(schedule => schedule.id === id);
  }

  /**
   * 添加日程
   * @param schedule 日程对象
   * @returns Promise<Schedule>
   */
  async addSchedule(schedule: Schedule): Promise<Schedule> {
    // 检查是否已存在相同ID的日程
    if (this.schedules.some(s => s.id === schedule.id)) {
      throw new Error(`Schedule with id ${schedule.id} already exists`);
    }
    this.schedules.push(schedule);
    return schedule;
  }

  /**
   * 更新日程
   * @param schedule 更新后的日程对象
   * @returns Promise<Schedule>
   */
  async updateSchedule(schedule: Schedule): Promise<Schedule> {
    const index = this.schedules.findIndex(s => s.id === schedule.id);
    if (index === -1) {
      throw new Error(`Schedule with id ${schedule.id} not found`);
    }
    this.schedules[index] = schedule;
    return schedule;
  }

  /**
   * 删除日程
   * @param id 日程ID
   * @returns Promise<boolean>
   */
  async deleteSchedule(id: string): Promise<boolean> {
    const initialLength = this.schedules.length;
    this.schedules = this.schedules.filter(schedule => schedule.id !== id);
    return this.schedules.length < initialLength;
  }

  /**
   * 批量添加日程
   * @param schedules 日程数组
   * @returns Promise<Schedule[]>
   */
  async addSchedules(schedules: Schedule[]): Promise<Schedule[]> {
    schedules.forEach(schedule => {
      if (this.schedules.some(s => s.id === schedule.id)) {
        throw new Error(`Schedule with id ${schedule.id} already exists`);
      }
    });
    this.schedules.push(...schedules);
    return schedules;
  }

  // 学期相关方法

  /**
   * 获取所有学期
   * @returns Promise<Semester[]>
   */
  async getAllSemesters(): Promise<Semester[]> {
    return [...this.semesters]; // 返回副本以避免直接修改
  }

  /**
   * 根据ID获取学期
   * @param id 学期ID
   * @returns Promise<Semester | undefined>
   */
  async getSemesterById(id: string): Promise<Semester | undefined> {
    return this.semesters.find(semester => semester.id === id);
  }

  /**
   * 添加学期
   * @param semester 学期对象
   * @returns Promise<Semester>
   */
  async addSemester(semester: Semester): Promise<Semester> {
    // 检查是否已存在相同ID的学期
    if (this.semesters.some(s => s.id === semester.id)) {
      throw new Error(`Semester with id ${semester.id} already exists`);
    }
    this.semesters.push(semester);
    return semester;
  }

  /**
   * 更新学期
   * @param semester 更新后的学期对象
   * @returns Promise<Semester>
   */
  async updateSemester(semester: Semester): Promise<Semester> {
    const index = this.semesters.findIndex(s => s.id === semester.id);
    if (index === -1) {
      throw new Error(`Semester with id ${semester.id} not found`);
    }
    this.semesters[index] = semester;
    return semester;
  }

  /**
   * 删除学期
   * @param id 学期ID
   * @returns Promise<boolean>
   */
  async deleteSemester(id: string): Promise<boolean> {
    const initialLength = this.semesters.length;
    this.semesters = this.semesters.filter(semester => semester.id !== id);
    return this.semesters.length < initialLength;
  }

  // 设置相关方法

  /**
   * 获取设置
   * @returns Promise<Settings>
   */
  async getSettings(): Promise<Settings> {
    return { ...this.settings }; // 返回副本以避免直接修改
  }

  /**
   * 更新设置
   * @param settings 更新后的设置对象
   * @returns Promise<Settings>
   */
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...settings };
    return this.getSettings();
  }

  // 导出和导入方法

  /**
   * 导出所有数据
   * @returns Promise<object>
   */
  async exportAllData(): Promise<object> {
    return {
      courses: this.courses,
      schedules: this.schedules,
      semesters: this.semesters,
      settings: this.settings
    };
  }

  /**
   * 导入数据
   * @param data 要导入的数据对象
   * @returns Promise<boolean>
   */
  async importData(data: any): Promise<boolean> {
    try {
      if (data.courses && Array.isArray(data.courses)) {
        this.courses = data.courses;
      }
      if (data.schedules && Array.isArray(data.schedules)) {
        this.schedules = data.schedules;
      }
      if (data.semesters && Array.isArray(data.semesters)) {
        this.semesters = data.semesters;
      }
      if (data.settings && typeof data.settings === 'object') {
        this.settings = data.settings;
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * 清除所有数据
   * @returns Promise<boolean>
   */
  async clearAllData(): Promise<boolean> {
    this.courses = [];
    this.schedules = [];
    this.semesters = [];
    this.settings = {
      activeSemesterId: '',
      theme: 'light',
      notifications: true,
      language: 'zh-CN'
    };
    return true;
  }

  /**
   * 获取存储状态
   * @returns Promise<{ isReady: boolean; dataCount: { courses: number; schedules: number; semesters: number } }>
   */
  async getStorageStatus(): Promise<{
    isReady: boolean;
    dataCount: { courses: number; schedules: number; semesters: number };
  }> {
    return {
      isReady: true,
      dataCount: {
        courses: this.courses.length,
        schedules: this.schedules.length,
        semesters: this.semesters.length
      }
    };
  }
}