<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AttendanceLogItem } from '@/api/courseApi'
import { resetDevice, getDeviceRegisterToken } from '@/api/deviceApi'
import { userGet } from '@/api/userApi'

type Props = {
  open: boolean
  sessionId: number
  attendance: AttendanceLogItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

type DeviceState = { name?: string }
const devices = ref<Record<number, DeviceState>>({})
const loadingDevices = ref(false)
const errorMsg = ref('')
const confirmForUserId = ref<number | null>(null)
const copyingUserId = ref<number | null>(null)
const copiedUserId = ref<number | null>(null)

async function loadDevices() {
  loadingDevices.value = true
  errorMsg.value = ''
  const map: Record<number, DeviceState> = {}
  try {
    await Promise.all(
      props.attendance.map(async (a) => {
        const u = await userGet(a.attenderUserId)
        map[a.attenderUserId] = { name: u.deviceName || undefined }
      }),
    )
    devices.value = map
  } catch {
    errorMsg.value = 'Nie udało się pobrać stanu urządzeń.'
  } finally {
    loadingDevices.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) loadDevices()
  },
)
watch(
  () => props.attendance,
  () => {
    if (props.open) loadDevices()
  },
  { deep: true },
)

function close() {
  emit('close')
}

async function confirmReset(userId: number) {
  try {
    await resetDevice(userId)
    try {
      const u = await userGet(userId)
      devices.value[userId] = { name: u.deviceName || undefined }
    } catch {
      devices.value[userId] = { name: undefined }
    }
  } finally {
    confirmForUserId.value = null
  }
}

async function copyRegisterLink(userId: number) {
  if (copyingUserId.value) return
  copyingUserId.value = userId
  try {
    const token = await getDeviceRegisterToken(userId)
    const base = `${location.origin}/device/register`
    const url = `${base}/${encodeURIComponent(token.token)}`
    await navigator.clipboard.writeText(url)
    copiedUserId.value = userId
    setTimeout(() => {
      if (copiedUserId.value === userId) copiedUserId.value = null
    }, 2000)
  } catch {
    errorMsg.value = 'Nie udało się skopiować linku.'
  } finally {
    copyingUserId.value = null
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60" @click="close"></div>
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 shadow-xl"
    >
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Rejestracja urządzenia</h2>
        <button
          class="px-3 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 hover:border-violet-500 cursor-pointer"
          type="button"
          @click="close"
        >
          Zamknij
        </button>
      </div>
      <div class="p-4">
        <div v-if="errorMsg" class="mt-3 text-sm text-rose-400">{{ errorMsg }}</div>
        <div class="mt-4 max-h-[65vh] overflow-y-auto">
          <ul class="space-y-2">
            <li
              v-for="a in attendance"
              :key="a.attendanceLogId"
              class="flex items-center justify-between rounded-lg p-2 bg-slate-800 border border-slate-700"
            >
              <div>
                <p class="text-sm text-slate-200">{{ a.userName }} {{ a.userSurname }}</p>
                <p class="text-xs text-slate-400">Album: {{ a.studentAlbumIdNumber }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded-full text-xs"
                  :class="
                    devices[a.attenderUserId]?.name
                      ? 'bg-sky-800 text-sky-200'
                      : 'bg-slate-700 text-slate-300'
                  "
                >
                  Urządzenie:
                  {{ devices[a.attenderUserId]?.name ? devices[a.attenderUserId]?.name : 'brak' }}
                </span>
                <button
                  v-if="devices[a.attenderUserId]?.name"
                  class="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 hover:border-rose-500 cursor-pointer"
                  type="button"
                  @click="confirmForUserId = a.attenderUserId"
                >
                  Resetuj
                </button>
                <button
                  class="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 hover:border-sky-500 cursor-pointer"
                  type="button"
                  :disabled="copyingUserId === a.attenderUserId"
                  @click="copyRegisterLink(a.attenderUserId)"
                >
                  <span v-if="copiedUserId === a.attenderUserId">Skopiowano!</span>
                  <span v-else>Skopiuj link rejestracyjny</span>
                </button>
              </div>
            </li>
          </ul>
          <div v-if="loadingDevices" class="mt-3 text-xs text-slate-400">Ładowanie urządzeń…</div>
        </div>
      </div>
    </div>
    <ConfirmResetModal
      :open="confirmForUserId !== null"
      :user-label="
        confirmForUserId !== null
          ? `${attendance.find((x) => x.attenderUserId === confirmForUserId)?.userName} ${attendance.find((x) => x.attenderUserId === confirmForUserId)?.userSurname}`
          : undefined
      "
      @confirm="confirmForUserId !== null && confirmReset(confirmForUserId)"
      @cancel="confirmForUserId = null"
    />
  </div>
</template>

<script lang="ts">
import ConfirmResetModal from '@/components/ConfirmResetModal.vue'
export default {
  components: { ConfirmResetModal },
}
</script>
