<template>
  <div class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h3>{{ isEditMode ? '编辑课程' : '添加课程' }}</h3>
        <button class="close-button" @click="$emit('cancel')">×</button>
      </div>
      
      <div class="dialog-body">
        <form @submit.prevent="handleSubmit">
          <!-- 课程名称 -->
          <div class="form-group">
            <label for="course-name">课程名称 *</label>
            <input
              id="course-name"
              v-model="formData.name"
              type="text"
              placeholder="请输入课程名称"
              required
            >
          </div>

          <!-- 教师 -->
          <div class="form-group">
            <label for="course-teacher">教师</label>
            <input
              id="course-teacher"
              v-model="formData.teacher"
              type="text"
              placeholder="请输入教师姓名"
            >
          </div>

          <!-- 教室 -->
          <div class="form-group">
            <label for="course-classroom">教室</label>
            <input
              id="course-classroom"
              v-model="formData.classroom"
              type="text"
              placeholder="请输入教室信息"
            >
          </div>

          <!-- 开始周/结束周 -->
          <div class="form-row">
            <div class="form-group">
              <label for="start-week">开始周 *</label>
              <input
                id="start-week"
                v-model.number="formData.startWeek"
                type="number"
                min="1"
                max="52"
                required
              >
            </div>
            <div class="form-group">
              <label for="end-week">结束周 *</label>
              <input
                id="end-week"
                v-model.number="formData.endWeek"
                type="number"
                min="1"
                max="52"
                required
              >
            </div>
          </div>

          <!-- 星期几 -->
          <div class="form-group">
            <label>星期几 *</label>
            <div class="radio-group">
              <label v-for="day in dayOptions" :key="day.value" class="radio-label">
                <input
                  v-model="formData.dayOfWeek"
                  type="radio"
                  :value="day.value"
                  required
                >
                {{ day.label }}
              </label>
            </div>
          </div>

          <!-- 开始节次/结束节次 -->
          <div class="form-row">
            <div class="form-group">
              <label for="start-section">开始节次 *</label>
              <input
                id="start-section"
                v-model.number="formData.startSection"
                type="number"
                min="1"
                max="20"
                required
              >
            </div>
            <div class="form-group">
              <label for="end-section">结束节次 *</label>
              <input
                id="end-section"
                v-model.number="formData.endSection"
                type="number"
                min="1"
                max="20"
                required
              >
            </div>
          </div>

          <!-- 周类型 -->
          <div class="form-group">
            <label>周类型 *</label>
            <div class="radio-group">
              <label v-for="type in weekTypeOptions" :key="type.value" class="radio-label">
                <input
                  v-model="formData.weekType"
                  type="radio"
                  :value="type.value"
                  required
                >
                {{ type.label }}
              </label>
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
import { Course } from '@/types/course'

// Props
const props = defineProps<{
  course?: Partial<Course>
}>()

// Emits
const emit = defineEmits<{
  save: [course: Omit<Course, 'id'>]
  cancel: []
}>()

// 响应式数据
const formData = ref<Partial<Course>>({
  name: '',
  teacher: '',
  classroom: '',
  startWeek: 1,
  endWeek: 16,
  dayOfWeek: 1,
  startSection: 1,
  endSection: 2,
  weekType: 'all',
  color: ''
})

const isEditMode = ref(false)

// 选项数据
const dayOptions = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

const weekTypeOptions = [
  { value: 'all', label: '全部周' },
  { value: 'odd', label: '单周' },
  { value: 'even', label: '双周' }
]

const colorOptions = [
  '#f05261', '#48a8e4', '#ffd061', '#52db9a', '#70d3e6',
  '#3f51b5', '#f3d147', '#4adbc3', '#673ab7', '#f3db49',
  '#76bfcd', '#b495e1', '#ff9800', '#8bc34a', '#e91e63'
]

// 监听props变化，更新表单数据
watch(
  () => props.course,
  (newCourse) => {
    if (newCourse) {
      formData.value = { ...newCourse }
      isEditMode.value = !!newCourse.id
    }
  },
  { immediate: true }
)

// 方法
const handleSubmit = () => {
  // 验证数据
  if (!formData.value.name) {
    alert('请输入课程名称')
    return
  }
  
  if (!formData.value.startWeek || !formData.value.endWeek) {
    alert('请输入开始周和结束周')
    return
  }
  
  if (formData.value.startWeek > formData.value.endWeek) {
    alert('开始周不能大于结束周')
    return
  }
  
  if (!formData.value.dayOfWeek) {
    alert('请选择星期几')
    return
  }
  
  if (!formData.value.startSection || !formData.value.endSection) {
    alert('请输入开始节次和结束节次')
    return
  }
  
  if (formData.value.startSection > formData.value.endSection) {
    alert('开始节次不能大于结束节次')
    return
  }
  
  if (!formData.value.weekType) {
    alert('请选择周类型')
    return
  }
  
  // 创建课程对象
  const course: Omit<Course, 'id'> = {
    name: formData.value.name || '',
    teacher: formData.value.teacher || '',
    classroom: formData.value.classroom || '',
    startWeek: formData.value.startWeek || 1,
    endWeek: formData.value.endWeek || 16,
    dayOfWeek: formData.value.dayOfWeek || 1,
    startSection: formData.value.startSection || 1,
    endSection: formData.value.endSection || 2,
    weekType: formData.value.weekType || 'all',
    color: formData.value.color || ''
  }
  
  // 提交数据
  emit('save', course)
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
input[type="number"],
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  margin-right: 5px;
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
.dark-mode input[type="number"],
.dark-mode select {
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
  
  .radio-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .color-picker {
    justify-content: center;
  }
}
</style>