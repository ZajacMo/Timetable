import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/ScheduleView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue')
  },
  {
    path: '/course-detail',
    name: 'CourseDetail',
    component: () => import('@/views/CourseDetailView.vue')
  },
  {
    path: '/assignments',
    name: 'Assignments',
    component: () => import('@/views/AssignmentView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router