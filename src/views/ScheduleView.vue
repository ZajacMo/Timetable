<template>
  <div class="schedule-view">
    <div class="header-section">
      <h2>日程安排</h2>
      
      <!-- 设置选项 -->
      <div class="settings-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="showCourses">
          显示课程
        </label>
        <button @click="changeDateRange(-1)">← 上一组</button>
        <button @click="changeDateRange(1)">下一组 →</button>
      </div>
    </div>

    <!-- 三天日程表 - 共享纵坐标 -->
    <div class="single-timeline-schedule">
      <!-- 日期标题行 -->
      <div class="date-headers-row">
        <div class="time-labels-header"></div>
        <div v-for="(dateInfo, index) in threeDays" :key="index" class="day-date-header" :class="{ 'today-date': dateInfo.isToday }">
          <h3>{{ formatDate(dateInfo.date) }}</h3>
        </div>
      </div>
      
      <!-- 共享时间轴容器 -->
      <div class="shared-timeline-container">
        <!-- 左侧垂直时间标签 - 仅显示重要时间点 -->
    <div class="time-labels">
      <div v-for="hour in 24" :key="hour" class="time-label" :style="{ top: `${(hour/24)*100}%` }">
        {{ hour % 2 === 0 ? formatHour(hour) : '' }}
      </div>
    </div>
        
        <!-- 三天内容区域 -->
        <div class="three-days-content">
          <!-- 每一天的内容列 -->
          <div v-for="(dateInfo, index) in threeDays" :key="index" class="day-content-column">
            <!-- 日程项目 -->
            <div
              v-for="schedule in getSchedulesForDate(dateInfo.date)"
              :key="`schedule-${schedule.id}`"
              class="schedule-item"
              :style="{
                borderLeftColor: schedule.color || '#00a2ae',
                top: `${calculateTopPosition(schedule.startDate)}%`,
                height: `${calculateHeight(schedule.startDate, schedule.endDate)}%`
              }"
            >
              <div class="schedule-time">
                {{ formatTime(schedule.startDate) }} - {{ formatTime(schedule.endDate) }}
              </div>
              <div class="schedule-content">
                <h4 class="schedule-title">{{ schedule.title }}</h4>
                <p class="schedule-description" v-if="schedule.description">
                  {{ schedule.description }}
                </p>
              </div>
            </div>
            
            <!-- 课程项目 -->
            <div
              v-for="course in getCoursesForDate(dateInfo.date)"
              v-if="showCourses"
              :key="`course-${course.id}`"
              class="course-item"
              :style="{
                borderLeftColor: course.color || '#f05261',
                top: `${calculateTopPosition(getCourseStartTime(course))}%`,
                height: `${calculateHeight(getCourseStartTime(course), getCourseEndTime(course))}%`
              }"
            >
              <div class="course-content">
                <h4 class="course-name">{{ course.name }}</h4>
                <p class="course-teacher" v-if="course.teacher">{{ course.teacher }}</p>
                <p class="course-classroom" v-if="course.classroom">{{ course.classroom }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加日程按钮 -->
    <button class="add-schedule-button" @click="showAddScheduleDialog = true">
      + 添加日程
    </button>

    <!-- 添加日程对话框 -->
    <ScheduleDialog
      v-if="showAddScheduleDialog"
      @save="saveSchedule"
      @cancel="cancelAddSchedule"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { useCoursesStore } from '@/stores/courses'
import ScheduleDialog from '@/components/ScheduleDialog.vue'
import { Schedule } from '@/types/schedule'
import type { Course } from '@/types/course'
import { CourseDataProcessor } from '@/core/courseDataProcessor'

const scheduleStore = useScheduleStore()
const coursesStore = useCoursesStore()

// 响应式数据
const showAddScheduleDialog = ref(false)
const baseDate = ref(new Date())
const showCourses = ref(true)

// 计算三天的日期信息
const threeDays = computed(() => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(baseDate.value)
    date.setDate(baseDate.value.getDate() + i)
    date.setHours(0, 0, 0, 0)
    
    const isToday = date.getTime() === today.getTime()
    
    days.push({
      date,
      isToday
    })
  }
  
  return days
})

// 方法
const changeDateRange = (delta: number) => {
  const newDate = new Date(baseDate.value)
  newDate.setDate(newDate.getDate() + delta * 3)
  baseDate.value = newDate
}

const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  const dayOfWeek = dayNames[date.getDay()]
  return `${month}-${day} 星期${dayOfWeek}`
}

// 格式化小时
const formatHour = (hour: number): string => {
  return `${hour}:00`
}

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 获取特定日期的日程
const getSchedulesForDate = (date: Date): Schedule[] => {
  return scheduleStore.getSchedulesForDate(date)
}

// 获取特定日期的课程
const getCoursesForDate = (date: Date): Course[] => {
  const weekNumber = getWeekNumber(date) // 计算当前日期的周数
  
  // 使用CourseDataProcessor的getCoursesForDate方法获取当天课程
  return CourseDataProcessor.getCoursesForDate(coursesStore.courses, date, weekNumber)
}

// 计算指定日期的周数（相对于当前学期开始）
const getWeekNumber = (_date: Date): number => {

  // 这里简单返回第1周，实际应用中应该根据学期开始日期计算
  // 由于我们使用的是模拟数据，所有课程都从第1周开始
  return 1
}

