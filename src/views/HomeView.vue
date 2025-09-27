<template>
  <div class="home-view">
    <!-- 课程表内容 -->
    <div class="timetable-container">
      <TimetableView
        :courses="filteredCourses"
        :currentWeek="currentWeek"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSemesterStore } from '@/stores/semester'
import TimetableView from '@/components/TimetableView.vue'

// 引入courses.json数据
import coursesData from '../../courses.json'

const semesterStore = useSemesterStore()

// 计算属性
const currentWeek = computed(() => semesterStore.currentWeek)

// 格式化courses.json数据为我们需要的课程格式
const filteredCourses = computed(() => {
  // 从courses.json中提取kbList数组
  const kbList = coursesData.kbList || []
  
  // 转换为我们需要的课程格式
  return kbList.map((item: any, index: number) => ({
    id: `course_${index}`,
    name: item.kcmc || '',
    teacher: item.xm || '',
    classroom: item.cdmc || '',
    // 解析周次信息
    startWeek: parseStartWeek(item.zcd),
    endWeek: parseEndWeek(item.zcd),
    // 解析星期几
    dayOfWeek: parseInt(item.xqj) || 1,
    // 解析节次信息
    startSection: parseStartSection(item.jc),
    endSection: parseEndSection(item.jc),
    // 默认为全部周
    weekType: 'all' as const,
    // 生成颜色
    color: generateColor(index)
  })).filter((course: any) => {
    // 筛选当前周的课程
    return course.startWeek <= currentWeek.value && course.endWeek >= currentWeek.value
  })
})

// 辅助函数：解析开始周
function parseStartWeek(weekStr: string): number {
  if (!weekStr) return 1
  // 简单解析，实际可能需要更复杂的逻辑
  const match = weekStr.match(/^(\d+)/)
  return match ? parseInt(match[1]) : 1
}

// 辅助函数：解析结束周
function parseEndWeek(weekStr: string): number {
  if (!weekStr) return 16
  // 简单解析，实际可能需要更复杂的逻辑
  const match = weekStr.match(/(\d+)[^\d]*$/)
  return match ? parseInt(match[1]) : 16
}

// 辅助函数：解析开始节次
function parseStartSection(sectionStr: string): number {
  if (!sectionStr) return 1
  // 简单解析，实际可能需要更复杂的逻辑
  const match = sectionStr.match(/^(\d+)/)
  return match ? parseInt(match[1]) : 1
}

// 辅助函数：解析结束节次
function parseEndSection(sectionStr: string): number {
  if (!sectionStr) return 1
  // 简单解析，实际可能需要更复杂的逻辑
  const match = sectionStr.match(/(\d+)[^\d]*$/)
  return match ? parseInt(match[1]) : 1
}

// 辅助函数：生成颜色
function generateColor(index: number): string {
  const colors = [
    '#f05261', '#48a8e4', '#ffd061', '#52db9a', '#70d3e6',
    '#3f51b5', '#f3d147', '#4adbc3', '#673ab7', '#f3db49',
    '#76bfcd', '#b495e1', '#ff9800', '#8bc34a', '#e91e63'
  ]
  return colors[index % colors.length]
}
</script>

<style scoped>
div.home-view {
  padding: 20px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.timetable-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}
</style>