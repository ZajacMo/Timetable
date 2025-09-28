<template>
  <div class="assignment-list">
    <div class="assignment-list-header">
      <h3>{{ title }}</h3>
      <el-button type="primary" size="small" @click="$emit('add-assignment')">
        <i class="el-icon-plus"></i> 添加作业
      </el-button>
    </div>
    
    <div class="assignment-list-content">
      <div v-if="assignments.length === 0" class="empty-message">
        <el-empty description="暂无作业"></el-empty>
      </div>
      
      <el-timeline v-else>
        <el-timeline-item 
          v-for="assignment in sortedAssignments" 
          :key="assignment.id"
          :timestamp="formatDeadline(assignment.deadline)"
          placement="top"
        >
          <el-card class="assignment-card">
            <div class="assignment-header">
              <div class="assignment-course">{{ getCourseName(assignment.courseId) }}</div>
              <el-tag :type="getStatusType(assignment.status)">
                {{ getStatusText(assignment.status) }}
              </el-tag>
            </div>
            <div class="assignment-content">{{ assignment.content }}</div>
            <div class="assignment-actions">
              <el-button type="text" size="small" @click="handleViewDetails(assignment)">
                查看详情
              </el-button>
              <el-button type="text" size="small" @click="handleEdit(assignment)">
                编辑
              </el-button>
              <el-button type="text" size="small" @click="handleDelete(assignment.id)" class="text-danger">
                删除
              </el-button>
              <el-button 
                v-if="assignment.status === 'pending'" 
                type="text" 
                size="small" 
                @click="handleSubmit(assignment.id)"
                class="text-success"
              >
                标记为已提交
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { Assignment } from '../core/types';
import { CourseDataProcessor } from '../core/courseDataProcessor';
import type { Course } from '../types/course';

export default defineComponent({
  name: 'AssignmentList',
  props: {
    assignments: {
      type: Array as () => Assignment[],
      default: () => []
    },
    courses: {
      type: Array as () => Course[],
      default: () => []
    },
    title: {
      type: String,
      default: '作业列表'
    },
    filterStatus: {
      type: String as () => 'pending' | 'submitted' | 'late' | 'all',
      default: 'all'
    }
  },
  emits: ['add-assignment', 'view-assignment', 'edit-assignment', 'delete-assignment', 'submit-assignment'],
  setup(props, { emit }) {
    // 根据状态筛选作业
    const filteredAssignments = computed(() => {
      if (props.filterStatus === 'all') {
        return props.assignments;
      }
      return CourseDataProcessor.getAssignmentsByStatus(
        props.assignments,
        props.filterStatus as 'pending' | 'submitted' | 'late'
      );
    });

    // 对作业进行排序（按截止日期升序）
    const sortedAssignments = computed(() => {
      return [...filteredAssignments.value].sort((a, b) => {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    });

    // 根据课程ID获取课程名称
    const getCourseName = (courseId: string): string => {
      const course = props.courses.find(c => c.id === courseId);
      return course ? course.name : '未知课程';
    };

    // 获取状态的文本表示
    const getStatusText = (status: 'pending' | 'submitted' | 'late'): string => {
      return CourseDataProcessor.getAssignmentStatusText(status);
    };

    // 获取状态对应的标签类型
    const getStatusType = (status: 'pending' | 'submitted' | 'late'): string => {
      const typeMap = {
        'pending': 'warning',
        'submitted': 'success',
        'late': 'danger'
      };
      return typeMap[status];
    };

    // 格式化截止日期
    const formatDeadline = (deadline: Date | string): string => {
      return CourseDataProcessor.formatAssignmentDeadline(new Date(deadline));
    };

    // 处理查看详情
    const handleViewDetails = (assignment: Assignment) => {
      emit('view-assignment', assignment);
    };

    // 处理编辑
    const handleEdit = (assignment: Assignment) => {
      emit('edit-assignment', assignment);
    };

    // 处理删除
    const handleDelete = (assignmentId: string) => {
      emit('delete-assignment', assignmentId);
    };

    // 处理提交
    const handleSubmit = (assignmentId: string) => {
      emit('submit-assignment', assignmentId);
    };

    return {
      sortedAssignments,
      getCourseName,
      getStatusText,
      getStatusType,
      formatDeadline,
      handleViewDetails,
      handleEdit,
      handleDelete,
      handleSubmit
    };
  }
});
</script>

<style scoped>
.assignment-list {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.assignment-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.assignment-list-header h3 {
  margin: 0;
}

.assignment-card {
  margin-bottom: 10px;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.assignment-course {
  font-weight: bold;
  color: #303133;
}

.assignment-content {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.assignment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.text-danger {
  color: #f56c6c;
}

.text-success {
  color: #67c23a;
}

.empty-message {
  padding: 40px 0;
  text-align: center;
}
</style>