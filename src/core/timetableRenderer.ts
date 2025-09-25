import { Course, Semester } from './types';
import { generateColor, getDayOfWeekChinese, groupBy } from './utils';

/**
 * 课程表渲染器类
 * 负责处理课程表的UI渲染逻辑
 * 包括合并单元格、处理重叠等功能
 */
export class TimetableRenderer {
  private dayNames: string[] = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  private sectionNames: string[] = ['', '第1节', '第2节', '第3节', '第4节', '第5节', '第6节', '第7节', '第8节', '第9节', '第10节'];

  /**
   * 设置星期名称
   * @param names 星期名称数组
   */
  setDayNames(names: string[]): void {
    if (names.length >= 8) {
      this.dayNames = names;
    }
  }

  /**
   * 设置节次名称
   * @param names 节次名称数组
   */
  setSectionNames(names: string[]): void {
    if (names.length >= 1) {
      this.sectionNames = names;
    }
  }

  /**
   * 生成课程表数据结构
   * @param courses 课程数组
   * @param currentWeek 当前周数
   * @returns 格式化后的课程表数据
   */
  generateTimetableData(courses: Course[], currentWeek: number): TimetableData {
    // 按星期几对课程进行分组
    const coursesByDay = groupBy(courses, 'dayOfWeek');
    
    const timetableData: TimetableData = {
      currentWeek,
      days: [],
      sections: this.sectionNames.slice(1),
      hasOverlaps: false
    };

    // 初始化每一天的数据
    for (let day = 1; day <= 7; day++) {
      const dayCourses = coursesByDay[day.toString()] || [];
      
      // 筛选当前周应该显示的课程
      const weekCourses = dayCourses.filter(course => {
        // 检查是否在当前周范围内
        if (currentWeek < course.startWeek || currentWeek > course.endWeek) {
          return false;
        }
        
        // 检查单双周设置
        if (course.weekType === 'odd' && currentWeek % 2 === 0) {
          return false;
        }
        if (course.weekType === 'even' && currentWeek % 2 !== 0) {
          return false;
        }
        
        return true;
      });

      const dayData: DayData = {
        name: this.dayNames[day],
        dayOfWeek: day,
        courses: []
      };

      // 处理课程重叠和合并
      if (weekCourses.length > 0) {
        // 按开始节次排序
        const sortedCourses = [...weekCourses].sort((a, b) => a.startSection - b.startSection);
        
        // 检查重叠
        const overlaps = this.detectOverlaps(sortedCourses);
        if (overlaps.length > 0) {
          timetableData.hasOverlaps = true;
        }

        // 计算每个课程的位置和跨度
        dayData.courses = this.calculateCoursePositions(sortedCourses, overlaps);
      }

      timetableData.days.push(dayData);
    }

    return timetableData;
  }

