<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? '编辑作业' : '添加作业'"
    :width="dialogWidth"
    @close="handleClose"
  >
    <el-form 
      ref="assignmentFormRef" 
      :model="assignmentForm" 
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="选择课程" prop="courseId">
        <el-select 
          v-model="assignmentForm.courseId" 
          placeholder="请选择课程或手动输入"
          style="width: 100%"
          filterable
          allow-create
          default-first-option
        >
          <el-option 
            v-for="course in availableCourses" 
            :key="course.id" 
            :label="course.name"
            :value="course.name"
          ></el-option>
        </el-select>
        <div v-if="isCreatingNewCourse" class="create-course-tip">
          <span>将创建新课程：</span>
          <el-input 
            v-model="newCourseName" 
            placeholder="请输入新课程名称" 
            style="margin-top: 10px;"
          />
        </div>
      </el-form-item>
      
      <el-form-item label="作业内容" prop="content">
        <el-input 
          v-model="assignmentForm.content" 
          type="textarea" 
          :rows="4"
          placeholder="请输入作业内容"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="截止日期" prop="deadline">
        <el-date-picker
          v-model="assignmentForm.deadline"
          type="datetime"
          placeholder="选择截止日期和时间"
          style="width: 100%"
          :default-time="['23:59:59']"
        ></el-date-picker>
      </el-form-item>
      
      <el-form-item v-if="isEdit" label="作业状态" prop="status">
        <el-radio-group v-model="assignmentForm.status">
          <el-radio label="pending">待提交</el-radio>
          <el-radio label="submitted">已提交</el-radio>
          <el-radio label="late">已逾期</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 附件上传 -->
      <el-form-item label="附件上传">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
          multiple
        >
          <el-icon><Plus /></el-icon>
          <div class="el-upload__text">
            点击或拖拽文件到此处上传
          </div>
        </el-upload>
        <div class="upload-tip">支持jpg、png、pdf、doc等多种格式文件上传</div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from 'vue';
import type { Assignment } from '../core/types';
import type { Course } from '../types/course';
import { useCoursesStore } from '../stores/courses';
import { useSettingsStore } from '../stores/settings';