// 获取课程开始时间
const getCourseStartTime = (course: Course): Date => {
  // 使用CourseDataProcessor的getCourseStartTime方法
  return CourseDataProcessor.getCourseStartTime(course)
}

// 获取课程结束时间
const getCourseEndTime = (course: Course): Date => {
  // 使用CourseDataProcessor的getCourseEndTime方法
  return CourseDataProcessor.getCourseEndTime(course)
}

// 计算时间在时间轴上的位置百分比
const calculateTopPosition = (date: Date): number => {
  const hours = date.getHours() + date.getMinutes() / 60
  // 一天24小时，每个小时占用约4.17%的高度
  return (hours / 24) * 100
}

// 计算时间段在时间轴上的高度百分比
const calculateHeight = (startDate: Date, endDate: Date): number => {
  const startHours = startDate.getHours() + startDate.getMinutes() / 60
  const endHours = endDate.getHours() + endDate.getMinutes() / 60
  const duration = endHours - startHours
  
  // 一天24小时，每个小时占用约4.17%的高度
  return (duration / 24) * 100
}

const saveSchedule = async (schedule: Omit<Schedule, 'id'>) => {
  await scheduleStore.addSchedule(schedule)
  cancelAddSchedule()
}

const cancelAddSchedule = () => {
  showAddScheduleDialog.value = false
}
</script>

<style scoped>
.schedule-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
}

.settings-options button {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.settings-options button:hover {
  background-color: #e0e0e0;
}

/* 三天日程共享纵坐标布局 */
.single-timeline-schedule {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 日期标题行 */
.date-headers-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.time-labels-header {
  width: 50px;
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
}

.day-date-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  padding: 15px 20px;
  background-color: #f7f7f7;
  border-right: 1px solid #e0e0e0;
}

.day-date-header:last-child {
  border-right: none;
}

.day-date-header h3 {
  margin: 0;
  font-size: 16px;
  color: #999; /* 默认灰色 */
}

.day-date-header.today-date h3 {
  color: #000; /* 今天用黑色 */
  font-weight: bold;
}

/* 共享时间轴容器 */
.shared-timeline-container {
  display: flex;
  /* height: 600px; */
  position: relative;
}

/* 左侧垂直时间标签 */
.time-labels {
  width: 50px;
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
  position: relative;
}

.time-label {
  position: absolute;
  width: 100%;
  height: 20px;
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  transform: translateY(-50%);
  white-space: nowrap;
  text-align: center;
}

/* 三天内容区域 */
.three-days-content {
  flex: 1;
  display: flex;
  position: relative;
}

/* 每一天的内容列 */
.day-content-column {
  flex: 1;
  position: relative;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
}

.day-content-column:last-child {
  border-right: none;
}

/* 日程项样式 */
.schedule-item {
  position: absolute;
  left: 10px;
  right: 10px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-left: 4px solid #00a2ae;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 10;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.schedule-time {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.schedule-content h4 {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.schedule-description {
  margin: 0;
  font-size: 11px;
  color: #777;
  line-height: 1.3;
}

/* 课程项样式 */
.course-item {
  position: absolute;
  left: 10px;
  right: 10px;
  padding: 8px 12px;
  background-color: rgba(255, 240, 242, 0.95);
  border-left: 4px solid #f05261;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 5;
}

.course-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.course-content h4 {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.course-teacher,
.course-classroom {
  margin: 2px 0;
  font-size: 11px;
  color: #777;
  line-height: 1.2;
}

/* 添加日程按钮 */
.add-schedule-button {
  display: block;
  margin: 20px auto 0;
  padding: 10px 20px;
  background-color: #00a2ae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-schedule-button:hover {
  background-color: #008a93;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .settings-options {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .shared-timeline-container {
    min-height: 600px;
  }
}

/* 深色模式适配 */
.dark-mode .schedule-view {
  color: #e0e0e0;
}

.dark-mode .single-timeline-schedule {
  background-color: #2d2d2d;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.dark-mode .date-headers-row {
  border-bottom-color: #4a4a4a;
}

.dark-mode .time-labels-header {
  background-color: #3a3a3a;
  border-right-color: #4a4a4a;
}

.dark-mode .day-date-header {
  background-color: #3a3a3a;
  border-right-color: #4a4a4a;
}

.dark-mode .day-date-header h3 {
  color: #e0e0e0;
}

.dark-mode .time-labels {
  background-color: #3a3a3a;
  border-right-color: #4a4a4a;
}

.dark-mode .time-label {
  color: #999;
}

.dark-mode .day-content-column {
  background-color: #2d2d2d;
  border-right-color: #4a4a4a;
}

.dark-mode .schedule-item {
  background-color: rgba(45, 45, 45, 0.9);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.dark-mode .schedule-content h4 {
  color: #e0e0e0;
}

.dark-mode .course-item {
  background-color: rgba(80, 40, 45, 0.95);
}

.dark-mode .course-content h4 {
  color: #e0e0e0;
}

.dark-mode .settings-options button {
  background-color: #4a4a4a;
  border-color: #5a5a5a;
  color: #e0e0e0;
}

.dark-mode .settings-options button:hover {
  background-color: #5a5a5a;
}
</style>