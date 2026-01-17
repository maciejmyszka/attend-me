<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  getStudentGroupSessions,
  getStudentAttendance,
  type StudentSessionItem,
  type StudentAttendanceItem,
} from '@/api/courseApi'
import { fmtDate } from '@/utils/date'

const route = useRoute()
const loading = ref(false)
const errorMsg = ref('')
const detail = ref<StudentSessionItem | null>(null)
const sessions = ref<StudentSessionItem[]>([])
const attendance = ref<StudentAttendanceItem[]>([])

async function fetchDetail() {
  const sessionId = Number(route.params.sessionId)
  const groupId = Number(route.params.groupId)
  if (!Number.isFinite(sessionId) || !Number.isFinite(groupId)) {
    errorMsg.value = 'Nieprawidłowy identyfikator sesji lub grupy.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const [groupSessions, groupAttendance] = await Promise.all([
      getStudentGroupSessions(groupId),
      getStudentAttendance(groupId),
    ])
    sessions.value = groupSessions
    attendance.value = groupAttendance
    detail.value = groupSessions.find((s) => s.courseSessionId === sessionId) || null
  } catch {
    errorMsg.value = 'Nie udało się pobrać danych sesji lub obecności.'
  } finally {
    loading.value = false
  }
}

const totalSessions = computed(() => sessions.value.length)
const pastSessions = computed(() => {
  const now = new Date().getTime()
  return sessions.value
    .filter((s) => new Date(s.dateStart).getTime() <= now)
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
})
const totalPastSessions = computed(() => pastSessions.value.length)

const attendedSessions = computed(() => {
  const unique = new Set(attendance.value.map((a) => a.courseSessionId))
  return unique.size
})
const attendancePercent = computed(() =>
  totalSessions.value > 0 ? Math.round((attendedSessions.value / totalSessions.value) * 100) : 0,
)

const presentInSession = computed(() => {
  const sid = Number(route.params.sessionId)
  if (!Number.isFinite(sid)) return false
  return attendance.value.some((a) => a.courseSessionId === sid)
})

const courseProgressPercent = computed(() =>
  totalSessions.value > 0 ? Math.round((totalPastSessions.value / totalSessions.value) * 100) : 0,
)

onMounted(fetchDetail)
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="text-xl font-semibold mb-4">Szczegóły zajęć</h1>

    <div v-if="loading" class="grid place-items-center py-24 text-slate-300">Ładowanie…</div>
    <div v-else-if="errorMsg" class="py-4 text-red-400">{{ errorMsg }}</div>

    <div v-else-if="detail" class="rounded-xl p-4 bg-slate-900 border border-slate-800">
      <p class="text-sm text-slate-300">
        <span class="text-slate-400">Kurs:</span> {{ detail.courseName }}
      </p>
      <p class="text-sm text-slate-300">
        <span class="text-slate-400">Grupa:</span> {{ detail.courseGroupName }}
      </p>
      <p class="text-sm text-slate-300">
        <span class="text-slate-400">Lokalizacja:</span> {{ detail.locationName }}
      </p>
      <p class="text-sm text-slate-300 mt-1">
        <span class="text-slate-400">Od:</span> {{ fmtDate(detail.dateStart) }}
      </p>
      <p class="text-sm text-slate-300">
        <span class="text-slate-400">Do:</span> {{ fmtDate(detail.dateEnd) }}
      </p>
      <div class="mt-3 flex items-center gap-3">
        <p class="text-xs text-slate-500">ID sesji: {{ detail.courseSessionId }}</p>
        <span
          class="px-2 py-0.5 rounded-full text-xs"
          :class="
            presentInSession ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-800 text-rose-200'
          "
        >
          {{ presentInSession ? 'Obecny' : 'Nieobecny' }}
        </span>
      </div>
    </div>

    <div v-if="detail" class="rounded-xl p-4 bg-slate-900 border border-slate-800 mt-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Twoja dotychczasowa obecność</h2>
        <span class="text-sm text-slate-300"
          >{{ attendedSessions }} / {{ totalSessions }} ({{ attendancePercent }}%)</span
        >
      </div>
      <input
        class="w-full mt-3 accent-violet-500"
        type="range"
        min="0"
        :max="Math.max(totalSessions, 1)"
        :value="attendedSessions"
        disabled
      />
    </div>

    <div v-if="detail" class="rounded-xl p-4 bg-slate-900 border border-slate-800 mt-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Zaawansowanie kursu</h2>
        <span class="text-sm text-slate-300"
          >{{ totalPastSessions }} / {{ totalSessions }} ({{ courseProgressPercent }}%)</span
        >
      </div>
      <input
        class="w-full mt-3 accent-cyan-500"
        type="range"
        min="0"
        :max="Math.max(totalSessions, 1)"
        :value="totalPastSessions"
        disabled
      />
    </div>
  </main>
</template>
