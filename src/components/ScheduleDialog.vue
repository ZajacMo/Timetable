<template>
  <div class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h3>{{ isEditMode ? '编辑日程' : '添加日程' }}</h3>
        <button class="close-button" @click="$emit('cancel')">×</button>
      </div>
      
      <div class="dialog-body">
        <form @submit.prevent="handleSubmit">
          <!-- 日程标题 -->
          <div class="form-group">
            <label for="schedule-title">标题 *</label>
            <input
              id="schedule-title"
              v-model="formData.title"
              type="text"
              placeholder="请输入日程标题"
              required
            >
          </div>

          <!-- 日程描述 -->
          <div class="form-group">
            <label for="schedule-description">描述</label>
            <textarea
              id="schedule-description"
              v-model="formData.description"
              placeholder="请输入日程描述"
              rows="3"
            ></textarea>
          </div>

          <!-- 是否全天 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.isAllDay"
                type="checkbox"
              >
              全天日程
            </label>
          </div>

          <!-- 开始时间/结束时间 -->
          <div v-if="!formData.isAllDay" class="form-row">
            <div class="form-group">
              <label for="start-time">开始时间 *</label>
              <input
                id="start-time"
                v-model="formData.startTime"
                type="datetime-local"
                required
              >
            </div>
            <div class="form-group">
              <label for="end-time">结束时间 *</label>
              <input
                id="end-time"
                v-model="formData.endTime"
                type="datetime-local"
                required
              >
            </div>
          </div>

          <!-- 开始日期/结束日期 (全天日程) -->
          <div v-else class="form-row">
            <div class="form-group">
              <label for="start-date">开始日期 *</label>
              <input
                id="start-date"
                v-model="formData.startDate"
                type="date"
                required
              >
            </div>
            <div class="form-group">
              <label for="end-date">结束日期 *</label>
              <input
                id="end-date"
                v-model="formData.endDate"
                type="date"
                required
              >
            </div>
          </div>

          <!-- 颜色选择 -->
          <div class="form-group">
            <label>颜色</label>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                class="color-option"
                :class="{ 'selected': formData.color === color }"
                :style="{ backgroundColor: color }"
                @click="formData.color = color"
              ></button>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('cancel')">
              取消
            </button>
            <button type="submit" class="btn-submit">
              {{ isEditMode ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Schedule } from '@/types/schedule'

// Props
const props = defineProps<{
  schedule?: Partial<Schedule>
}>()

// Emits
const emit = defineEmits<{
  save: [schedule: Omit<Schedule, 'id'>]
  cancel: []
}>()

// 响应式数据
const formData = ref<{
  title: string
  description?: string
  isAllDay?: boolean
  startTime?: string
  endTime?: string
  startDate?: string
  endDate?: string
  color?: string
}>({
  title: '',
  description: '',
  isAllDay: false,
  startTime: formatDateTime(new Date()),
  endTime: formatDateTime(getEndTime(new Date())),
  startDate: formatDate(new Date()),
  endDate: formatDate(new Date()),
  color: ''
})

const isEditMode = ref(false)

// 颜色选项
const colorOptions = [
  '#f05261', '#48a8e4', '#ffd061', '#52db9a', '#70d3e6',
  '#3f51b5', '#f3d147', '#4adbc3', '#673ab7', '#f3db49',
  '#76bfcd', '#b495e1', '#ff9800', '#8bc34a', '#e91e63'
]

// 方法
function formatDateTime(date: Date): string {
  // 格式化日期时间为YYYY-MM-DDTHH:MM格式
  return date.toISOString().slice(0, 16)
}

function formatDate(date: Date): string {
  // 格式化日期为YYYY-MM-DD格式
  return date.toISOString().slice(0, 10)
}

function getEndTime(startTime: Date): Date {
  // 计算结束时间（开始时间加1小时）
  const endTime = new Date(startTime)
  endTime.setHours(endTime.getHours() + 1)
  return endTime
}

// 监听props变化，更新表单数据
watch(
  () => props.schedule,
  (newSchedule) => {
    if (newSchedule) {
      const isAllDay = newSchedule.isAllDay || false
      const startTime = newSchedule.startDate ? new Date(newSchedule.startDate) : new Date()
      const endTime = newSchedule.endDate ? new Date(newSchedule.endDate) : getEndTime(startTime)
      
      formData.value = {
        title: newSchedule.title || '',
        description: newSchedule.description,
        isAllDay,
        startTime: isAllDay ? undefined : formatDateTime(startTime),
        endTime: isAllDay ? undefined : formatDateTime(endTime),
        startDate: isAllDay ? formatDate(startTime) : undefined,
        endDate: isAllDay ? formatDate(endTime) : undefined,
        color: newSchedule.color || ''
      }
      
      isEditMode.value = !!newSchedule.id
    }
  },
  { immediate: true }
)

// 监听全天日程切换，更新时间格式
watch(
  () => formData.value.isAllDay,
  (isAllDay) => {
    const now = new Date()
    if (isAllDay) {
      formData.value.startTime = undefined
      formData.value.endTime = undefined
      formData.value.startDate = formatDate(now)
      formData.value.endDate = formatDate(now)
    } else {
      formData.value.startDate = undefined
      formData.value.endDate = undefined
      formData.value.startTime = formatDateTime(now)
      formData.value.endTime = formatDateTime(getEndTime(now))
    }
  }
)

// 表单提交处理
const handleSubmit = () => {
  // 验证数据
  if (!formData.value.title) {
    alert('请输入日程标题')
    return
  }
  
  let startTime: Date
  let endTime: Date
  
  if (formData.value.isAllDay) {
    // 全天日程
    if (!formData.value.startDate || !formData.value.endDate) {
      alert('请选择开始日期和结束日期')
      return
    }
    
    startTime = new Date(formData.value.startDate)
    startTime.setHours(0, 0, 0, 0)
    
    endTime = new Date(formData.value.endDate)
    endTime.setHours(23, 59, 59, 999)
  } else {
    // 非全天日程
    if (!formData.value.startTime || !formData.value.endTime) {
      alert('请选择开始时间和结束时间')
      return
    }
    
    startTime = new Date(formData.value.startTime)
    endTime = new Date(formData.value.endTime)
    
    // 验证结束时间是否晚于开始时间
    if (endTime <= startTime) {
      alert('结束时间必须晚于开始时间')
      return
    }
  }
  
  // 创建日程对象
  const schedule: Omit<Schedule, 'id'> = {
    title: formData.value.title,
    description: formData.value.description || '',
    startDate: startTime,
    endDate: endTime,
    isAllDay: formData.value.isAllDay || false,
    color: formData.value.color || ''
  }
  
  // 提交数据
  emit('save', schedule)
}

const handleOverlayClick = () => {
  emit('cancel')
}
</script>

<style scoped>
/* 对话框覆盖层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* 对话框内容 */
.dialog-content {
  background-color: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 对话框主体 */
.dialog-body {
  padding: 20px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

input[type="text"],
input[type="date"],
input[type="datetime-local"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

/* 复选框标签 */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: auto;
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.1);
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-submit {
  background-color: #00a2ae;
  color: white;
}

.btn-submit:hover {
  background-color: #008c94;
}

/* 深色模式 */
.dark-mode .dialog-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark-mode .dialog-header {
  border-bottom-color: #444;
}

.dark-mode .dialog-header h3 {
  color: #fff;
}

.dark-mode label {
  color: #ccc;
}

.dark-mode input[type="text"],
.dark-mode input[type="date"],
.dark-mode input[type="datetime-local"],
.dark-mode textarea {
  background-color: #3d3d3d;
  border-color: #555;
  color: #fff;
}

.dark-mode .btn-cancel {
  background-color: #444;
  color: #ccc;
}

.dark-mode .btn-cancel:hover {
  background-color: #555;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-overlay {
    padding: 10px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .color-picker {
    justify-content: center;
  }
}
</style>