export default defineComponent({
  name: 'AssignmentDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    editAssignment: {
      type: Object as () => Assignment | null,
      default: null
    },
    assignment: {
      type: Object as () => Assignment | null,
      default: null
    },
    mode: {
      type: String as () => 'add' | 'edit',
      default: 'add'
    },
    courseId: {
      type: String,
      default: ''
    },
    courseName: {
      type: String,
      default: ''
    },
    courses: {
      type: Array as () => Course[],
      default: () => []
    }
  },
  emits: ['close', 'submit', 'update:modelValue'],
  setup(props, { emit }) {
    // 使用ref替代computed以简化逻辑
    const dialogVisible = ref(props.modelValue);
    
    // 监听modelValue的变化，直接更新dialogVisible
    watch(() => props.modelValue, (newValue) => {
      dialogVisible.value = newValue;
    }, { immediate: true });

    const assignmentFormRef = ref<InstanceType<typeof import('element-plus')['ElForm']>>();
    
    // 表单数据
    const assignmentForm = reactive({
      id: '',
      courseId: '',
      content: '',
      deadline: new Date(),
      status: 'pending' as 'pending' | 'submitted' | 'late',
      attachments: [] as Array<{ name: string; url: string; type: string }>
    });

    // 课程存储
    const coursesStore = useCoursesStore();
    const settingsStore = useSettingsStore();

    // 可用课程列表
    const availableCourses = computed(() => {
      if (props.courses && props.courses.length > 0) {
        return props.courses;
      }
      return coursesStore.courses;
    });

    // 是否正在创建新课程
    const isCreatingNewCourse = ref(false);
    const newCourseName = ref('');
    const fileList = ref<any[]>([]);

    // 设置默认截止时间为次日的指定时间
    const setDefaultDeadline = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // 从设置中获取默认截止时间
      if (settingsStore.settings.assignment?.defaultDeadline?.enabled && settingsStore.settings.assignment.defaultDeadline.time) {
        const [hours, minutes] = settingsStore.settings.assignment.defaultDeadline.time.split(':').map(Number);
        tomorrow.setHours(hours || 20, minutes || 0, 0, 0);
      } else {
        // 默认使用20:00
        tomorrow.setHours(20, 0, 0, 0);
      }
      
      return tomorrow;
    };

    // 是否为编辑模式
    const isEdit = computed(() => props.mode === 'edit' || !!props.editAssignment);

    // 表单验证规则
    const rules = reactive({
      courseId: [
        { required: true, message: '请选择课程', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入作业内容', trigger: 'blur' },
        { min: 1, max: 500, message: '作业内容长度在 1 到 500 个字符', trigger: 'blur' }
      ],
      deadline: [
        { required: true, message: '请选择截止日期', trigger: 'change' },
        {
          validator: (_rule: any, value: any, callback: any) => {
            if (value && new Date(value) < new Date()) {
              callback(new Error('截止日期不能早于当前时间'));
            } else {
              callback();
            }
          },
          trigger: 'change'
        }
      ]
    });

    // 响应式对话框宽度
    const dialogWidth = computed(() => {
      // 检查窗口宽度，为移动设备提供更合适的宽度
      // 在小屏幕上使用90%的宽度，大屏幕上使用固定宽度
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return '90%';
      }
      return '500px';
    });

    // 重置表单
    const resetForm = () => {
      assignmentForm.id = '';
      assignmentForm.courseId = '';
      assignmentForm.content = '';
      assignmentForm.deadline = setDefaultDeadline();
      assignmentForm.status = 'pending';
      assignmentForm.attachments = [];
      fileList.value = [];
      isCreatingNewCourse.value = false;
      newCourseName.value = '';
    };

    // 监听编辑作业的变化，更新表单数据
    watch(() => props.editAssignment, (newAssignment) => {
      if (newAssignment && isEdit.value) {
        assignmentForm.id = newAssignment.id;
        assignmentForm.courseId = newAssignment.courseId;
        assignmentForm.content = newAssignment.content;
        assignmentForm.deadline = newAssignment.deadline ? new Date(newAssignment.deadline) : setDefaultDeadline();
        assignmentForm.status = newAssignment.status;
        assignmentForm.attachments = newAssignment.attachments || [];
        // 恢复文件列表
        fileList.value = assignmentForm.attachments.map(attach => ({
          name: attach.name,
          url: attach.url,
          status: 'success'
        }));
      } else {
        // 重置表单
        resetForm();
      }
    }, { immediate: true });

    // 注意：以下处理函数已被移除，因为当前版本未使用
    // - handleRemoteSearch
    // - handleFileChange
    // - beforeUpload

    // 监听modelValue变为true时，设置课程ID
    watch(() => props.modelValue, (newValue) => {
      if (newValue && props.mode === 'add' && props.courseId) {
        assignmentForm.courseId = props.courseId;
      }
    });

    // 监听assignment数据变化（用于编辑模式）
    watch(() => props.assignment, (newAssignment) => {
      if (newAssignment && props.modelValue) {
        assignmentForm.id = newAssignment.id;
        assignmentForm.courseId = newAssignment.courseId;
        assignmentForm.content = newAssignment.content;
        assignmentForm.deadline = new Date(newAssignment.deadline);
        assignmentForm.status = newAssignment.status;
      }
    }, { deep: true });

    // 处理关闭对话框
    const handleClose = () => {
      resetForm();
      emit('close');
      emit('update:modelValue', false);
    };

    // 处理提交
    const handleSubmit = async () => {
      try {
        await assignmentFormRef.value?.validate();
        
        // 处理创建新课程的情况
        let courseId = assignmentForm.courseId;
        // 直接使用课程名称作为ID，简化逻辑
        if (isCreatingNewCourse.value && newCourseName.value) {
          courseId = newCourseName.value;
        }
        
        // 处理附件
        const attachments = fileList.value.map(file => ({
          name: file.name,
          url: file.url || `data:${file.raw.type};base64,${btoa(String.fromCharCode(...new Uint8Array(file.raw)))}`,
          type: file.raw.type
        }));
        
        // 准备提交的数据
        const assignmentData: any = {
          id: isEdit.value ? assignmentForm.id : '',
          courseId: courseId,
          content: assignmentForm.content,
          deadline: new Date(assignmentForm.deadline),
          status: assignmentForm.status,
          attachments: attachments
        };
        // console.log('提交数据:', assignmentData);
        emit('submit', assignmentData);
        emit('update:modelValue', false);
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    };

    // 提供一个方法让父组件可以直接调用显示对话框
    const show = () => {
      dialogVisible.value = true;
      emit('update:modelValue', true);
    };

    return {
      dialogVisible,
      assignmentFormRef,
      assignmentForm,
      isEdit,
      rules,
      dialogWidth,
      handleClose,
      handleSubmit,
      show,
      isCreatingNewCourse,
      newCourseName,
      fileList,
      availableCourses
    };
  }
});
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.el-select,
.el-input,
.el-date-picker {
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-radio {
  margin-right: 15px;
}
</style>