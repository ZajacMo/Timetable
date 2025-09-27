<template>
  <div 
    class="course-cell"
    @click="handleClick"
    :style="courseCellStyle"
  >
    <div class="course-name">{{ course.name }}</div>
    <div class="course-teacher" v-if="course.teacher">{{ course.teacher }}</div>
    <div class="course-classroom" v-if="course.classroom">{{ course.classroom }}</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'

// 定义课程信息接口
interface CourseInfo {
  id: string | number;
  name: string;
  teacher?: string;
  classroom?: string;
  color?: string;
  // 连堂数（课程持续的课时数）
  duration?: number;
  lessonCount?: number;
  continuousSessions?: number;
  // 可能包含其他课程相关信息
  [key: string]: any;
}

// 接收课程信息作为props
const props = defineProps<{
  course: CourseInfo;
  style?: { [key: string]: string };
  // 单课时高度（用于计算连堂课程的总高度）
  singleLessonHeight?: number;
}>()

const router = useRouter()

// 计算课程单元格的样式，确保文本在不同背景下清晰可读
const courseCellStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  // 尝试获取连堂数（从不同可能的属性名中获取）
  // 如果有endSection和startSection属性，可以计算连堂数
  const sectionBasedDuration = props.course.endSection && props.course.startSection 
    ? props.course.endSection - props.course.startSection + 1 
    : 1;
    
  const continuousCount = props.course.duration || 
                          props.course.lessonCount || 
                          props.course.continuousSessions || 
                          sectionBasedDuration;
  
  // 如果提供了单课时高度，根据连堂数计算总高度
  if (props.singleLessonHeight && continuousCount > 1) {
    baseStyle.height = `${props.singleLessonHeight * continuousCount}px`;
    // 确保内容在垂直方向上适当分布
    baseStyle.justifyContent = 'center';
  }

  // 如果有传入样式，则合并
  if (props.style) {
    Object.assign(baseStyle, props.style);
  }

  // 获取背景颜色
  const bgColor = baseStyle.backgroundColor || props.course.color || '#f5f7fa';
  
  // 计算文本颜色（基于背景色的亮度决定黑色或白色文字）
  if (bgColor && bgColor !== 'transparent') {
    const luminance = getLuminance(bgColor);
    baseStyle.color = luminance > 0.5 ? '#333' : '#fff';
  }

  return baseStyle;
})

// 计算颜色的亮度（0-1，0为最暗，1为最亮）
const getLuminance = (color: string): number => {
  // 移除#号
  color = color.replace('#', '');
  
  // 解析RGB值
  let r = parseInt(color.substr(0, 2), 16) / 255;
  let g = parseInt(color.substr(2, 2), 16) / 255;
  let b = parseInt(color.substr(4, 2), 16) / 255;
  
  // 计算亮度（使用相对亮度公式）
  [r, g, b] = [r, g, b].map(c => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 处理点击事件，跳转到课程详情页面
const handleClick = () => {
  // 使用课程ID作为路由参数，确保同一门课程的不同课时跳转至相同页面
  // 同时传递schedule参数，用于区分同一门课程的不同时间段
  const queryParams: Record<string, any> = {
    id: props.course.id
  }
  
  // 如果课程对象中包含xqj(星期几)和jc(第几节课)，则添加schedule参数
  if (props.course.xqj && props.course.jc) {
    queryParams.schedule = `${props.course.xqj}-${props.course.jc}`
  }
  
  router.push({
    path: '/course-detail',
    query: queryParams
  })
}
</script>

<style scoped>
div.course-cell {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  flex: 1 0 auto;
  margin: 0;
  position: relative;
  padding: 2px;
}

div.course-cell:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.course-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
  line-height: 1.2;
  word-break: break-word;
}

.course-teacher {
  font-size: 10px;
  margin-bottom: 1px;
  line-height: 1.2;
  word-break: break-word;
  opacity: 0.9;
}

.course-classroom {
  font-size: 10px;
  line-height: 1.2;
  word-break: break-word;
  opacity: 0.9;
}

/* 深色模式适配 */
.dark-mode .course-cell {
  color: #fff;
}

.dark-mode .course-cell:hover {
  background-color: rgba(255,255,255,0.1);
}
</style>