<template>
  <div class="course-detail">
    <div class="course-detail-header">
      <h2>课程详情</h2>
      <div style="display: flex; gap: 10px;">
        <el-button type="primary" @click="$router.back()">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="course" class="course-info-card">
      <div class="course-name-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>{{ course.name }}</h3>
          <el-button type="primary" size="small" @click="openAddAssignmentDialog">
            添加作业
          </el-button>
        </div>
        <div class="course-basic-info">
          <span class="course-teacher">教师：{{ course.teacher || '未设置' }}</span>
          <span class="course-classroom">教室：{{ course.classroom || '未设置' }}</span>
        </div>
      </div>
      
      <div class="course-details">
        <div class="detail-item">
          <span class="detail-label">上课时间：</span>
          <span class="detail-value">{{ getCourseSchedule() }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">上课周次：</span>
          <span class="detail-value">{{ course.zcd || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">课程类型：</span>
          <span class="detail-value">{{ course.kclb || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">学分：</span>
          <span class="detail-value">{{ course.xf || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">课程代码：</span>
          <span class="detail-value">{{ course.id || '未设置' }}</span>
        </div>
      </div>
      
      <!-- 显示所有时间段 -->
      <div v-if="allSchedules && allSchedules.length > 1" class="all-schedules">
        <h4>所有上课时间：</h4>
        <div v-for="(schedule, index) in allSchedules" :key="index" class="schedule-item">
          <span>{{ index + 1 }}. {{ getScheduleText(schedule) }}</span>
        </div>
      </div>
    </el-card>
    
    <div v-else class="no-course">
      <el-empty description="暂无课程信息"></el-empty>
    </div>

    <!-- 作业对话框 -->
    <AssignmentDialog
      v-if="course"
      ref="assignmentDialogRef"
      v-model="showAssignmentDialog"
      :mode="assignmentDialogMode"
      :assignment="selectedAssignment"
      :course-id="course.id.toString()"
      :course-name="course.name"
      @close="showAssignmentDialog = false"
      @submit="handleAssignmentSubmit"
    />
    
    <!-- 作业列表 -->
    <el-card v-if="course && courseAssignments.length > 0" class="assignments-card">
      <template #header>
        <div class="card-header">
          <span>作业列表</span>
        </div>
      </template>
      <div class="assignments-list">
        <div v-for="assignment in courseAssignments" :key="assignment.id" class="assignment-item" @click="showAssignmentDetail(assignment)">
        <div class="assignment-content">{{ assignment.content }}</div>
        <div class="assignment-meta">
          <span class="assignment-deadline">
            截止日期：{{ formatAssignmentDeadline(assignment.deadline) }}
          </span>
          <el-tag :type="getStatusType(assignment.status)">
            {{ getStatusText(assignment.status) }}
          </el-tag>
        </div>
      </div>
      </div>
    </el-card>
    
    <el-empty v-else-if="course" description="暂无作业信息" />
    
    <!-- 作业详情对话框 -->
    <AssignmentDetailDialog
      v-model="isDetailDialogVisible"
      :assignment="currentDetailAssignment"
      :courses="course ? [course] : []"
      @close="closeDetailDialog"
      @submit="handleAssignmentMarkSubmitted"
      @edit="handleEditAssignment"
      @delete="handleAssignmentDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import processedCourses from '@/../processedCourses.json'
import AssignmentDialog from '@/components/AssignmentDialog.vue'
import AssignmentDetailDialog from '@/components/AssignmentDetailDialog.vue'
import { useScheduleStore } from '@/stores/schedule'
import { useAssignmentStore } from '@/stores/assignment'
import { CourseDataProcessor } from '@/core/courseDataProcessor'
import { ElMessage } from 'element-plus'

// 定义课程接口
interface Course {
  id: string | number;
  name: string;
  teacher?: string;
  classroom?: string;
  dayOfWeek: number;
  startSection: number;
  endSection: number;
  zcd?: string;
  kclb?: string;
  xf?: string;
  jc?: string;
  xqjmc?: string;
  [key: string]: any;
}

interface CourseSchedule {
  jc: string;
  xqj: string;
  xqjmc: string;
  cdmc: string;
  zcd: string;
  [key: string]: any;
}

const route = useRoute()
const course = ref<Course | null>(null)
const allSchedules = ref<CourseSchedule[]>([])

// 作业对话框相关状态
  const showAssignmentDialog = ref(false)
  const assignmentDialogMode = ref<'add' | 'edit'>('add')
  const selectedAssignment = ref<any>(null)
  // 作业详情对话框相关状态
  const isDetailDialogVisible = ref(false)
  const currentDetailAssignment = ref<any>(null)
const assignmentDialogRef = ref<InstanceType<typeof AssignmentDialog>>()

// 课程相关状态和方法
const scheduleStore = useScheduleStore()
const assignmentStore = useAssignmentStore()

// 课程ID从路由参数中获取
const courseId = route.query.id

// 初始化课程作业列表
const courseAssignments = ref<any[]>([])

  // 重命名为避免函数名重复
  const handleAssignmentSubmitNew = async (assignmentData: any) => {
    try {
      // 添加作业到assignment store
      console.log('提交新作业数据:', assignmentData);
      await assignmentStore.addAssignment({
        ...assignmentData,
        courseId: course.value?.id.toString(),
        courseName: course.value?.name,
        status: 'pending'
      })
      
      // 将作业截止日期添加到日程表
      await scheduleStore.addSchedule({
        title: `作业截止: ${assignmentData.content}`,
        startDate: new Date(assignmentData.deadline),
        endDate: new Date(assignmentData.deadline),
        description: `课程: ${course.value?.name}`,
        isAllDay: false,
        color: '#f05261'
      })
      
      // 显示成功提示
      ElMessage.success('作业创建成功！')
      // 关闭对话框
      showAssignmentDialog.value = false
      // 刷新作业列表
      loadCourseAssignments()
    } catch (error) {
      console.error('保存作业失败:', error)
      ElMessage.error('作业创建失败，请重试')
    }
  }
  
  // 格式化作业截止日期
  const formatAssignmentDeadline = (deadline: string | Date) => {
    return CourseDataProcessor.formatAssignmentDeadline(
      typeof deadline === 'string' ? new Date(deadline) : deadline
    )
  }
  
  // 获取作业状态样式
  const getStatusType = (status: string) => {
    switch (status) {
      case 'pending':
        return ''
      case 'submitted':
        return 'success'
      case 'late':
        return 'danger'
      default:
        return ''
    }
  }
  
  // 获取作业状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待提交'
      case 'submitted':
        return '已提交'
      case 'late':
        return '已逾期'
      default:
        return status
    }
  }

// 根据ID从processedCourses.json获取课程详情
const getCourseDetail = () => {
  if (courseId) {
    // 遍历所有课程
    for (const mainCourse of processedCourses.courses) {
      // 如果课程号匹配
      if (mainCourse.kch === courseId) {
        // 保存所有时间段
        allSchedules.value = mainCourse.courseSchedules
        
        // 查找与路由参数中可能包含的具体时间段匹配的课程
        const scheduleQuery = route.query.schedule
        let targetSchedule: CourseSchedule | undefined
        
        if (scheduleQuery && typeof scheduleQuery === 'string') {
          // 如果提供了具体时间段，查找匹配的时间段
          targetSchedule = mainCourse.courseSchedules.find((schedule: CourseSchedule) => 
            `${schedule.xqj}-${schedule.jc}` === scheduleQuery
          )
        }
        
        // 如果没找到匹配的时间段或没有提供，使用第一个时间段
        targetSchedule = targetSchedule || mainCourse.courseSchedules[0]
        
        // 设置课程信息
        if (targetSchedule) {
          course.value = {
            id: mainCourse.kch,
            name: mainCourse.kcmc,
            teacher: mainCourse.xm,
            classroom: targetSchedule.cdmc,
            dayOfWeek: parseInt(targetSchedule.xqj),
            startSection: parseInt(targetSchedule.jc.match(/(\d+)/)?.[1] || '1'),
            endSection: parseInt(targetSchedule.jc.match(/-(\d+)/)?.[1] || targetSchedule.jc.match(/(\d+)/)?.[1] || '1'),
            zcd: targetSchedule.zcd,
            kclb: mainCourse.kclb,
            xf: mainCourse.xf,
            jc: targetSchedule.jc,
            xqjmc: targetSchedule.xqjmc
          }
        }
        
        break
      }
    }
    
    if (!course.value) {
      console.warn('课程未找到:', courseId)
    }
  }
}

// 获取课程上课时间文本
const getCourseSchedule = () => {
  if (!course.value) return ''
  
  const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const dayName = course.value.xqjmc || dayNames[course.value.dayOfWeek] || '未知'
  
  return `${dayName} ${course.value.jc}`
}

// 获取单个时间段的文本
const getScheduleText = (schedule: CourseSchedule) => {
  return `${schedule.xqjmc} ${schedule.jc} ${schedule.cdmc} (${schedule.zcd})`
}

// 打开添加作业对话框
const openAddAssignmentDialog = () => {
  assignmentDialogMode.value = 'add'
  selectedAssignment.value = null
  showAssignmentDialog.value = true
  // console.log('openAddAssignmentDialog', assignmentDialogRef.value)
  // 如果ref已经绑定，可以直接调用show方法确保显示
  if (assignmentDialogRef.value) {
    assignmentDialogRef.value.show()
  }
}

// 显示作业详情
const showAssignmentDetail = (assignment: any) => {
  currentDetailAssignment.value = assignment
  isDetailDialogVisible.value = true
}

// 关闭详情对话框
const closeDetailDialog = () => {
  isDetailDialogVisible.value = false
  currentDetailAssignment.value = null
}

// 处理 AssignmentDialog 提交事件
const handleAssignmentSubmit = async (assignmentData: any) => {
  try {
    if (assignmentDialogMode.value === 'edit') {
      await handleAssignmentUpdate(assignmentData)
    } else {
      await handleAssignmentSubmitNew(assignmentData)
    }
  } catch (error) {
    console.error('处理作业提交失败:', error)
  }
}

// 处理作业标记为已提交
const handleAssignmentMarkSubmitted = async (assignmentId: string) => {
  try {
    await assignmentStore.updateAssignment(assignmentId, {
      status: 'submitted'
    })
    
    ElMessage.success('作业状态已更新！')
    closeDetailDialog()
    loadCourseAssignments() // 刷新作业列表
  } catch (error) {
    console.error('更新作业状态失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 处理编辑作业
const handleEditAssignment = (assignment: any) => {
  // 关闭详情对话框
  closeDetailDialog()
  
  // 打开编辑对话框
  assignmentDialogMode.value = 'edit'
  selectedAssignment.value = { ...assignment }
  showAssignmentDialog.value = true
  
  // 如果ref已经绑定，可以直接调用show方法确保显示
  if (assignmentDialogRef.value) {
    assignmentDialogRef.value.show()
  }
}

// 处理删除作业
const handleAssignmentDelete = async (assignmentId: string) => {
  try {
    await assignmentStore.deleteAssignment(assignmentId)
    ElMessage.success('作业已成功删除！')
    closeDetailDialog()
    loadCourseAssignments() // 刷新作业列表
  } catch (error) {
    console.error('删除作业失败:', error)
    ElMessage.error('删除作业失败，请重试')
  }
}

// 处理更新作业
const handleAssignmentUpdate = async (assignmentData: any) => {
  try {
    // 使用updateAssignment而不是addAssignment来更新现有作业
    console.log('更新作业数据:', assignmentData);
    await assignmentStore.updateAssignment(assignmentData.id, {
      ...assignmentData,
      courseId: course.value?.id.toString()
    })
    
    ElMessage.success('作业已成功更新！')
    showAssignmentDialog.value = false
    loadCourseAssignments() // 刷新作业列表
  } catch (error) {
    console.error('更新作业失败:', error)
    ElMessage.error('更新作业失败，请重试')
  }
}

// 获取课程作业
  const loadCourseAssignments = () => {
    if (course.value && course.value.id) {
      try {
        // getAssignmentsByCourseId is a computed property that returns a function
        const assignments = assignmentStore.getAssignmentsByCourseId(course.value.id.toString())
        courseAssignments.value = assignments
      } catch (error) {
        console.error('获取课程作业失败:', error)
      }
    }
  }

  // 组件挂载时获取课程详情和作业
    onMounted(() => {
      getCourseDetail()
      // 确保在获取课程详情后加载作业
      setTimeout(() => {
        loadCourseAssignments()
      }, 100)
    })
</script>

<style scoped>
.course-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.course-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-detail-header h2 {
  margin: 0;
  color: #303133;
}

.course-info-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.course-name-section {
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.course-name-section h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.course-basic-info {
  display: flex;
  gap: 20px;
}

.course-teacher,
.course-classroom {
  color: #606266;
  font-size: 14px;
}

.course-details {
  padding-top: 16px;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #909399;
  font-size: 14px;
  width: 80px;
}

.detail-value {
  color: #303133;
  font-size: 14px;
  flex: 1;
}

.no-course {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-detail {
    padding: 10px;
  }
  
  .course-basic-info {
    flex-direction: column;
    gap: 5px;
  }
}

/* 作业列表样式 */
.assignments-card {
  margin-top: 20px;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assignment-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #00a2ae;
  cursor: pointer;
  transition: all 0.3s ease;
}

.assignment-item:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.assignment-content {
  font-size: 16px;
  margin-bottom: 8px;
  word-break: break-word;
}

.assignment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.assignment-deadline {
  font-size: 13px;
}
  </style>