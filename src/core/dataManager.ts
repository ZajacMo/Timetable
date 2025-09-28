import { Course, Schedule, Semester, UserSettings, OverlapType, DateRange } from './types';
import type { StorageProvider, Assignment } from './types';

// 核心数据管理器
export class DataManager {
  private storageProvider: StorageProvider;
  private courses: Course[] = [];
  private schedules: Schedule[] = [];
  private assignments: Assignment[] = [];
  private semester: Semester | null = null;
  private settings: UserSettings | null = null;

  constructor(storageProvider: StorageProvider) {
    this.storageProvider = storageProvider;
    this.initializeData();
  }

  // 初始化数据
  private async initializeData(): Promise<void> {
    await this.loadAllData();
  }

  // 从存储加载所有数据
  private async loadAllData(): Promise<void> {
    this.courses = (await this.storageProvider.load<Course[]>('courses')) || [];
    this.schedules = (await this.storageProvider.load<Schedule[]>('schedules')) || [];
    this.assignments = (await this.storageProvider.load<Assignment[]>('assignments')) || [];
    this.semester = await this.storageProvider.load<Semester>('semester');
    this.settings = await this.storageProvider.load<UserSettings>('settings') || this.getDefaultSettings();
    
    // 计算当前周数
    if (this.semester) {
      this.semester.currentWeek = this.calculateCurrentWeek(this.semester.startDate);
    }
  }

  // 获取默认设置
  private getDefaultSettings(): UserSettings {
    return {
      theme: 'system',
      language: 'zh-CN',
      notificationEnabled: true,
      calendarSyncEnabled: true
    };
  }

  // 计算当前周数
  public calculateCurrentWeek(startDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  }

  // 保存所有数据到存储
  // private async saveAllData(): Promise<void> {
  //   await this.storageProvider.save('courses', this.courses);
  //   await this.storageProvider.save('schedules', this.schedules);
  //   if (this.semester) {
  //     await this.storageProvider.save('semester', this.semester);
  //   }
  //   if (this.settings) {
  //     await this.storageProvider.save('settings', this.settings);
  //   }
  // }

  // 课程管理方法

  // 获取所有课程
  public getCourses(): Course[] {
    return [...this.courses];
  }

  // 添加课程
  public async addCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const newCourse: Course = {
      ...course,
      id: this.generateId()
    };
    
    this.courses.push(newCourse);
    await this.storageProvider.save('courses', this.courses);
    
    // 如果设置了日历同步，自动创建日程
    if (this.settings?.calendarSyncEnabled) {
      await this.syncCourseToSchedule(newCourse);
    }
    
