<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { getAttendanceTicketWithBearer } from '@/api/userApi'

const route = useRoute()
const loading = ref(true)
const errorMsg = ref('')
const token = ref<string>('')
const expires = ref<string>('')

async function loadTicket() {
  loading.value = true
  errorMsg.value = ''
  try {
    const bearer = String(route.query.token || localStorage.getItem('device_token') || '')
    if (!bearer) throw new Error('Brak tokenu urządzenia.')
    const res = await getAttendanceTicketWithBearer(bearer)
    token.value = res.token
    expires.value = res.expires
  } catch (e) {
    errorMsg.value = 'Nie udało się pobrać biletu obecności.'
  } finally {
    loading.value = false
  }
}

onMounted(loadTicket)
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
    <section class="w-full max-w-2xl rounded-xl p-6 bg-slate-900 shadow-xl ring-1 ring-slate-800">
      <div class="grid place-items-center">
        <div class="p-4 bg-white rounded-xl">
          <QrcodeVue v-if="!loading && token" :value="token" :size="420" level="M" />
          <div v-else class="text-slate-400 text-sm">Pobieranie biletu…</div>
        </div>
      </div>

      <p class="mt-6 text-sm text-slate-300">
        Aby zarejestorwać obecność umieść telefon w polu widzenia skanera. W razie wątpliwości
        poproś osobę prowadzącą zajęcia o pomoc.
      </p>

      <div class="mt-3 text-xs text-slate-400" v-if="expires">
        Ważny do: {{ new Date(expires).toLocaleString() }}
      </div>

      <div class="mt-4">
        <p v-if="errorMsg" class="text-sm text-rose-500">{{ errorMsg }}</p>
        <button
          class="mt-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-500 text-slate-200 text-sm cursor-pointer"
          type="button"
          @click="loadTicket"
        >
          Spróbuj ponownie
        </button>
      </div>
    </section>
  </div>
</template>
