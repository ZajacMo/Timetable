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
          placeholder="请选择课程"
          style="width: 100%"
        >
          <el-option 
            v-for="course in courses" 
            :key="course.id" 
            :label="course.name"
            :value="course.id"
          ></el-option>
        </el-select>
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
      status: 'pending' as 'pending' | 'submitted' | 'late'
    });

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
      assignmentForm.deadline = new Date();
      assignmentForm.status = 'pending';
    };

    // 监听编辑作业的变化，更新表单数据
    watch(() => props.editAssignment, (newAssignment) => {
      if (newAssignment && isEdit.value) {
        assignmentForm.id = newAssignment.id;
        assignmentForm.courseId = newAssignment.courseId;
        assignmentForm.content = newAssignment.content;
        assignmentForm.deadline = new Date(newAssignment.deadline);
        assignmentForm.status = newAssignment.status;
      } else {
        // 重置表单
        resetForm();
      }
    }, { immediate: true });

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
        
        // 准备提交的数据
        const assignmentData: Assignment = {
          id: isEdit.value ? assignmentForm.id : '',
          courseId: assignmentForm.courseId,
          content: assignmentForm.content,
          deadline: new Date(assignmentForm.deadline),
          status: assignmentForm.status
        };
        
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
      show
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