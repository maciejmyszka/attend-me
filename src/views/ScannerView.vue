<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { registerAttendanceWithBearer } from '@/api/courseApi'
import type { User } from '@/api/userApi'

const route = useRoute()
const bearer = String(route.params.token || route.query.token || '')

const result = ref('')
const error = ref('')
const successUser = ref<User | null>(null)
const successMsg = ref('')

interface DetectedCode {
  rawValue: string
  value?: string
}

function onDetect(detectedCodes: DetectedCode[]) {
  console.log('Detected codes:', detectedCodes)
  if (detectedCodes && detectedCodes.length > 0) {
    const code = detectedCodes[0]
    if (code && code.rawValue) {
      const content = code.rawValue
      result.value = content
      submitAttendance(content)
    }
  }
}

interface CameraConstraints {
  facingMode?: string
  deviceId?: string
}

interface ConstraintOption {
  label: string
  constraints: CameraConstraints
}

const selectedConstraints = ref<CameraConstraints>({ facingMode: 'environment' })
const constraintOptions = ref<ConstraintOption[]>([
  { label: 'tylna kamera', constraints: { facingMode: 'environment' } },
  { label: 'przednia kamera', constraints: { facingMode: 'user' } },
])

async function onCameraReady() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(({ kind }) => kind === 'videoinput')

    constraintOptions.value = [
      { label: 'tylna kamera', constraints: { facingMode: 'environment' } },
      { label: 'przednia kamera', constraints: { facingMode: 'user' } },
      ...videoDevices.map(({ deviceId, label }) => ({
        label: label || `Kamera ${deviceId.slice(0, 8)}`,
        constraints: { deviceId },
      })),
    ]

    error.value = ''
  } catch (err) {
    console.error('Failed to enumerate devices:', err)
  }
}

function onError(err: Error) {
  console.error('Camera error:', err)
  error.value = `[${err.name}]: `

  if (err.name === 'NotAllowedError') {
    error.value += 'musisz udzielić uprawnienia do kamery'
  } else if (err.name === 'NotFoundError') {
    error.value += 'nie znaleziono kamery w tym urządzeniu'
  } else if (err.name === 'NotSupportedError') {
    error.value += 'wymagany bezpieczny kontekst (HTTPS, localhost)'
  } else if (err.name === 'NotReadableError') {
    error.value += 'czy kamera jest już używana przez inną aplikację?'
  } else if (err.name === 'OverconstrainedError') {
    error.value += 'dostępne kamery nie są odpowiednie'
  } else if (err.name === 'StreamApiNotSupportedError') {
    error.value += 'Stream API nie jest obsługiwane w tej przeglądarce'
  } else if (err.name === 'InsecureContextError') {
    error.value +=
      'dostęp do kamery jest dozwolony tylko w bezpiecznym kontekście. Użyj HTTPS lub localhost.'
  } else {
    error.value += err.message
  }
}

async function submitAttendance(content: string) {
  try {
    error.value = ''
    successMsg.value = ''
    if (!content) throw new Error('Nieprawidłowy kod QR.')
    const res = await registerAttendanceWithBearer(content, bearer)
    successUser.value = res
    successMsg.value = `Zarejestrowano: ${res.name} ${res.surname}`
  } catch (e) {
    console.error('Attendance registration failed:', e)
    error.value = 'Nie udało się zarejestrować obecności.'
  }
}

function resetScan() {
  result.value = ''
  error.value = ''
  successUser.value = null
  successMsg.value = ''
}

async function copyResult() {
  try {
    if (result.value) await navigator.clipboard.writeText(result.value)
  } catch {}
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
    <section class="w-full max-w-3xl rounded-xl p-6 bg-slate-900 shadow-xl ring-1 ring-slate-800">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold">Skaner obecności</h1>
        <div class="text-xs text-slate-400" v-if="bearer">Token aktywacji skanera</div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-2">Wybierz kamerę:</label>
        <select
          v-model="selectedConstraints"
          class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm"
        >
          <option
            v-for="option in constraintOptions"
            :key="option.label"
            :value="option.constraints"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="grid place-items-center mb-4">
        <div class="overflow-hidden rounded-xl bg-black">
          <QrcodeStream
            :constraints="selectedConstraints"
            @detect="onDetect"
            @error="onError"
            @camera-on="onCameraReady"
            class="w-full max-w-md aspect-square"
          />
        </div>
      </div>

      <div class="space-y-2 mb-4">
        <p v-if="error" class="text-sm text-rose-500">{{ error }}</p>

        <div v-if="result && !error" class="text-sm text-slate-300">
          <p>Odczytano kod:</p>
          <span class="font-mono text-slate-100 break-all bg-slate-800 px-2 py-1 rounded">{{
            result
          }}</span>
        </div>

        <p v-if="successMsg" class="text-sm text-emerald-400">{{ successMsg }}</p>

        <p v-if="!result && !error" class="text-sm text-slate-400">
          Umieść kod QR w polu widzenia kamery.
        </p>
      </div>

      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-500 text-slate-200 text-sm"
          @click="resetScan"
        >
          Resetuj
        </button>
        <button
          type="button"
          class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-sky-500 text-slate-200 text-sm"
          @click="copyResult"
          :disabled="!result"
          :class="{ 'opacity-50 cursor-not-allowed': !result }"
        >
          Skopiuj wynik
        </button>
      </div>
    </section>
  </div>
</template>
