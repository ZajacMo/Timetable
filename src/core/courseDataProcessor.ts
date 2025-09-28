import type { Course } from '../types/course';
import type { HolidayCourseAdjustment } from '../stores/settings';
import type { DataManager } from './dataManager';
import type { Assignment } from './types';

// 扩展的课程接口，包含作业信息
interface CourseWithAssignments extends Course {
  assignments?: Assignment[];
}

// 课程数据处理类
export class CourseDataProcessor {
  // 解析课程时间，转换为开始和结束节次
  static parseCourseTime(jc: string): { startSection: number; endSection: number } {
    const match = jc.match(/(\d+)-(\d+)节/);
    if (match) {
      return {
        startSection: parseInt(match[1]),
        endSection: parseInt(match[2])
      };
    }
    return { startSection: 1, endSection: 1 };
  }

  // 检查课程是否在指定的周次
  static isCourseInWeek(zcd: string, week: number): boolean {
    // 简单实现，实际应该解析各种周次格式
    if (zcd.includes('全周')) {
      return true;
    }

    // 检查是否包含通用的1-18周格式
    if (zcd.includes('1-18周')) {
      return true;
    }

    // 分割字符串以处理多个周次范围（如 "1-8周,11-18周"）
    const weekRanges = zcd.split(',');

    // 检查每个周次范围
    for (const range of weekRanges) {
      // 检查范围是否匹配 "数字-数字周" 格式
      const weekRangeMatch = range.match(/(\d+)-(\d+)周/);
      if (weekRangeMatch) {
        const startWeek = parseInt(weekRangeMatch[1]);
        const endWeek = parseInt(weekRangeMatch[2]);
        if (week >= startWeek && week <= endWeek) {
          return true;
        }
      }

      // 检查范围是否匹配 "单周" 格式
      if (range.includes(`${week}周`)) {
        return true;
      }
    }

    return false;
  }

  // 检查课程是否在指定的原始周次（用于节假日调整）
  static isCourseInOriginalWeek(zcd: string, week: number): boolean {
    return this.isCourseInWeek(zcd, week);
  }

  // 为不同课程生成不同颜色的函数
  static generateCourseColor(courseName: string, teacher: string): string {
    // 使用课程名称和教师姓名生成一个伪随机数
    let hash = 0;
    const str = courseName + teacher;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }

    // 预定义的课程颜色列表
    const colors = [
      '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
      '#722ED1', '#13C2C2', '#FAAD14', '#F7BA1E', '#EB2F96'
    ];

