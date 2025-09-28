<template>
  <div class="home-view">
    <!-- 课程表内容 -->
    <div class="timetable-container">
      <TimetableView />
    </div>
  </div>
</template>

<script setup lang="ts">
import TimetableView from '@/components/TimetableView.vue'

// TimetableView组件内部处理所有课程数据和展示逻辑
</script>

<style scoped>
div.home-view {
  padding: 20px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.timetable-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}
</style>