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
            
            <!-- 附件显示区域 -->
            <div v-if="assignment.attachments && assignment.attachments.length > 0" class="attachments-container">
              <div class="attachments-title">附件：</div>
              <div class="attachments-list">
                <div v-for="(attachment, index) in assignment.attachments" :key="index" class="attachment-item">
                  <!-- 图片类型直接预览 -->
                  <div v-if="isImageType(attachment.type)" class="image-attachment">
                    <el-image :src="attachment.url" :preview-src-list="[attachment.url]" style="width: 100px; height: 100px;" />
                    <div class="attachment-name">{{ attachment.name }}</div>
                  </div>
                  <!-- 其他类型显示图标和名称 -->
                  <div v-else class="file-attachment">
                    <el-icon size="24"><Document /></el-icon>
                    <div class="attachment-info">
                      <div class="attachment-name">{{ attachment.name }}</div>
                      <div class="attachment-size">{{ formatFileSize(attachment.url) }}</div>
                    </div>
                    <el-button type="text" size="small" @click="downloadAttachment(attachment)">下载</el-button>
                  </div>
                </div>
              </div>
            </div>
            
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
// Document图标已移除，因为当前未使用

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

    // 判断是否为图片类型
    const isImageType = (type: string) => {
      return type.startsWith('image/');
    };

    // 格式化文件大小
    const formatFileSize = (url: string) => {
      // 这里简化处理，实际应用中可以从文件本身获取大小
      // 对于data URL，可以尝试解析base64数据获取大小
      if (url.startsWith('data:')) {
        // 提取base64部分
        const base64Part = url.split(',')[1];
        if (base64Part) {
          const bytes = base64Part.length * 0.75;
          if (bytes < 1024) return `${bytes.toFixed(0)} B`;
          if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / 1048576).toFixed(1)} MB`;
        }
      }
      return '未知大小';
    };

    // 下载附件
    const downloadAttachment = (attachment: { name: string; url: string }) => {
      if (attachment.url.startsWith('data:')) {
        // 对于data URL，创建下载链接
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 对于普通URL，可以直接打开或实现其他下载逻辑
        window.open(attachment.url, '_blank');
      }
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
      handleSubmit,
      isImageType,
      formatFileSize,
      downloadAttachment
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