<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { getAttendanceScannerToken, type AttendanceScannerToken } from '@/api/courseApi'

type Props = {
  open: boolean
  courseSessionId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const loading = ref(false)
const errorMsg = ref('')
const token = ref<AttendanceScannerToken | null>(null)
const copying = ref(false)
const copied = ref(false)
const origin = window.location.origin
const qrUrl = computed(() => `${origin}/scanner/${encodeURIComponent(token.value?.token || '')}`)

async function loadToken() {
  loading.value = true
  errorMsg.value = ''
  token.value = null
  try {
    const res = await getAttendanceScannerToken(props.courseSessionId)
    token.value = res
    await nextTick()
  } catch {
    errorMsg.value = 'Nie udało się pobrać tokenu skanera.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) loadToken()
  },
  { immediate: true },
)
watch(
  () => props.courseSessionId,
  () => {
    if (props.open) loadToken()
  },
)

function close() {
  emit('close')
}

async function copyUrl() {
  if (!token.value || copying.value) return
  copying.value = true
  try {
    await navigator.clipboard.writeText(qrUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    errorMsg.value = 'Nie udało się skopiować adresu.'
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60" @click="close"></div>
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-800 shadow-xl"
    >
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Skaner obecności</h2>
        <button
          class="px-3 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 hover:border-violet-500 cursor-pointer"
          type="button"
          @click="close"
        >
          Zamknij
        </button>
      </div>
      <div class="p-4">
        <p class="text-sm text-slate-300 mb-3">
          Do sprawdzania obecności wymagane jest urządzenie wyposażone w kamerę (tablet lub
          telefon). Zeskanuj na nim poniższy kod QR lub otwórz adres url, który możesz skopiować
          poniższym przyciskiem. Sprawdzenie obecności polega na umieszczeniu w polu widzenia kamery
          skanera kodu QR wygenerowanego na ekranie telefonu uczestnika.
        </p>

        <div class="space-y-3">
          <div class="bg-white rounded-lg overflow-hidden mx-auto" style="width: 420px">
            <QrcodeVue :key="token?.token" :value="qrUrl" :size="420" />
          </div>
          <div>
            <button
              class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-violet-500 cursor-pointer"
              type="button"
              :disabled="copying"
              @click="copyUrl"
            >
              <span v-if="copied">Skopiowano adres</span>
              <span v-else>Skopiuj adres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
