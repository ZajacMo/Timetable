<template>
  <div class="home-view">
    <!-- 课程表内容 -->
    <div class="timetable-container">
      <TimetableView
        :courses="filteredCourses"
        :currentWeek="currentWeek"
        @courseClick="onCourseClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { useSemesterStore } from '@/stores/semester'
import TimetableView from '@/components/TimetableView.vue'
import { Course } from '@/types/course'

const coursesStore = useCoursesStore()
const semesterStore = useSemesterStore()

// 计算属性
const currentWeek = computed(() => semesterStore.currentWeek)
const filteredCourses = computed(() => {
  return coursesStore.getCoursesForWeek(currentWeek.value)
})

// 方法
const onCourseClick = (course: Course) => {
  console.log('点击课程:', course)
  // 这里可以实现编辑课程的功能
}
</script>

<style scoped>
.home-view {
  padding: 20px 0;
}

.timetable-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}
</style>