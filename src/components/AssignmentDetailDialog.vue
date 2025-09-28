<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="作业详情" 
    :width="dialogWidth"
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
      
      <div v-if="isOverdue" class="overdue-notice">
        <i class="el-icon-warning"></i> 该作业已逾期，请尽快提交！
      </div>
      
      <!-- 附件显示区域 -->
      <div v-if="assignment && assignment.attachments && assignment.attachments.length > 0" class="attachments-container">
        <div class="detail-row">
          <span class="detail-label">附件：</span>
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
                  <div class="attachment-type">{{ getFileTypeText(attachment.type) }}</div>
                  <div class="attachment-size">{{ formatFileSize(attachment.url) }}</div>
                </div>
                <el-button type="text" size="small" @click="downloadAttachment(attachment)">下载</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-detail">
      <el-empty description="作业不存在或已被删除"></el-empty>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button v-if="assignment && assignment.status === 'pending'" type="success" @click="handleSubmit">
          已提交
        </el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import type { Assignment } from '../core/types';
import { CourseDataProcessor } from '../core/courseDataProcessor';
import { Document } from '@element-plus/icons-vue';

// 简化的课程类型定义，用于详情展示
export interface SimpleCourse {
  id: string | number;
  name: string;
  [key: string]: any;
}

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
        type: Array as () => SimpleCourse[],
        default: () => []
      }
    },
  emits: ['close', 'submit', 'edit', 'delete'],
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

    // 处理编辑作业
    const handleEdit = () => {
      if (props.assignment) {
        emit('edit', props.assignment);
      }
    };

    // 判断是否为图片类型
    const isImageType = (type: string) => {
      return type && type.startsWith('image/');
    };

    // 获取文件类型文本描述
    const getFileTypeText = (type: string) => {
      if (!type) return '未知类型';
      
      const typeMap: Record<string, string> = {
        'application/pdf': 'PDF文档',
        'application/msword': 'Word文档',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
        'application/vnd.ms-excel': 'Excel表格',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
        'application/vnd.ms-powerpoint': 'PowerPoint演示',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint演示',
        'application/zip': 'ZIP压缩文件',
        'application/x-rar-compressed': 'RAR压缩文件',
        'text/plain': '文本文件',
        'application/json': 'JSON文件',
        'application/javascript': 'JavaScript文件',
        'text/html': 'HTML文件'
      };
      
      return typeMap[type] || type;
    };

    // 格式化文件大小
    const formatFileSize = (url: string) => {
      // 对于data URL，尝试解析base64数据获取大小
      if (url && url.startsWith('data:')) {
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

    // 处理删除作业
    const handleDelete = () => {
      if (props.assignment) {
        ElMessageBox.confirm('确定要删除此作业吗？删除后无法恢复。', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          emit('delete', props.assignment!.id);
        }).catch(() => {
          // 用户取消删除
        });
      }
    };

    // 计算对话框宽度，适应不同屏幕尺寸
    const dialogWidth = computed(() => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 480) return '95%';
      if (screenWidth < 768) return '90%';
      return '600px';
    });

    return {
        dialogVisible,
        dialogWidth,
        isOverdue,
        getCourseName,
        getStatusType,
        handleClose,
        handleSubmit,
        handleEdit,
        handleDelete,
        CourseDataProcessor,
        Document,
        isImageType,
        getFileTypeText,
        formatFileSize,
        downloadAttachment
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

/* 响应式设计 */
@media (max-width: 768px) {
  .el-dialog {
    width: 90% !important;
    margin: 20px auto;
  }
  
  .detail-label {
    display: block;
    width: auto;
    margin-bottom: 5px;
  }
  
  .detail-content {
    max-width: 100%;
  }
  
  .dialog-footer {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }
  
  .dialog-footer .el-button {
    width: 100%;
  }
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