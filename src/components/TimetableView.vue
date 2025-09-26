<template>
  <div class="timetable">
    <!-- 课程表头部：星期标题 -->
    <div class="timetable-header">
      <div class="time-column"></div> <!-- 空白单元格 -->
      <div 
        v-for="day in days" 
        :key="day.dayOfWeek"
        class="day-column"
        :class="{ 'weekend': isWeekend(day.dayOfWeek) }"
      >
        <div class="day-name">{{ day.name }}</div>
      </div>
    </div>

    <!-- 课程表主体 -->
    <div class="timetable-body">
      <!-- 每一行代表一节课 -->
      <div v-for="section in sections" :key="section.index" class="section-row">
        <!-- 时间列 -->
        <div class="time-column">
          <div class="section-time">{{ section.name }}</div>
        </div>
        
        <!-- 课程单元格 -->
        <div 
          v-for="day in days" 
          :key="day.dayOfWeek"
          class="day-column"
          :class="{ 'weekend': isWeekend(day.dayOfWeek) }"
        >
          <!-- 单元格内容 -->
          <div class="cell-content">
            <!-- 在这个单元格中显示的课程 -->
            <div 
              v-for="course in getCoursesForCell(day.dayOfWeek, section.index)"
              :key="course.id"
              class="course-block"
              :style="{ 
                backgroundColor: course.color || generateColor(course.id),
                gridColumn: 'span 1',
                gridRow: `span ${(course.endSection - course.startSection + 1) || 1}`
              }"
              @click="onCourseClick(course)"
            >
              <div class="course-name">{{ course.name }}</div>
              <div class="course-teacher" v-if="course.teacher">{{ course.teacher }}</div>
              <div class="course-classroom" v-if="course.classroom">{{ course.classroom }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Course } from '@/types/course'
import { useSettingsStore } from '@/stores/settings'

// Props
const props = defineProps<{
  courses: Course[]
  currentWeek: number
}>()

// Emits
const emit = defineEmits<{
  courseClick: [course: Course]
}>()

const settingsStore = useSettingsStore()

// 响应式数据
const dayNames = ref(['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'])
const sectionNames = ref(['', '第1节', '第2节', '第3节', '第4节', '第5节', '第6节', '第7节', '第8节', '第9节', '第10节'])

// 计算属性
const days = computed(() => {
  const days = []
  // 如果设置了显示周末，则显示7天，否则显示5天
  const endDay = settingsStore.settings.display.showWeekend ? 7 : 5
  
  for (let day = 1; day <= endDay; day++) {
    days.push({
      dayOfWeek: day,
      name: dayNames.value[day]
    })
  }
  
  return days
})

const sections = computed(() => {
  const sections = []
  const maxSections = 10 // 使用默认值10，因为settings中没有这个配置
  
  for (let i = 1; i <= maxSections; i++) {
    sections.push({
      index: i,
      name: sectionNames.value[i]
    })
  }
  
  return sections
})

// 方法
const isWeekend = (dayOfWeek: number): boolean => {
  return dayOfWeek === 6 || dayOfWeek === 7
}

const getCoursesForCell = (dayOfWeek: number, sectionIndex: number): Course[] => {
  // 过滤出当前周、当前天的课程
  const filteredCourses = props.courses.filter(course => {
    // 检查是否在当前天
    if (course.dayOfWeek !== dayOfWeek) {
      return false
    }
    
    // 检查是否在当前节次范围内
    if (sectionIndex < course.startSection || sectionIndex > course.endSection) {
      return false
    }
    
    // 检查单双周设置
    if (course.weekType === 'odd' && props.currentWeek % 2 === 0) {
      return false
    }
    if (course.weekType === 'even' && props.currentWeek % 2 !== 0) {
      return false
    }
    
    return true
  })
  
  // 为第一个节次的课程计算跨行数
  return filteredCourses.map(course => {
    // 只有在课程的起始节次才显示
    if (sectionIndex === course.startSection) {
      return {
        ...course,
        rowSpan: course.endSection - course.startSection + 1
      }
    }
    return null
  }).filter(Boolean) as Course[]
}

const generateColor = (str: string): string => {
  // 根据字符串生成一致的颜色
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    color += ('00' + value.toString(16)).substr(-2)
  }
  return color
}

const onCourseClick = (course: Course) => {
  emit('courseClick', course)
}
</script>

<style scoped>
.timetable {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

/* 课程表头部 */
.timetable-header {
  display: grid;
  grid-template-columns: 80px 1fr;
  background-color: #f2f6f7;
  border-bottom: 1px solid #ddd;
}

/* 课程表主体 */
.timetable-body {
  display: grid;
  grid-template-columns: 80px 1fr;
}

/* 时间列 */
.time-column {
  background-color: #f2f6f7;
  border-right: 1px solid #ddd;
  font-size: 12px;
}

.section-time {
  text-align: center;
  padding: 10px 5px;
  border-bottom: 1px dashed #ddd;
  font-weight: 600;
  color: #666;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 星期列 */
.day-column {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  text-align: center;
}

.day-name {
  padding: 10px 5px;
  font-weight: 600;
  color: #333;
  border-right: 1px solid #ddd;
}

.day-column.weekend {
  background-color: #fafafa;
}

/* 单元格内容 */
.cell-content {
  position: relative;
  min-height: 60px;
  border-right: 1px solid #ddd;
  border-bottom: 1px dashed #ddd;
}

/* 课程块 */
.course-block {
  position: relative;
  padding: 5px;
  margin: 2px;
  border-radius: 4px;
  color: white;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(100% - 4px);
}

.course-block:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.course-name {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-teacher,
.course-classroom {
  font-size: 11px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  
  .section-time,
  .cell-content {
    min-height: 50px;
  }
  
  .course-name {
    font-size: 11px;
  }
  
  .course-teacher,
  .course-classroom {
    font-size: 10px;
  }
}
</style>