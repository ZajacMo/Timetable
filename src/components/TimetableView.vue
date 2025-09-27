<template>
  <div class="timetable">
    <!-- 周次切换控件 -->
  <div class="week-switcher">
    <el-button @click="changeWeek(-1)" size="small">上一周</el-button>
    <div class="current-week-container">
      <span class="current-week" @click="showWeekSelector = !showWeekSelector">
        第{{ currentWeekDisplay }}周
      </span>
      <!-- 周数选择器 -->
      <div v-if="showWeekSelector" class="week-selector">
        <div class="week-selector-header">
          <span>选择周数</span>
          <button class="close-btn" @click="showWeekSelector = false">×</button>
        </div>
        <div class="week-selector-content">
          <div class="week-grid">
            <button 
              v-for="week in semesterWeeksCount" 
              :key="week"
              :class="['week-btn', { active: week === currentWeekDisplay }]"
              @click="selectWeek(week)"
            >
              {{ week }}
            </button>
          </div>
          <div class="week-selector-footer">
            <el-button @click="goToCurrentWeek" size="small">当前周</el-button>
          </div>
        </div>
      </div>
    </div>
    <el-button @click="changeWeek(1)" size="small">下一周</el-button>
  </div>

    <!-- 课程表 -->
    <el-table :key="tableKey" :data="tableData" style="width: 100% ; height: 100%;" :span-method="getSpanMethod" border fit>
      <el-table-column fixed label="时间" width="50%" align="center">
        <template #default="{ row }">
          <div class="time-cell-content">
            <div class="section-number">{{ row.time }}</div>
            <div class="section-time" v-if="row.startTime && row.endTime">
              <div class="start-time">{{ row.startTime }}</div>
              <div class="end-time">{{ row.endTime }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column 
        v-for="day in daysWithDate" 
        :key="day.dayOfWeek"
        :prop="day.name" 
        min-width="60%" 
        style="width: 100%;padding: 0;"
        align="center"
      >
      <template #header>
        <div class="day-label-container">
          <div class="day-name">{{ day.name }}</div>
          <div :class="['day-date', { 'today': day.isToday }]">{{ day.dateString }}</div>
        </div>
      </template>
      <template #default="{ row, column }">
        <div v-if="row[column.property] && row[column.property].length > 0" style="height: 100%; display: flex; flex-direction: column; min-width:100%">
          <CourseCell 
            v-for="(course, index) in row[column.property]"
            :key="course.id || index"
            :course="course"
            :style="{ backgroundColor: course.color || '#f5f7fa' }"
          />
          <div v-if="row[column.property].length > 1" style="height: 8px;"></div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table-column>
    </el-table>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CourseCell from './CourseCell.vue'
import processedCourses from '../../processedCourses.json'
import { useSettingsStore } from '@/stores/settings'
import type { HolidayCourseAdjustment } from '@/stores/settings'

// 初始化设置store
const settingsStore = useSettingsStore()

// 当前显示的周次（响应式）
const currentWeekDisplay = ref(1)

// 是否显示周数选择器
const showWeekSelector = ref(false)

// 表格刷新key，用于强制重新渲染表格
const tableKey = ref(0)

// 获取学期周数
const semesterWeeksCount = computed(() => settingsStore.settings.semester.weeksCount || 20)

// 获取当前周数（从设置store中）
const systemCurrentWeek = computed(() => settingsStore.currentWeek)

// 存储处理后的课程数据
const courseData = ref<any[]>([])

// 定义一周的天数
const days = [
  { name: '星期一', dayOfWeek: 1 },
  { name: '星期二', dayOfWeek: 2 },
  { name: '星期三', dayOfWeek: 3 },
  { name: '星期四', dayOfWeek: 4 },
  { name: '星期五', dayOfWeek: 5 },
  { name: '星期六', dayOfWeek: 6 },
  { name: '星期日', dayOfWeek: 7 }
]

// 计算带有日期信息的星期数据
const daysWithDate = computed(() => {
  // 获取学期开始日期
  const semesterStart = settingsStore.semesterStartDate
  
  // 计算当前周的第一天（周一）的日期
  const weekOffset = (currentWeekDisplay.value - 1) * 7
  const startOfWeek = new Date(semesterStart)
  startOfWeek.setDate(semesterStart.getDate() + weekOffset)
  
  // 调整到周一开始（如果学期开始不是周一）
  const startDayOfWeek = startOfWeek.getDay() || 7 // 将周日(0)转换为7
  startOfWeek.setDate(startOfWeek.getDate() - (startDayOfWeek - 1))
  
  // 获取今天的日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 为每一天添加日期信息
  return days.map((day, index) => {
    const currentDate = new Date(startOfWeek)
    currentDate.setDate(startOfWeek.getDate() + index)
    
    // 格式化日期为X月X日
    const dateString = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`
    
    // 检查是否是今天
    const isToday = currentDate.getTime() === today.getTime()
    
    return {
      ...day,
      dateString,
      isToday
    }
  })
})

// 解析课程时间，转换为开始和结束节次
const parseCourseTime = (jc: string) => {
  const match = jc.match(/(\d+)-(\d+)节/)
  if (match) {
    return {
      startSection: parseInt(match[1]),
      endSection: parseInt(match[2])
    }
  }
  return { startSection: 1, endSection: 1 }
}

// 检查课程是否在当前周次
const isCourseInCurrentWeek = (zcd: string) => {
  // 简单实现，实际应该解析各种周次格式
  if (zcd.includes('全周') || zcd.includes('1-18周')) {
    return true
  }
  
  // 检查当前周是否在范围中
  const currentWeek = currentWeekDisplay.value
  const weekRangeMatch = zcd.match(/(\d+)-(\d+)周/)
  if (weekRangeMatch) {
    const startWeek = parseInt(weekRangeMatch[1])
    const endWeek = parseInt(weekRangeMatch[2])
    return currentWeek >= startWeek && currentWeek <= endWeek
  }
  
  // 检查当前周是否为单周
  if (zcd.includes(`${currentWeek}周`)) {
    return true
  }
  
  return false
}

// 格式化课程数据，转换为表格需要的格式
const tableData = computed(() => {
  // 获取课程时间配置和每日最大课程数限制
  const sectionTimes = settingsStore.settings.display.sectionTimes || {}
  const maxDailyCourses = settingsStore.settings.display.maxDailyCourses || 999 // 默认不限制
  
  // 统计每天的课程数量
  const dailyCourseCount: { [key: number]: number } = {}
  
  // 初始化每天的课程计数
  days.forEach(day => {
    dailyCourseCount[day.dayOfWeek] = 0
  })
  
  // 初始化表格数据，包含1-10节课的时间
  const data = []
  for (let section = 1; section <= 11; section++) {
    // 获取当前节次的开始和结束时间
    const sectionTime = sectionTimes[section]
    const startTime = sectionTime ? sectionTime.startTime : ''
    const endTime = sectionTime ? sectionTime.endTime : ''
    
    const row: any = {
      time: `第${section}节`,
      startTime,
      endTime,
      // 存储原始节次信息，用于合并单元格计算
      section
    }
    
    // 为每一天添加对应的课程信息，应用每日最大课程数限制
    days.forEach(day => {
      const allCoursesInSection = courseData.value.filter(course => 
        course.dayOfWeek === day.dayOfWeek &&
        course.startSection <= section && 
        course.endSection >= section
      )
      
      // 应用每日课程数量限制
      // 对于第一节课，检查是否已经达到最大课程数
      if (section === 1) {
        // 计算当天的总课程数
        const totalDayCourses = courseData.value.filter(course => 
          course.dayOfWeek === day.dayOfWeek
        ).length
        
        // 更新当天的课程计数
        dailyCourseCount[day.dayOfWeek] = Math.min(totalDayCourses, maxDailyCourses)
      }
      
      // 根据是否超过最大课程数来决定是否显示课程
      const shouldShowCourses = dailyCourseCount[day.dayOfWeek] > 0
      
      // 如果应该显示课程，获取当前节次的课程
      const coursesInSection = shouldShowCourses ? allCoursesInSection : []
      
      // 存储课程对象
      row[day.name] = coursesInSection
    })
    
    data.push(row)
  }
  return data
})

// 切换周次
const changeWeek = (delta: number) => {
  const newWeek = currentWeekDisplay.value + delta
  // 限制周次范围
  if (newWeek >= 1 && newWeek <= semesterWeeksCount.value) {
    currentWeekDisplay.value = newWeek
    // 重新加载当前周的课程
    loadCurrentWeekCourses()
    // 更新表格key强制重新渲染，确保日期正确显示
    tableKey.value++
  }
}

// 选择特定周数
const selectWeek = (week: number) => {
  if (week >= 1 && week <= semesterWeeksCount.value) {
    currentWeekDisplay.value = week
    // 重新加载当前周的课程
    loadCurrentWeekCourses()
    // 更新表格key强制重新渲染，确保日期正确显示
    tableKey.value++
    // 关闭周数选择器
    showWeekSelector.value = false
  }
}

// 跳转到当前周
const goToCurrentWeek = () => {
  currentWeekDisplay.value = systemCurrentWeek.value
  // 重新加载当前周的课程
  loadCurrentWeekCourses()
  // 更新表格key强制重新渲染，确保日期正确显示
  tableKey.value++
  // 关闭周数选择器
  showWeekSelector.value = false
}

// 计算单元格合并的函数
const getSpanMethod = ({ row, column, columnIndex }: any) => {
  // 跳过时间列
  if (columnIndex === 0) {
    return { rowspan: 1, colspan: 1 }
  }
  
  // 获取当前天的课程
  const dayName = column.property
  const courses = row[dayName] || []
  
  // 如果没有课程，不合并
  if (courses.length === 0) {
    return { rowspan: 1, colspan: 1 }
  }
  
  // 获取当前节次
  const currentSection = row.section
  
  // 检查当前节次是否为某门课程的开始节次
  const startingCourses = courses.filter((course: any) => course.startSection === currentSection)
  
  if (startingCourses.length > 0) {
    // 对于开始节次的课程，计算合并的行数
    const mainCourse = startingCourses[0]
    const rowspan = mainCourse.endSection - mainCourse.startSection + 1
    return { rowspan, colspan: 1 }
  }
  
  // 检查当前节次是否为某门课程的中间节次
  const isMiddleSection = courses.some((course: any) => 
    course.startSection < currentSection && course.endSection >= currentSection
  )
  
  if (isMiddleSection) {
    // 如果是中间节次，则隐藏该单元格
    return { rowspan: 0, colspan: 0 }
  }
  
  return { rowspan: 1, colspan: 1 }
}

// 为不同课程生成不同颜色的函数
const generateCourseColor = (courseName: string, teacher: string) => {
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
const applyHolidayAdjustments = (courses: any[]) => {
  const adjustedCourses: any[] = [...courses]
  const currentWeek = currentWeekDisplay.value
  const adjustments = settingsStore.settings.holidayCourseAdjustments
  
  // 检查是否有需要从其他周调整过来的课程
  adjustments.forEach((adjustment: HolidayCourseAdjustment) => {
    // 如果目标周次是当前周，需要将原周次的课程复制到当前周
    if (adjustment.targetWeek === currentWeek) {
      // 遍历所有课程，找到符合条件的课程
      processedCourses.courses.forEach((course: any) => {
        course.courseSchedules.forEach((schedule: any) => {
          // 检查课程是否在原始周次
          if (isCourseInOriginalWeek(schedule.zcd, adjustment.originalWeek)) {
            // 检查课程是否在原始星期几
            if (parseInt(schedule.xqj) === adjustment.originalDay) {
              // 解析课程时间
              const { startSection, endSection } = parseCourseTime(schedule.jc)
              
              // 为课程生成颜色
              const color = generateCourseColor(course.kcmc, course.xm)
              
              // 创建调整后的课程对象
              adjustedCourses.push({
                id: `${course.kch}-adjusted-${adjustment.id}`, // 使用不同的ID避免冲突
                name: course.kcmc, // 课程名称
                teacher: course.xm, // 教师
                classroom: schedule.cdmc, // 教室
                dayOfWeek: adjustment.targetDay, // 使用目标星期几
                startSection, // 开始节次
                endSection, // 结束节次
                color, // 添加颜色属性
                xqj: adjustment.targetDay.toString(), // 添加星期几的原始值
                jc: schedule.jc, // 添加节次的原始值
                isAdjusted: true, // 标记为调整后的课程
                adjustmentReason: adjustment.reason // 调整原因
              })
            }
          }
        })
      })
    }
  })
  
  // 移除需要调整到其他周的课程
  return adjustedCourses.filter(course => {
    // 检查当前课程是否需要调整到其他周
    const shouldBeRemoved = adjustments.some((adjustment: HolidayCourseAdjustment) => {
      return adjustment.originalWeek === currentWeek && 
             adjustment.originalDay === course.dayOfWeek &&
             !course.isAdjusted // 避免移除已经调整过的课程
    })
    return !shouldBeRemoved
  })
}

// 检查课程是否在指定的原始周次
const isCourseInOriginalWeek = (zcd: string, week: number) => {
  if (zcd.includes('全周') || zcd.includes(`${week}-${settingsStore.settings.semester.weeksCount}周`)) {
    return true
  }
  
  // 检查是否在范围中
  const weekRangeMatch = zcd.match(/(\d+)-(\d+)周/)
  if (weekRangeMatch) {
    const startWeek = parseInt(weekRangeMatch[1])
    const endWeek = parseInt(weekRangeMatch[2])
    return week >= startWeek && week <= endWeek
  }
  
  // 检查是否为指定周
  if (zcd.includes(`${week}周`)) {
    return true
  }
  
  return false
}

// 加载当前周的课程
const loadCurrentWeekCourses = () => {
  const currentCourses: any[] = []
  
  // 遍历所有课程
  processedCourses.courses.forEach((course: any) => {
    // 遍历课程的所有时间段
    course.courseSchedules.forEach((schedule: any) => {
      // 检查课程是否在当前周次
      if (isCourseInCurrentWeek(schedule.zcd)) {
        // 解析课程时间
        const { startSection, endSection } = parseCourseTime(schedule.jc)
        
        // 为课程生成颜色
        const color = generateCourseColor(course.kcmc, course.xm)
        
        // 创建适配CourseCell的课程对象
        currentCourses.push({
          id: course.kch, // 使用课程号作为ID
          name: course.kcmc, // 课程名称
          teacher: course.xm, // 教师
          classroom: schedule.cdmc, // 教室
          dayOfWeek: parseInt(schedule.xqj), // 星期几
          startSection, // 开始节次
          endSection, // 结束节次
          color, // 添加颜色属性
          xqj: schedule.xqj, // 添加星期几的原始值
          jc: schedule.jc // 添加节次的原始值
        })
      }
    })
  })
  
  // 应用节假日课程调整
  courseData.value = applyHolidayAdjustments(currentCourses)
}

// 初始化
onMounted(() => {
  // 自动定位到当前周
  currentWeekDisplay.value = systemCurrentWeek.value
  // 加载当前周的课程
  loadCurrentWeekCourses()
})
</script>

<style scoped>
:deep(.el-table .cell){
/* table.el-table__body>tbody>tr>td>div.cell{ */
  padding: 2px;
  height: 100%;
}

.timetable {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 周次切换控件样式 */
.week-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  gap: 16px;
  position: relative;
}

.current-week-container {
  position: relative;
}

.current-week {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.current-week:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 周数选择器样式 */
.week-selector {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 240px;
  z-index: 1000;
}

.week-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #606266;
}

.week-selector-content {
  padding: 16px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.week-btn {
  padding: 6px 0;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.week-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.week-btn.active {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.week-selector-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

/* 设置el-table字体大小 */
.timetable :deep(.el-table) {
  font-size: 8px;
}

/* 设置el-table单元格字体大小 */
.timetable :deep(.el-table th),
.timetable :deep(.el-table td) {
  font-size: 12px;
  padding: 0px;
}

/* 时间单元格样式 */
div.time-cell-content {
  align-items: center;
  justify-content: center;
  div.section-number {
    font-size: 12px;
    font-weight: 500;
  }
  div.section-time {
    align-items: center;
    line-height: 12px;
    text-align: center;
    font-weight: 600;
    color: #666;
    align-items: center;
    justify-content: center;
    div.start-time,
    div.end-time {
      font-size: 10px;
      color: #666;
    }
  }
}

.time-column {
  background-color: #f2f6f7;
  /* border-right: 1px solid #ddd; */
  font-size: 8px;
  width: 20px;
}


.day-column {
  display: flex;
  flex-direction: column;
}

.cell-content {
  position: relative;
  min-height: 60px;
  border-right: 1px solid #ddd;
  border-bottom: 1px dashed #ddd;
  /* width: 120px; 设置固定宽度 */
  display: flex;
  flex-direction: column;
}

/* CourseCell父容器样式 */
.cell-content > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 深色模式 */
.dark-mode .timetable-header,
.dark-mode .time-column {
  background-color: #3d3d3d;
  color: #fff;
}

.dark-mode .day-column.weekend {
  background-color: #2d2d2d;
}

.dark-mode .course-name,
.dark-mode .course-teacher,
.dark-mode .course-classroom {
  color: #fff;
}

/* 日期标签样式 */
.day-label-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
}

.day-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.day-date {
  font-size: 10px;
  color: #666;
  line-height: 12px;
}

.day-date.today {
  color: #409eff;
  font-weight: bold;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
}

/* 教师信息居中显示 */
.course-teacher {
  text-align: center;
  font-size: 10px;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timetable {
    font-size: 12px;
  }
  
  .time-column {
    width: 60px;
  }
  
  .day-column {
    min-width: 60px;
  }
  
  .course-name {
    font-size: 11px;
  }
  
  .course-teacher,
  .course-classroom {
    text-align: center;
    font-size: 10px;
    width: 100%;
  }
}
</style>