    // 根据哈希值选择颜色
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  }

  // 应用节假日课程调整
  static applyHolidayAdjustments(
    courses: Course[], 
    adjustments: HolidayCourseAdjustment[], 
    currentWeek: number, 
    processedCourses: any[]
  ): Course[] {
    const adjustedCourses: Course[] = [...courses];

    // 检查是否有需要从其他周调整过来的课程
    adjustments.forEach((adjustment: HolidayCourseAdjustment) => {
      // 如果目标周次是当前周，需要将原周次的课程复制到当前周
      if (adjustment.targetWeek === currentWeek) {
        // 遍历所有课程，找到符合条件的课程
        processedCourses.forEach((course: any) => {
          course.courseSchedules.forEach((schedule: any) => {
            // 检查课程是否在原始周次
            if (this.isCourseInOriginalWeek(schedule.zcd, adjustment.originalWeek)) {
              // 检查课程是否在原始星期几
              if (parseInt(schedule.xqj) === adjustment.originalDay) {
                // 解析课程时间
                const { startSection, endSection } = this.parseCourseTime(schedule.jc);
                
                // 为课程生成颜色
                const color = this.generateCourseColor(course.kcmc, course.xm);
                
                // 创建调整后的课程对象
                adjustedCourses.push({
                  id: `${course.kch}-adjusted-${adjustment.id}`, // 使用不同的ID避免冲突
                  name: course.kcmc, // 课程名称
                  teacher: course.xm, // 教师
                  classroom: schedule.cdmc, // 教室
                  dayOfWeek: adjustment.targetDay, // 使用目标星期几
                  startSection, // 开始节次
                  endSection, // 结束节次
                  weekType: 'all', // 设置为全部
                  color, // 添加颜色属性
                  xqj: adjustment.targetDay.toString(), // 添加星期几的原始值
                  jc: schedule.jc, // 添加节次的原始值
                  startWeek: currentWeek, // 设置开始周为当前周
                  endWeek: currentWeek, // 设置结束周为当前周
                  isAdjusted: true, // 标记为调整后的课程
                  adjustmentReason: adjustment.reason // 调整原因
                });
              }
            }
          });
        });
      }
    });
    
    // 移除需要调整到其他周的课程
    return adjustedCourses.filter(course => {
      // 检查当前课程是否需要调整到其他周
      const shouldBeRemoved = adjustments.some((adjustment: HolidayCourseAdjustment) => {
        return adjustment.originalWeek === currentWeek && 
               adjustment.originalDay === course.dayOfWeek &&
               !course.isAdjusted; // 避免移除已经调整过的课程
      });
      return !shouldBeRemoved;
    });
  }

  // 根据日期获取课程
  static getCoursesForDate(
    courses: Course[], 
    date: Date, 
    weekNumber: number
  ): CourseWithAssignments[] {
    const targetDayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // 转换为1-7的范围（周一到周日）
    
    // 筛选当天的课程
    const dayCourses = courses.filter(course => 
      course.dayOfWeek === targetDayOfWeek &&
      weekNumber >= course.startWeek &&
      weekNumber <= course.endWeek
    );
    
    return dayCourses.map(course => ({ ...course }));
  }

  // 获取课程开始时间
  static getCourseStartTime(course: Course, date: Date = new Date()): Date {
    const time = new Date(date);
    time.setHours(0, 0, 0, 0);
    
    // 假设课程节次与时间的对应关系
    const sectionToTime: { [key: number]: number } = {
      1: 8,    // 第1节 8:00
      2: 9,    // 第2节 9:00
      3: 10,   // 第3节 10:00
      4: 11,   // 第4节 11:00
      5: 13,   // 第5节 13:00
      6: 14,   // 第6节 14:00
      7: 15,   // 第7节 15:00
      8: 16,   // 第8节 16:00
      9: 18,   // 第9节 18:00
      10: 19,  // 第10节 19:00
      11: 20   // 第11节 20:00
    };
    
    const startHour = sectionToTime[course.startSection || 1] || 8;
    time.setHours(startHour, 0, 0, 0);
    
    return time;
  }

  // 获取课程结束时间
  static getCourseEndTime(course: Course, date: Date = new Date()): Date {
    const time = new Date(date);
    time.setHours(0, 0, 0, 0);
    
    // 假设课程节次与时间的对应关系
    const sectionToTime: { [key: number]: number } = {
      1: 9,    // 第1节结束 9:00
      2: 10,   // 第2节结束 10:00
      3: 11,   // 第3节结束 11:00
      4: 12,   // 第4节结束 12:00
      5: 14,   // 第5节结束 14:00
      6: 15,   // 第6节结束 15:00
      7: 16,   // 第7节结束 16:00
      8: 17,   // 第8节结束 17:00
      9: 19,   // 第9节结束 19:00
      10: 20,  // 第10节结束 20:00
      11: 21   // 第11节结束 21:00
    };
    
    const endHour = sectionToTime[course.endSection || 1] || 9;
    time.setHours(endHour, 0, 0, 0);
    
    return time;
  }

  // =======================
  // 作业功能扩展接口
  // =======================
  
  // 创建作业
  static createAssignment(
    courseId: string,
    content: string,
    deadline: Date
  ): Assignment {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      courseId,
      content,
      deadline,
      status: 'pending'
    };
  }
  
  // 获取课程的作业
  static getAssignmentsForCourse(
    assignments: Assignment[],
    courseId: string,
    status?: 'pending' | 'submitted' | 'late'
  ): Assignment[] {
    let result = assignments.filter(assignment => assignment.courseId === courseId);
    
    if (status) {
      result = result.filter(assignment => assignment.status === status);
    }
    
    return result;
  }
  
  // 更新作业状态
  static updateAssignmentStatus(
    assignments: Assignment[],
    assignmentId: string,
    status: 'pending' | 'submitted' | 'late'
  ): Assignment | null {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      assignment.status = status;
      return assignment;
    }
    return null;
  }
  
  // 获取截止日期即将到来的作业（7天内）
  static getUpcomingAssignments(
    assignments: Assignment[],
    days: number = 7
  ): Assignment[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return assignments.filter(assignment => 
      assignment.status === 'pending' &&
      assignment.deadline >= now &&
      assignment.deadline <= futureDate
    );
  }

  // 获取过期的作业
  static getOverdueAssignments(assignments: Assignment[]): Assignment[] {
    const now = new Date();
    
    return assignments.filter(assignment => 
      assignment.status === 'pending' &&
      assignment.deadline < now
    );
  }

  // 根据状态获取作业
  static getAssignmentsByStatus(
    assignments: Assignment[],
    status: 'pending' | 'submitted' | 'late'
  ): Assignment[] {
    return assignments.filter(assignment => assignment.status === status);
  }

  // 为课程添加作业（需要DataManager实例）
  static async addAssignmentToCourse(
    dataManager: DataManager,
    courseId: string,
    content: string,
    deadline: Date
  ): Promise<Assignment> {
    const assignment = this.createAssignment(courseId, content, deadline);
    return await dataManager.addAssignment(assignment);
  }

  // 批量更新作业状态
  static async batchUpdateAssignmentStatus(
    dataManager: DataManager,
    assignmentIds: string[],
    status: 'pending' | 'submitted' | 'late'
  ): Promise<Assignment[]> {
    const updatedAssignments: Assignment[] = [];
    
    for (const assignmentId of assignmentIds) {
      const updatedAssignment = await dataManager.updateAssignment(assignmentId, { status });
      if (updatedAssignment) {
        updatedAssignments.push(updatedAssignment);
      }
    }
    
    return updatedAssignments;
  }

  // 删除课程的所有作业
  static async deleteAssignmentsByCourseId(
    dataManager: DataManager,
    courseId: string
  ): Promise<boolean> {
    const courseAssignments = dataManager.getAssignmentsByCourseId(courseId);
    let success = true;
    
    for (const assignment of courseAssignments) {
      const result = await dataManager.deleteAssignment(assignment.id);
      if (!result) success = false;
    }
    
    return success;
  }

  // 格式化作业截止日期
  static formatAssignmentDeadline(deadline: Date): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // 如果是今天
    if (deadline.toDateString() === now.toDateString()) {
      return `今天 ${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}`;
    }
    // 如果是明天
    else if (deadline.toDateString() === tomorrow.toDateString()) {
      return `明天 ${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}`;
    }
    // 如果是昨天
    else if (deadline.toDateString() === yesterday.toDateString()) {
      return `昨天 ${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}`;
    }
    // 其他情况
    else {
      return `${deadline.getFullYear()}-${(deadline.getMonth() + 1).toString().padStart(2, '0')}-${deadline.getDate().toString().padStart(2, '0')} ${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  // 获取作业状态的显示文本
  static getAssignmentStatusText(status: 'pending' | 'submitted' | 'late'): string {
    const statusMap = {
      'pending': '待提交',
      'submitted': '已提交',
      'late': '已逾期'
    };
    
    return statusMap[status];
  }

  // 获取作业状态的样式类名
  static getAssignmentStatusClass(status: 'pending' | 'submitted' | 'late'): string {
    const classMap = {
      'pending': 'status-pending',
      'submitted': 'status-submitted',
      'late': 'status-late'
    };
    
    return classMap[status];
  }
}