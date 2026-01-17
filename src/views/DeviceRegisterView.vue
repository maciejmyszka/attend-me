<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerDeviceWithToken } from '@/api/deviceApi'

const route = useRoute()
const token = String(route.params.token || '')

const deviceName = ref('')
const studentName = ref('')
const studentSurname = ref('')
const albumIdNumber = ref<number | null>(null)

const isSubmitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const isRegistered = ref(false)

const router = useRouter()

async function handleSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    if (!token) throw new Error('Brak tokenu w adresie URL.')
    if (!deviceName.value || !studentName.value || !studentSurname.value || !albumIdNumber.value) {
      throw new Error('Uzupełnij wszystkie pola formularza.')
    }
    const res = await registerDeviceWithToken(token, {
      deviceName: deviceName.value,
      studentName: studentName.value,
      studentSurname: studentSurname.value,
      albumIdNumber: albumIdNumber.value,
    })
    successMsg.value = `Urządzenie zarejestrowane. Token wygasa: ${new Date(res.expires).toLocaleString()}`
    try {
      localStorage.setItem('device_registered', '1')
      localStorage.setItem('device_token', res.token)
      localStorage.setItem('device_token_expires', res.expires)
      isRegistered.value = true
    } catch {}
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Rejestracja nie powiodła się. Sprawdź dane lub token.'
  } finally {
    isSubmitting.value = false
  }
}

function resetLocal() {
  try {
    localStorage.removeItem('device_registered')
    localStorage.removeItem('device_token_expires')
  } catch {}

  isRegistered.value = false
  errorMsg.value = ''
  successMsg.value = ''
  deviceName.value = ''
  studentName.value = ''
  studentSurname.value = ''
  albumIdNumber.value = null
}

function goToLogin() {
  router.push({ name: 'login' })
}

function goToTicket() {
  const bearer = localStorage.getItem('device_token') || token || ''
  router.push({ path: '/ticket', query: bearer ? { token: bearer } : undefined })
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
    <section
      class="w-full max-w-xl rounded-xl p-6 bg-slate-900 shadow-xl ring-1 ring-slate-800"
      v-if="!isRegistered"
    >
      <h1 class="text-xl font-semibold mb-3">Rejestracja urządzenia</h1>
      <p class="text-sm text-slate-300">
        Rejestrujesz urządzenie, którego będziesz używać do sprawdzania obecności. Uzupełnij
        poniższe dane i naciśnij przycisk "Rejestruj".
      </p>

      <form class="grid gap-3.5 mt-6" @submit.prevent="handleSubmit" novalidate>
        <div>
          <label for="deviceName" class="block mb-2 text-sm text-slate-300">Nazwa urządzenia</label>
          <input
            id="deviceName"
            name="deviceName"
            v-model="deviceName"
            type="text"
            placeholder="np. Telefon Jan Kowalski"
            required
            class="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-3 px-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="studentName" class="block mb-2 text-sm text-slate-300">Imię</label>
            <input
              id="studentName"
              name="studentName"
              v-model="studentName"
              type="text"
              required
              class="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-3 px-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label for="studentSurname" class="block mb-2 text-sm text-slate-300">Nazwisko</label>
            <input
              id="studentSurname"
              name="studentSurname"
              v-model="studentSurname"
              type="text"
              required
              class="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-3 px-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
            />
          </div>
        </div>
        <div>
          <label for="albumIdNumber" class="block mb-2 text-sm text-slate-300">Numer albumu</label>
          <input
            id="albumIdNumber"
            name="albumIdNumber"
            v-model.number="albumIdNumber"
            type="number"
            min="1"
            step="1"
            required
            class="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-3 px-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
          />
        </div>

        <button
          class="mt-1 w-full py-3 px-4 rounded-xl font-bold text-[#0b1220] bg-gradient-to-br from-violet-600 to-cyan-400 shadow-xl hover:brightness-[1.08] active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed transition cursor-pointer"
          type="submit"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Rejestruj</span>
          <span v-else>Rejestrowanie…</span>
        </button>

        <p v-if="errorMsg" class="text-sm text-red-400 mt-2">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-sm text-emerald-400 mt-2">{{ successMsg }}</p>
      </form>
    </section>

    <section v-else class="w-full max-w-2xl text-center py-16">
      <h1 class="text-3xl font-extrabold mb-2">Urządzenie zarejestrowane</h1>
      <p class="text-slate-400 mb-6">
        Przejdź do skanowania obecności lub do pulpitu (wymagane logowanie).
      </p>
      <div class="flex flex-col items-center gap-3">
        <button
          class="px-5 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
          type="button"
          @click="goToTicket"
        >
          Skanuj obecność
        </button>
        <button
          class="px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold cursor-pointer"
          type="button"
          @click="goToLogin"
        >
          Otwórz pulpit
        </button>
        <button
          class="px-5 py-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold cursor-pointer"
          type="button"
          @click="resetLocal"
        >
          Resetuj
        </button>
      </div>
    </section>
  </div>
</template>
