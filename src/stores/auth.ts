import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  loginUser,
  logoutUser,
  userGet,
  type User,
  hasStudentRole,
  hasTeacherRole,
  hasAdminRole,
} from '@/api/userApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const loaded = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isStudent = computed(() => (user.value ? hasStudentRole(user.value) : false))
  const isTeacher = computed(() => (user.value ? hasTeacherRole(user.value) : false))
  const isAdmin = computed(() => (user.value ? hasAdminRole(user.value) : false))

  async function ensureUser(): Promise<void> {
    if (loaded.value || loading.value) return
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    if (!token) {
      user.value = null
      loaded.value = true
      return
    }
    loading.value = true
    try {
      user.value = await userGet()
    } catch {
      user.value = null
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  async function login(loginName: string, password: string): Promise<User | null> {
    await loginUser(loginName, password)
    try {
      user.value = await userGet()
      loaded.value = true
      return user.value
    } catch {
      return null
    }
  }

  function logout(): void {
    logoutUser()
    user.value = null
    loaded.value = false
  }

  return {
    user,
    loading,
    loaded,
    isAuthenticated,
    isStudent,
    isTeacher,
    isAdmin,
    ensureUser,
    login,
    logout,
  }
})
