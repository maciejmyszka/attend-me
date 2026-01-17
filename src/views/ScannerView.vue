<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { registerAttendanceWithBearer } from '@/api/courseApi'
import type { User } from '@/api/userApi'

const route = useRoute()
const bearer = String(route.params.token || route.query.token || '')

const errorMsg = ref('')
const lastResult = ref<string | null>(null)
const scanning = ref(true)
const devices = ref<MediaDeviceInfo[]>([])
const selectedDeviceId = ref<string>('')
const successUser = ref<User | null>(null)
const successMsg = ref('')

async function listCameras() {
  try {
    const all = await navigator.mediaDevices.enumerateDevices()
    devices.value = all.filter((d) => d.kind === 'videoinput')
    if (!selectedDeviceId.value && devices.value.length > 0) {
      selectedDeviceId.value = devices.value[0]?.deviceId ?? ''
    }
  } catch {
    // ignore
  }
}

function onDecode(content: string) {
  lastResult.value = content
  scanning.value = false
  successUser.value = null
  successMsg.value = ''
  submitAttendance()
}

function resetScan() {
  lastResult.value = null
  scanning.value = true
  successUser.value = null
  successMsg.value = ''
}

async function onInit(promise: Promise<void>) {
  try {
    await promise
  } catch (err) {
    errorMsg.value = 'Brak dostępu do kamery lub urządzenie nieobsługiwane.'
  }
}

onMounted(listCameras)

async function copyResult() {
  try {
    if (lastResult.value) await navigator.clipboard.writeText(lastResult.value)
  } catch {}
}
const trackConstraints = computed(() => {
  const id = selectedDeviceId.value
  return id ? { deviceId: { exact: id } } : { facingMode: 'environment' }
})
async function submitAttendance() {
  try {
    errorMsg.value = ''
    successMsg.value = ''
    const content = lastResult.value || ''
    if (!content) throw new Error('Nieprawidłowy kod QR.')
    const res = await registerAttendanceWithBearer(content, bearer)
    successUser.value = res
    successMsg.value = `Zarejestrowano: ${res.name} ${res.surname}`
  } catch (e) {
    errorMsg.value = 'Nie udało się zarejestrować obecności.'
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
    <section class="w-full max-w-3xl rounded-xl p-6 bg-slate-900 shadow-xl ring-1 ring-slate-800">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold">Skaner obecności</h1>
        <div class="text-xs text-slate-400" v-if="bearer">Token aktywacji skanera</div>
      </div>

      <div class="grid place-items-center">
        <div class="overflow-hidden rounded-xl bg-black">
          <QrcodeStream
            :paused="!scanning"
            :constraints="trackConstraints"
            @decode="onDecode"
            @init="onInit"
          />
        </div>
      </div>

      <div class="mt-4">
        <p v-if="errorMsg" class="text-sm text-rose-500">{{ errorMsg }}</p>
        <div v-else class="text-sm text-slate-300">
          <p v-if="lastResult">
            Odczytano kod:
            <span class="font-mono text-slate-100 break-all">{{ lastResult }}</span>
          </p>
          <p v-else>Umieść kod QR w polu widzenia kamery.</p>
          <p v-if="successMsg" class="mt-2 text-emerald-400">{{ successMsg }}</p>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-500 text-slate-200 text-sm cursor-pointer"
          @click="resetScan"
        >
          Skanuj ponownie
        </button>
        <button
          type="button"
          class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-sky-500 text-slate-200 text-sm cursor-pointer"
          @click="copyResult"
          :disabled="!lastResult"
        >
          Skopiuj wynik
        </button>
      </div>
    </section>
  </div>
</template>
