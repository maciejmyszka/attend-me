import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import TeacherSessionDetailView from '../views/TeacherSessionDetailView.vue'
import StudentGroupSessionsView from '../views/StudentGroupSessionsView.vue'
import NoAccessView from '../views/NoAccessView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ScannerView from '../views/ScannerView.vue'
import DeviceRegisterView from '../views/DeviceRegisterView.vue'
import TicketView from '../views/TicketView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/scanner/:token',
      name: 'scanner',
      component: ScannerView,
    },
    {
      path: '/device/register/:token',
      name: 'device-register',
      component: DeviceRegisterView,
    },
    {
      path: '/ticket',
      name: 'ticket',
      component: TicketView,
    },
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'teacher/session/:sessionId',
          name: 'teacher-session-detail',
          component: TeacherSessionDetailView,
        },
        {
          path: 'student/session/:sessionId/:groupId',
          name: 'student-session-detail',
          component: StudentGroupSessionsView,
        },
        {
          path: 'no-access',
          name: 'no-access',
          component: NoAccessView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

export default router