  /**
   * 检测课程重叠
   * @param courses 课程数组
   * @returns 重叠信息数组
   */
  private detectOverlaps(courses: Course[]): OverlapInfo[] {
    const overlaps: OverlapInfo[] = [];

    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const courseA = courses[i];
        const courseB = courses[j];

        // 检查两个课程是否在时间上重叠
        if (courseA.startSection < courseB.endSection && courseA.endSection > courseB.startSection) {
          overlaps.push({
            courseId1: courseA.id,
            courseId2: courseB.id,
            startSection: Math.max(courseA.startSection, courseB.startSection),
            endSection: Math.min(courseA.endSection, courseB.endSection)
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * 计算课程在表格中的位置
   * @param courses 课程数组
   * @param overlaps 重叠信息数组
   * @returns 格式化后的课程数据数组
   */
  private calculateCoursePositions(courses: Course[], overlaps: OverlapInfo[]): PositionedCourse[] {
    // 为每个课程分配列位置
    const columnMap = new Map<string, number>();
    const positionedCourses: PositionedCourse[] = [];

    courses.forEach((course, index) => {
      // 生成课程颜色
      const color = course.color || generateColor(index);
      
      // 查找当前课程与之前课程的重叠情况，确定列位置
      let column = 0;
      let placed = false;
      
      while (!placed) {
        placed = true;
        
        // 检查当前列是否与已放置的课程冲突
        for (const [placedCourseId, placedColumn] of columnMap.entries()) {
          if (placedColumn === column) {
            const placedCourse = courses.find(c => c.id === placedCourseId);
            if (placedCourse && this.doCoursesOverlap(course, placedCourse)) {
              placed = false;
              column++;
              break;
            }
          }
        }
      }

      columnMap.set(course.id, column);

      // 计算该列的总宽度份额
      let columnSpan = 1;
      const coursesInColumn = Array.from(columnMap.entries())
        .filter(([_, col]) => col === column)
        .map(([id]) => courses.find(c => c.id === id))
        .filter(Boolean) as Course[];

      // 查找在当前课程时间段内该列有多少课程
      const overlappingInColumn = coursesInColumn.filter(c => 
        c.startSection < course.endSection && c.endSection > course.startSection
      );

      if (overlappingInColumn.length > 0) {
        columnSpan = 1 / overlappingInColumn.length;
      }

      positionedCourses.push({
        ...course,
        color,
        rowSpan: course.endSection - course.startSection + 1,
        columnSpan,
        columnPosition: column,
        hasOverlap: overlaps.some(o => o.courseId1 === course.id || o.courseId2 === course.id)
      });
    });

    return positionedCourses;
  }

  /**
   * 检查两个课程是否重叠
   * @param courseA 第一个课程
   * @param courseB 第二个课程
   * @returns 是否重叠
   */
  private doCoursesOverlap(courseA: Course, courseB: Course): boolean {
    return courseA.startSection < courseB.endSection && courseA.endSection > courseB.startSection;
  }

  /**
   * 生成课程表视图（用于Web环境）
   * @param container 容器元素
   * @param timetableData 课程表数据
   */
  renderWebView(container: HTMLElement, timetableData: TimetableData): void {
    // 清空容器
    container.innerHTML = '';

    // 创建课程表容器
    const timetableContainer = document.createElement('div');
    timetableContainer.className = 'timetable-container';

    // 创建标题栏显示当前周
    const header = document.createElement('div');
    header.className = 'timetable-header';
    header.textContent = `第${timetableData.currentWeek}周`;
    timetableContainer.appendChild(header);

    // 创建表格容器
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'timetable-table-wrapper';

    // 创建表格 - 采用一天一列，每个时刻一行的布局
    const table = document.createElement('table');
    table.className = 'timetable';

    // 创建表头（星期）
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 左上角空白单元格
    const cornerCell = document.createElement('th');
    cornerCell.className = 'timetable-corner';
    headerRow.appendChild(cornerCell);

    // 添加星期标题 - 一天一列
    timetableData.days.forEach(day => {
      const th = document.createElement('th');
      th.className = 'timetable-day-header';
      th.textContent = day.name;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 创建表格主体
    const tbody = document.createElement('tbody');

    // 获取最大节次
    const maxSection = Math.max(...timetableData.days.flatMap(day => 
      day.courses.map(course => course.endSection)
    ), timetableData.sections.length);

    // 为每个时刻（节次）创建一行
    for (let section = 1; section <= maxSection; section++) {
      const row = document.createElement('tr');
      
      // 添加时间（节次）标签
      const sectionCell = document.createElement('td');
      sectionCell.className = 'timetable-time-label';
      sectionCell.textContent = timetableData.sections[section - 1] || `第${section}节`;
      row.appendChild(sectionCell);

      // 为每天（每列）创建单元格
      timetableData.days.forEach((day, dayIndex) => {
        const cell = document.createElement('td');
        cell.className = 'timetable-cell';
        cell.dataset.day = day.dayOfWeek.toString();
        cell.dataset.section = section.toString();

        // 查找当前单元格对应的课程
        const courseAtPosition = day.courses.find(course => 
          course.startSection === section
        );

        if (courseAtPosition) {
          // 创建课程元素
          const courseElement = document.createElement('div');
          courseElement.className = 'timetable-course';
          courseElement.style.backgroundColor = courseAtPosition.color;
          courseElement.style.height = `${courseAtPosition.rowSpan * 100}%`; // 设置课程高度占满对应行数
          courseElement.dataset.courseId = courseAtPosition.id;

          // 添加课程信息
          const courseName = document.createElement('div');
          courseName.className = 'timetable-course-name';
          courseName.textContent = courseAtPosition.name;
          courseElement.appendChild(courseName);

          const courseInfo = document.createElement('div');
          courseInfo.className = 'timetable-course-info';
          courseInfo.textContent = `${courseAtPosition.teacher || ''} ${courseAtPosition.location || ''}`;
          courseElement.appendChild(courseInfo);

          // 如果课程跨越多行，则设置rowspan
          if (courseAtPosition.rowSpan > 1) {
            // 找到对应的单元格并设置rowspan
            const rows = tbody.querySelectorAll(`tr`);
            if (rows.length >= section) {
              const targetRow = rows[section - 1];
              const targetCell = targetRow.cells[dayIndex + 1]; // +1 因为第一列是时间标签
              targetCell.rowSpan = courseAtPosition.rowSpan;
              targetCell.style.height = `${courseAtPosition.rowSpan * 60}px`; // 设置高度
              targetCell.appendChild(courseElement);
            }
            
            // 隐藏被合并的单元格
            for (let i = 1; i < courseAtPosition.rowSpan; i++) {
              if (rows.length >= section + i) {
                const hiddenRow = rows[section + i - 1];
                if (hiddenRow.cells[dayIndex + 1]) {
                  hiddenRow.cells[dayIndex + 1].style.display = 'none';
                }
              }
            }
          } else {
            // 单节课程直接添加
            cell.appendChild(courseElement);
          }
        }

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    timetableContainer.appendChild(tableWrapper);
    container.appendChild(timetableContainer);

    // 添加基础样式 - 优化一天一列，每个时刻一行的布局
    const style = document.createElement('style');
    style.textContent = `
      .timetable-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .timetable-header {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
        color: #333;
      }
      .timetable-table-wrapper {
        overflow-x: auto;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .timetable {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        background-color: white;
      }
      .timetable-corner {
        width: 100px;
        background-color: #4a6fa5;
        color: white;
        border: none;
        font-weight: bold;
      }
      .timetable-day-header {
        width: 150px;
        min-width: 150px;
        padding: 15px 10px;
        background-color: #4a6fa5;
        color: white;
        border: none;
        text-align: center;
        font-weight: bold;
        border-right: 1px solid rgba(255,255,255,0.2);
      }
      .timetable-time-label {
        width: 100px;
        padding: 12px 10px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        text-align: center;
        font-weight: bold;
        color: #495057;
        font-size: 14px;
      }
      .timetable-cell {
        height: 60px;
        border: 1px solid #dee2e6;
        padding: 2px;
        overflow: hidden;
        vertical-align: top;
        position: relative;
        background-color: white;
      }
      .timetable-course {
        width: 100%;
        padding: 8px;
        color: white;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
      }
      .timetable-course:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      .timetable-course-name {
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 13px;
        line-height: 1.3;
      }
      .timetable-course-info {
        font-size: 11px;
        opacity: 0.95;
        line-height: 1.2;
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .timetable-day-header {
          width: 120px;
          min-width: 120px;
          padding: 10px 5px;
          font-size: 14px;
        }
        .timetable-time-label {
          width: 80px;
          padding: 10px 5px;
          font-size: 13px;
        }
        .timetable-course-name {
          font-size: 12px;
        }
        .timetable-course-info {
          font-size: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 获取课程表数据用于React Native渲染
   * @param timetableData 课程表数据
   * @returns 格式化后的React Native数据
   */
  getReactNativeData(timetableData: TimetableData): RNRenderData {
    // 处理数据以适应React Native的组件结构
    return {
      currentWeek: timetableData.currentWeek,
      days: timetableData.days.map(day => ({
        name: day.name,
        dayOfWeek: day.dayOfWeek,
        courses: day.courses.map(course => ({
          ...course,
          style: {
            backgroundColor: course.color,
            rowSpan: course.rowSpan,
            columnSpan: course.columnSpan,
            columnPosition: course.columnPosition
          }
        }))
      })),
      sections: timetableData.sections,
      hasOverlaps: timetableData.hasOverlaps
    };
  }

  /**
   * 获取课程表数据用于Electron渲染
   * @param timetableData 课程表数据
   * @returns 格式化后的Electron数据
   */
  getElectronData(timetableData: TimetableData): ElectronRenderData {
    // Electron环境可以直接使用web数据格式
    return timetableData;
  }
}

// 类型定义

export interface TimetableData {
  currentWeek: number;
  days: DayData[];
  sections: string[];
  hasOverlaps: boolean;
}

export interface DayData {
  name: string;
  dayOfWeek: number;
  courses: PositionedCourse[];
}

export interface PositionedCourse extends Course {
  color: string;
  rowSpan: number;
  columnSpan: number;
  columnPosition: number;
  hasOverlap: boolean;
}

export interface OverlapInfo {
  courseId1: string;
  courseId2: string;
  startSection: number;
  endSection: number;
}

export interface RNRenderData {
  currentWeek: number;
  days: RNDaysData[];
  sections: string[];
  hasOverlaps: boolean;
}

export interface RNDaysData {
  name: string;
  dayOfWeek: number;
  courses: RNCourseData[];
}

export interface RNCourseData extends PositionedCourse {
  style: {
    backgroundColor: string;
    rowSpan: number;
    columnSpan: number;
    columnPosition: number;
  };
}

export type ElectronRenderData = TimetableData;