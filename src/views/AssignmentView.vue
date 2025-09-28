<template>
  <div class="assignment-view">
    <div class="page-header">
      <h2>作业管理</h2>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="筛选状态" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="all"></el-option>
          <el-option label="待提交" value="pending"></el-option>
          <el-option label="已提交" value="submitted"></el-option>
          <el-option label="已逾期" value="late"></el-option>
        </el-select>
        <el-button type="primary" @click="showAddDialog">
          <i class="el-icon-plus"></i> 添加作业
        </el-button>
      </div>
    </div>
    
    <!-- 即将截止的作业提醒 -->
    <div v-if="upcomingAssignments.length > 0" class="upcoming-alert">
      <el-alert 
        title="有 {{ upcomingAssignments.length }} 项作业即将截止" 
        type="warning" 
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="upcoming-list">
            <span 
              v-for="(assignment, index) in upcomingAssignments.slice(0, 3)" 
              :key="assignment.id"
              class="upcoming-item"
              @click="showAssignmentDetail(assignment)"
            >
              {{ getCourseName(assignment.courseId) }} ({{ formatShortDeadline(assignment.deadline) }})
              <el-button v-if="index < 2 && upcomingAssignments.length > 3" type="text" size="small">...</el-button>
            </span>
          </div>
        </template>
      </el-alert>
    </div>
    
    <!-- 作业列表 -->
    <assignment-list 
      :assignments="assignments" 
      :courses="courses"
      :filter-status="statusFilter"
      @add-assignment="showAddDialog"
      @view-assignment="showAssignmentDetail"
      @edit-assignment="showEditDialog"
      @delete-assignment="handleDeleteAssignment"
      @submit-assignment="handleSubmitAssignment"
    />
    
    <!-- 添加/编辑作业对话框 -->
    <assignment-dialog 
      :visible="isDialogVisible"
      :edit-assignment="currentEditAssignment"
      :courses="courses"
      @close="closeDialog"
      @submit="handleDialogSubmit"
    />
    
    <!-- 作业详情对话框 -->
    <assignment-detail-dialog 
      :visible="isDetailDialogVisible"
      :assignment="currentDetailAssignment"
      :courses="courses"
      @close="closeDetailDialog"
      @submit="handleSubmitAssignment"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '../stores/courses';
import { useAssignmentStore } from '../stores/assignment';
import type { Assignment } from '../core/types';
import { CourseDataProcessor } from '../core/courseDataProcessor';
import AssignmentList from '../components/AssignmentList.vue';
import AssignmentDialog from '../components/AssignmentDialog.vue';
import AssignmentDetailDialog from '../components/AssignmentDetailDialog.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'AssignmentView',
  components: {
    AssignmentList,
    AssignmentDialog,
    AssignmentDetailDialog
  },
  setup() {
    const coursesStore = useCoursesStore();
    const assignmentStore = useAssignmentStore(); // 假设存在这个store
    
    const { courses } = storeToRefs(coursesStore);
    const { assignments } = storeToRefs(assignmentStore);
    
    // 状态筛选
    const statusFilter = ref<'pending' | 'submitted' | 'late' | 'all'>('all');
    
    // 对话框状态
    const isDialogVisible = ref(false);
    const currentEditAssignment = ref<Assignment | null>(null);
    
    const isDetailDialogVisible = ref(false);
    const currentDetailAssignment = ref<Assignment | null>(null);
    
    // 计算即将截止的作业
    const upcomingAssignments = computed(() => {
      return CourseDataProcessor.getUpcomingAssignments(assignments.value, 3);
    });
    
    // 初始化数据
    onMounted(async () => {
      coursesStore.initialize();
      assignmentStore.initialize();
    });
    
    // 根据课程ID获取课程名称
    const getCourseName = (courseId: string): string => {
      const course = courses.value.find(c => c.id === courseId);
      return course ? course.name : '未知课程';
    };
    
    // 格式化简短的截止日期
    const formatShortDeadline = (deadline: Date | string): string => {
      const date = new Date(deadline);
      const now = new Date();
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '明天';
      } else if (diffDays === 2) {
        return '后天';
      } else if (diffDays < 7) {
        return `${diffDays}天后`;
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    };
    
    // 显示添加对话框
    const showAddDialog = () => {
      currentEditAssignment.value = null;
      isDialogVisible.value = true;
    };
    
    // 显示编辑对话框
    const showEditDialog = (assignment: Assignment) => {
      currentEditAssignment.value = { ...assignment };
      isDialogVisible.value = true;
    };
    
    // 关闭对话框
    const closeDialog = () => {
      isDialogVisible.value = false;
      currentEditAssignment.value = null;
    };
    
    // 显示作业详情
    const showAssignmentDetail = (assignment: Assignment) => {
      currentDetailAssignment.value = assignment;
      isDetailDialogVisible.value = true;
    };
    
    // 关闭详情对话框
    const closeDetailDialog = () => {
      isDetailDialogVisible.value = false;
      currentDetailAssignment.value = null;
    };
    
    // 处理对话框提交
    const handleDialogSubmit = async (assignmentData: Assignment) => {
      try {
        if (assignmentData.id) {
          // 编辑作业
          const { id, ...updateData } = assignmentData;
          await assignmentStore.updateAssignment(id, updateData);
          ElMessage.success('作业更新成功');
        } else {
          // 添加作业
          await assignmentStore.addAssignment(assignmentData);
          ElMessage.success('作业添加成功');
        }
        closeDialog();
      } catch (error) {
        console.error('处理作业失败:', error);
        ElMessage.error('处理作业失败，请重试');
      }
    };
    
    // 处理删除作业
    const handleDeleteAssignment = async (assignmentId: string) => {
      try {
        await ElMessageBox.confirm('确定要删除该作业吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await assignmentStore.deleteAssignment(assignmentId);
        ElMessage.success('作业删除成功');
      } catch (error) {
        // 用户取消删除
        if (error !== 'cancel') {
          console.error('删除作业失败:', error);
          ElMessage.error('删除作业失败，请重试');
        }
      }
    };
    
    // 处理提交作业
    const handleSubmitAssignment = async (assignmentId: string) => {
      try {
        await assignmentStore.updateAssignmentStatus(assignmentId, 'submitted');
        ElMessage.success('作业标记为已提交');
        // 如果详情对话框打开，则关闭
        if (isDetailDialogVisible.value && currentDetailAssignment.value?.id === assignmentId) {
          closeDetailDialog();
        }
      } catch (error) {
        console.error('提交作业失败:', error);
        ElMessage.error('提交作业失败，请重试');
      }
    };
    
    return {
      courses,
      assignments,
      statusFilter,
      isDialogVisible,
      currentEditAssignment,
      isDetailDialogVisible,
      currentDetailAssignment,
      upcomingAssignments,
      getCourseName,
      formatShortDeadline,
      showAddDialog,
      showEditDialog,
      closeDialog,
      showAssignmentDetail,
      closeDetailDialog,
      handleDialogSubmit,
      handleDeleteAssignment,
      handleSubmitAssignment
    };
  }
});
</script>

<style scoped>
.assignment-view {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.upcoming-alert {
  margin-bottom: 20px;
}

.upcoming-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.upcoming-item {
  padding: 4px 8px;
  background-color: #fff9e6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #ad8b00;
  cursor: pointer;
  transition: all 0.3s;
}

.upcoming-item:hover {
  background-color: #fff1c2;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .assignment-view {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .upcoming-list {
    flex-direction: column;
  }
}
</style>