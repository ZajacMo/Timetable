<template>
  <div class="schedule-view">
    <h2>日程安排</h2>
    
    <!-- 日期选择器 -->
    <div class="date-selector">
      <button @click="changeDate(-1)">←</button>
      <span class="selected-date">{{ formatDate(selectedDate) }}</span>
      <button @click="changeDate(1)">→</button>
    </div>

    <!-- 日程列表 -->
    <div class="schedule-list">
      <div v-if="daySchedules.length === 0" class="no-schedules">
        <p>暂无日程安排</p>
      </div>
      <div v-else class="schedule-items">
        <div
          v-for="schedule in daySchedules"
          :key="schedule.id"
          class="schedule-item"
          :style="{ borderLeftColor: schedule.color || '#00a2ae' }"
        >
          <div class="schedule-time">
            {{ formatTime(schedule.startDate) }} - {{ formatTime(schedule.endDate) }}
          </div>
          <div class="schedule-content">
            <h3 class="schedule-title">{{ schedule.title }}</h3>
            <p class="schedule-description" v-if="schedule.description">
              {{ schedule.description }}
            </p>
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
import ScheduleDialog from '@/components/ScheduleDialog.vue'
import { Schedule } from '@/types/schedule'

const scheduleStore = useScheduleStore()

// 响应式数据
const showAddScheduleDialog = ref(false)
const selectedDate = ref(new Date())

// 计算属性
const daySchedules = computed(() => {
  return scheduleStore.getSchedulesForDate(selectedDate.value)
})

// 方法
const changeDate = (delta: number) => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + delta)
  selectedDate.value = newDate
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  const dayOfWeek = dayNames[date.getDay()]
  return `${year}-${month}-${day} 星期${dayOfWeek}`
}

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
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
}

.schedule-view h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* 日期选择器 */
.date-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date-selector button {
  background-color: #00a2ae;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.selected-date {
  font-size: 18px;
  font-weight: 600;
}

/* 日程列表 */
.schedule-list {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-schedules {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.schedule-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-item {
  display: flex;
  padding: 15px;
  border-left: 4px solid #00a2ae;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.schedule-time {
  min-width: 100px;
  text-align: center;
  font-weight: 600;
  color: #666;
  padding-right: 15px;
  border-right: 1px solid #eee;
}

.schedule-content {
  flex: 1;
  padding-left: 15px;
}

.schedule-title {
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
}

.schedule-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 添加日程按钮 */
.add-schedule-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background-color: #00a2ae;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 162, 174, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>