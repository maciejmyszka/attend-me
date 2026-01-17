<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  getTeacherSessionById,
  getSessionAttendanceList,
  toggleSessionAttendance,
  type TeacherSessionDetail,
  type AttendanceLogItem,
} from '@/api/courseApi'
import { fmtDate } from '@/utils/date'

const route = useRoute()
const loading = ref(false)
const errorMsg = ref('')
const detail = ref<TeacherSessionDetail | null>(null)
const attendance = ref<AttendanceLogItem[]>([])
const busyUserId = ref<number | null>(null)
const showDeviceModal = ref(false)
const showScannerModal = ref(false)

async function fetchDetail() {
  const sessionId = Number(route.params.sessionId)
  if (!Number.isFinite(sessionId)) {
    errorMsg.value = 'Nieprawidłowy identyfikator sesji.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    detail.value = await getTeacherSessionById(sessionId)
    attendance.value = await getSessionAttendanceList(sessionId)
  } catch {
    errorMsg.value = 'Nie udało się pobrać szczegółów sesji.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)

async function toggle(a: AttendanceLogItem) {
  if (!detail.value) return
  busyUserId.value = a.attenderUserId
  try {
    const addOrRemove = !a.wasUserPresent
    await toggleSessionAttendance(a.attenderUserId, detail.value.courseSessionId, addOrRemove)
    attendance.value = await getSessionAttendanceList(detail.value.courseSessionId)
  } catch {
    errorMsg.value = 'Nie udało się zmienić obecności.'
  } finally {
    busyUserId.value = null
  }
}

function openScanner() {
  if (!detail.value) return
  showScannerModal.value = true
}

function registerDevice() {
  const sessionId = detail.value?.courseSessionId
  if (!sessionId) return
  showDeviceModal.value = true
}
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8">
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
      <p class="text-xs text-slate-500 mt-2">ID sesji: {{ detail.courseSessionId }}</p>
      <div class="mt-4 flex items-center gap-3">
        <button
          class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-emerald-500 cursor-pointer"
          type="button"
          @click="openScanner"
        >
          Skaner obecności
        </button>
        <button
          class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-cyan-500 cursor-pointer"
          type="button"
          @click="registerDevice"
        >
          Rejestracja urządzenia
        </button>
      </div>
    </div>
    <div v-if="detail" class="rounded-xl p-4 bg-slate-900 border border-slate-800 mt-6">
      <h2 class="text-lg font-semibold mb-2">Lista obecności</h2>
      <div v-if="attendance.length === 0" class="text-slate-400 text-sm">
        Brak wpisów obecności.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400">
              <th class="py-2 pr-4">Student</th>
              <th class="py-2 pr-4">Album</th>
              <th class="py-2 pr-4">Status</th>
              <th class="py-2 pr-4 text-right">Akcja</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in attendance" :key="a.attendanceLogId" class="border-t border-slate-800">
              <td class="py-2 pr-4 text-slate-200">{{ a.userName }} {{ a.userSurname }}</td>
              <td class="py-2 pr-4 text-slate-300">{{ a.studentAlbumIdNumber }}</td>
              <td class="py-2 pr-4">
                <span
                  class="px-2 py-0.5 rounded-full text-xs"
                  :class="
                    a.wasUserPresent
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'bg-rose-800 text-rose-200'
                  "
                >
                  {{ a.wasUserPresent ? 'Obecny' : 'Nieobecny' }}
                </span>
              </td>
              <td class="py-2 pr-4 text-right">
                <button
                  class="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 hover:border-violet-500 disabled:opacity-50 cursor-pointer"
                  type="button"
                  :disabled="busyUserId === a.attenderUserId"
                  @click="toggle(a)"
                >
                  {{ a.wasUserPresent ? 'Usuń obecność' : 'Oznacz obecność' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <DeviceRegistrationModal
      v-if="detail"
      :open="showDeviceModal"
      :session-id="detail.courseSessionId"
      :attendance="attendance"
      @close="showDeviceModal = false"
    />
    <AttendanceScannerModal
      v-if="detail"
      :open="showScannerModal"
      :course-session-id="detail.courseSessionId"
      @close="showScannerModal = false"
    />
  </main>
</template>

<script lang="ts">
import DeviceRegistrationModal from '@/components/DeviceRegistrationModal.vue'
import AttendanceScannerModal from '@/components/AttendanceScannerModal.vue'
export default {
  components: { DeviceRegistrationModal, AttendanceScannerModal },
}
</script>
