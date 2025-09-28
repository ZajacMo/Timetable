<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="作业详情" 
    width="600px"
    @close="handleClose"
  >
    <div v-if="assignment" class="assignment-detail">
      <div class="detail-row">
        <span class="detail-label">课程名称：</span>
        <span class="detail-value">{{ getCourseName(assignment.courseId) }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">作业内容：</span>
        <div class="detail-content">{{ assignment.content }}</div>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">截止日期：</span>
        <span class="detail-value deadline-{{ assignment.status }}">
          {{ CourseDataProcessor.formatAssignmentDeadline(new Date(assignment.deadline)) }}
        </span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">作业状态：</span>
        <el-tag :type="getStatusType(assignment.status)">
          {{ CourseDataProcessor.getAssignmentStatusText(assignment.status) }}
        </el-tag>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">创建时间：</span>
        <span class="detail-value">{{ formatCreateTime(assignment) }}</span>
      </div>
      
      <div v-if="isOverdue" class="overdue-notice">
        <i class="el-icon-warning"></i> 该作业已逾期，请尽快提交！
      </div>
    </div>
    
    <div v-else class="empty-detail">
      <el-empty description="作业不存在或已被删除"></el-empty>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="assignment && assignment.status === 'pending'" type="primary" @click="handleSubmit">
          标记为已提交
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { Assignment } from '../core/types';
import { CourseDataProcessor } from '../core/courseDataProcessor';
import type { Course } from '../types/course';

export default defineComponent({
  name: 'AssignmentDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    assignment: {
      type: Object as () => Assignment | null,
      default: null
    },
    courses: {
      type: Array as () => Course[],
      default: () => []
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const dialogVisible = computed({
      get: () => props.visible,
      set: (value) => {
        if (!value) {
          emit('close');
        }
      }
    });

    // 检查作业是否已逾期
    const isOverdue = computed(() => {
      if (!props.assignment || props.assignment.status !== 'pending') {
        return false;
      }
      return new Date(props.assignment.deadline) < new Date();
    });

    // 根据课程ID获取课程名称
    const getCourseName = (courseId: string): string => {
      const course = props.courses.find(c => c.id === courseId);
      return course ? course.name : '未知课程';
    };

    // 获取状态对应的标签类型
    const getStatusType = (status: 'pending' | 'submitted' | 'late'): string => {
      const typeMap = {
        'pending': isOverdue.value ? 'danger' : 'warning',
        'submitted': 'success',
        'late': 'danger'
      };
      return typeMap[status];
    };

    // 格式化创建时间（根据ID估算）
    const formatCreateTime = (assignment: Assignment): string => {
      // 简单地从ID中提取时间戳（假设ID格式与courseDataProcessor中的createAssignment方法一致）
      const idParts = assignment.id.split('');
      let timestampStr = '';
      
      // 尝试从ID中提取可能的时间戳部分
      for (let i = 0; i < idParts.length; i++) {
        if (!isNaN(parseInt(idParts[i], 36))) {
          timestampStr += idParts[i];
        } else {
          break;
        }
      }
      
      try {
        if (timestampStr) {
          const timestamp = parseInt(timestampStr, 36);
          const date = new Date(timestamp);
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
      } catch (error) {
        console.error('Failed to parse assignment creation time:', error);
      }
      
      return '未知';
    };

    // 处理关闭对话框
    const handleClose = () => {
      emit('close');
    };

    // 处理标记为已提交
    const handleSubmit = () => {
      if (props.assignment) {
        emit('submit', props.assignment.id);
      }
    };

    return {
      dialogVisible,
      isOverdue,
      getCourseName,
      getStatusType,
      formatCreateTime,
      handleClose,
      handleSubmit,
      CourseDataProcessor
    };
  }
});
</script>

<style scoped>
.assignment-detail {
  padding: 10px 0;
}

.detail-row {
  margin-bottom: 20px;
}

.detail-label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
  color: #303133;
  vertical-align: top;
}

.detail-value {
  color: #606266;
}

.detail-content {
  display: inline-block;
  vertical-align: top;
  color: #606266;
  line-height: 1.6;
  max-width: 400px;
  word-break: break-word;
}

.deadline-pending {
  color: #e6a23c;
}

.deadline-submitted {
  color: #67c23a;
}

.deadline-late {
  color: #f56c6c;
}

.overdue-notice {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
}

.empty-detail {
  padding: 40px 0;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}
</style>