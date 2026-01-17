import { ref, computed, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  getStudentSessions,
  getTeacherSessions,
  type StudentSessionsRequest,
  type TeacherSessionsRequest,
  type PagedResponse,
  type StudentSessionItem,
  type TeacherSessionItem,
} from '@/api/courseApi'

export function useSessions() {
  const auth = useAuthStore()

  const loading = ref(false)
  const errorMsg = ref('')

  const studentRequest = ref<StudentSessionsRequest>({ pageNumber: 1, pageSize: 20 })
  const teacherRequest = ref<TeacherSessionsRequest>({ pageNumber: 1, pageSize: 20 })

  const student = ref<PagedResponse<StudentSessionItem> | null>(null)
  const teacher = ref<PagedResponse<TeacherSessionItem> | null>(null)

  const isStudent = computed(() => auth.isStudent)
  const isTeacher = computed(() => auth.isTeacher)

  async function refresh(): Promise<void> {
    if (!auth.loaded || !auth.isAuthenticated) return
    loading.value = true
    errorMsg.value = ''
    student.value = null
    teacher.value = null
    try {
      if (isStudent.value) {
        student.value = await getStudentSessions(studentRequest.value)
      } else if (isTeacher.value) {
        teacher.value = await getTeacherSessions(teacherRequest.value)
      }
    } catch (err) {
      errorMsg.value = 'Nie udało się pobrać sesji.'
    } finally {
      loading.value = false
    }
  }

  function setStudentRequest(req: StudentSessionsRequest): void {
    studentRequest.value = { ...studentRequest.value, ...req }
  }

  function setTeacherRequest(req: TeacherSessionsRequest): void {
    teacherRequest.value = { ...teacherRequest.value, ...req }
  }

  watchEffect(async () => {
    if (auth.loaded && auth.isAuthenticated) {
      await refresh()
    }
  })

  return {
    loading,
    errorMsg,
    isStudent,
    isTeacher,
    studentRequest,
    teacherRequest,
    student,
    teacher,
    refresh,
    setStudentRequest,
    setTeacherRequest,
  }
}