    return newCourse;
  }

  // 更新课程
  public async updateCourse(id: string, updatedCourse: Partial<Course>): Promise<Course | null> {
    const index = this.courses.findIndex(course => course.id === id);
    if (index === -1) {
      return null;
    }
    
    this.courses[index] = { ...this.courses[index], ...updatedCourse };
    await this.storageProvider.save('courses', this.courses);
    
    // 同步更新相关日程
    if (this.settings?.calendarSyncEnabled) {
      await this.updateCourseSchedule(this.courses[index]);
    }
    
    return this.courses[index];
  }

  // 删除课程
  public async deleteCourse(id: string): Promise<boolean> {
    const initialLength = this.courses.length;
    this.courses = this.courses.filter(course => course.id !== id);
    
    if (this.courses.length === initialLength) {
      return false;
    }
    
    await this.storageProvider.save('courses', this.courses);
    
    // 删除相关日程
    if (this.settings?.calendarSyncEnabled) {
      await this.deleteCourseSchedules(id);
    }
    
    return true;
  }

  // 日程管理方法

  // 获取所有日程
  public getSchedules(): Schedule[] {
    return [...this.schedules];
  }

  // 添加日程
  public async addSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    const newSchedule: Schedule = {
      ...schedule,
      id: this.generateId()
    };
    
    this.schedules.push(newSchedule);
    await this.storageProvider.save('schedules', this.schedules);
    
    return newSchedule;
  }

  // 作业管理方法
  
  // 获取所有作业
  public getAssignments(): Assignment[] {
    return [...this.assignments];
  }

  // 添加作业
  public async addAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment: Assignment = {
      ...assignment,
      id: this.generateId()
    };
    
    this.assignments.push(newAssignment);
    await this.storageProvider.save('assignments', this.assignments);
    
    return newAssignment;
  }

  // 更新作业
  public async updateAssignment(id: string, updatedAssignment: Partial<Assignment>): Promise<Assignment | null> {
    const index = this.assignments.findIndex(assignment => assignment.id === id);
    if (index === -1) {
      return null;
    }
    
    this.assignments[index] = { ...this.assignments[index], ...updatedAssignment };
    await this.storageProvider.save('assignments', this.assignments);
    
    return this.assignments[index];
  }

  // 删除作业
  public async deleteAssignment(id: string): Promise<boolean> {
    const initialLength = this.assignments.length;
    this.assignments = this.assignments.filter(assignment => assignment.id !== id);
    
    if (this.assignments.length === initialLength) {
      return false;
    }
    
    await this.storageProvider.save('assignments', this.assignments);
    return true;
  }

  // 根据课程ID获取作业
  public getAssignmentsByCourseId(courseId: string): Assignment[] {
    return this.assignments.filter(assignment => assignment.courseId === courseId);
  }

  // 获取即将截止的作业（7天内）
  public getUpcomingAssignments(days: number = 7): Assignment[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return this.assignments.filter(assignment => 
      assignment.status === 'pending' &&
      assignment.deadline >= now &&
      assignment.deadline <= futureDate
    );
  }

  // 更新日程
  public async updateSchedule(id: string, updatedSchedule: Partial<Schedule>): Promise<Schedule | null> {
    const index = this.schedules.findIndex(schedule => schedule.id === id);
    if (index === -1) {
      return null;
    }
    
    this.schedules[index] = { ...this.schedules[index], ...updatedSchedule };
    await this.storageProvider.save('schedules', this.schedules);
    
    return this.schedules[index];
  }

  // 删除日程
  public async deleteSchedule(id: string): Promise<boolean> {
    const initialLength = this.schedules.length;
    this.schedules = this.schedules.filter(schedule => schedule.id !== id);
    
    if (this.schedules.length === initialLength) {
      return false;
    }
    
    await this.storageProvider.save('schedules', this.schedules);
    return true;
  }

  // 学期管理方法

  // 获取学期信息
  public getSemester(): Semester | null {
    return this.semester ? { ...this.semester } : null;
  }

  // 设置学期信息
  public async setSemester(semester: Omit<Semester, 'id'>): Promise<Semester> {
    const newSemester: Semester = {
      ...semester,
      id: this.generateId(),
      currentWeek: this.calculateCurrentWeek(semester.startDate)
    };
    
    this.semester = newSemester;
    await this.storageProvider.save('semester', this.semester);
    
    return newSemester;
  }

  // 更新学期信息
  public async updateSemester(updatedSemester: Partial<Semester>): Promise<Semester | null> {
    if (!this.semester) {
      return null;
    }
    
    this.semester = { ...this.semester, ...updatedSemester };
    
    // 重新计算当前周数
    if (updatedSemester.startDate) {
      this.semester.currentWeek = this.calculateCurrentWeek(updatedSemester.startDate);
    }
    
    await this.storageProvider.save('semester', this.semester);
    return this.semester;
  }

  // 设置管理方法

  // 获取用户设置
  public getSettings(): UserSettings {
    return { ...this.settings! };
  }

  // 更新用户设置
  public async updateSettings(updatedSettings: Partial<UserSettings>): Promise<UserSettings> {
    this.settings = { ...this.settings!, ...updatedSettings };
    await this.storageProvider.save('settings', this.settings);
    return this.settings;
  }

  // 课程与日程同步方法

  // 将课程同步到日程
  private async syncCourseToSchedule(course: Course): Promise<void> {
    // 删除旧的相关日程
    await this.deleteCourseSchedules(course.id);
    
    // 创建新课程日程
    if (this.semester) {
      for (let week = course.startWeek; week <= course.endWeek; week++) {
        const courseDate = this.getDateByWeekAndDay(this.semester.startDate, week, course.dayOfWeek);
        const startTime = this.getDateTimeBySection(courseDate, course.startSection);
        const endTime = this.getDateTimeBySection(courseDate, course.endSection);
        
        // 使用location字段而不是classroom字段，保持与renderer.js一致
        await this.addSchedule({
          title: course.name,
          description: course.teacher ? `${course.teacher}${course.location ? `@${course.location}` : ''}` : course.location || '',
          startTime,
          endTime,
          color: course.color,
          isCourseRelated: true,
          courseId: course.id
        });
      }
    }
  }

  // 更新课程相关日程
  private async updateCourseSchedule(course: Course): Promise<void> {
    await this.syncCourseToSchedule(course);
  }

  // 删除课程相关日程
  private async deleteCourseSchedules(courseId: string): Promise<void> {
    const courseSchedules = this.schedules.filter(schedule => schedule.courseId === courseId);
    for (const schedule of courseSchedules) {
      await this.deleteSchedule(schedule.id);
    }
  }

  // 日期工具方法

  // 根据周数和星期几获取日期
  private getDateByWeekAndDay(startDate: Date, week: number, dayOfWeek: number): Date {
    const startDayOfWeek = startDate.getDay() || 7; // 将周日(0)转换为7
    const diffDays = (week - 1) * 7 + (dayOfWeek - startDayOfWeek);
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + diffDays);
    return targetDate;
  }

  // 根据节次获取具体时间（这里假设每节课45分钟，课间休息10分钟）
  private getDateTimeBySection(date: Date, section: number): Date {
    const baseHour = 8;
    const baseMinute = 0;
    const classDuration = 45;
    const breakDuration = 10;
    
    const totalMinutes = (section - 1) * (classDuration + breakDuration);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const result = new Date(date);
    result.setHours(baseHour + hours);
    result.setMinutes(baseMinute + minutes);
    result.setSeconds(0);
    result.setMilliseconds(0);
    
    return result;
  }

  // 重叠检测方法

  // 检测两个日期范围是否重叠
  private isDateRangeOverlap(range1: DateRange, range2: DateRange): boolean {
    return range1.start < range2.end && range2.start < range1.end;
  }

  // 检测日程重叠
  public checkScheduleOverlap(schedule: Schedule): OverlapType {
    const scheduleRange = { start: schedule.startTime, end: schedule.endTime };
    
    // 检查与其他日程的重叠
    for (const existingSchedule of this.schedules) {
      if (existingSchedule.id === schedule.id) continue;
      
      const existingRange = { start: existingSchedule.startTime, end: existingSchedule.endTime };
      if (this.isDateRangeOverlap(scheduleRange, existingRange)) {
        if (existingSchedule.isCourseRelated && schedule.isCourseRelated) {
          return OverlapType.COURSE_COURSE;
        } else if (existingSchedule.isCourseRelated || schedule.isCourseRelated) {
          return OverlapType.COURSE_SCHEDULE;
        } else {
          return OverlapType.SCHEDULE_SCHEDULE;
        }
      }
    }
    
    return OverlapType.NO_OVERLAP;
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 获取指定日期范围内的课程
  public getCoursesInDateRange(startDate: Date, endDate: Date): Course[] {
    if (!this.semester) {
      return [];
    }
    
    const startWeek = this.calculateCurrentWeek(startDate);
    const endWeek = this.calculateCurrentWeek(endDate);
    
    return this.courses.filter(course => 
      course.startWeek <= endWeek && 
      course.endWeek >= startWeek
    );
  }

  // 获取指定日期范围内的日程
  public getSchedulesInDateRange(startDate: Date, endDate: Date): Schedule[] {
    return this.schedules.filter(schedule => 
      schedule.startTime >= startDate && 
      schedule.endTime <= endDate
    );
  }

  // 获取当前周的课程
  public getCurrentWeekCourses(): Course[] {
    if (!this.semester?.currentWeek) {
      return [];
    }
    
    const currentWeek = this.semester.currentWeek;
    return this.courses.filter(course => 
      currentWeek >= course.startWeek && 
      currentWeek <= course.endWeek
    );
  }

  // 清空所有数据
  public async clearAllData(): Promise<void> {
    await this.storageProvider.clear();
    this.courses = [];
    this.schedules = [];
    this.assignments = [];
    this.semester = null;
    this.settings = this.getDefaultSettings();
  }
}

// 创建默认的数据管理器实例（需要传入具体的存储提供者）
export function createDataManager(storageProvider: StorageProvider): DataManager {
  return new DataManager(storageProvider);
}