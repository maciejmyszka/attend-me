<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')
const router = useRouter()
const { login } = useAuthStore()

async function handleSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    const me = await login(email.value.trim(), password.value)
    if (me) {
      const redirect = (router.currentRoute.value.query.redirect as string) || '/'
      await router.push(redirect)
    } else {
      console.error('Login failed: No user data returned')
      errorMsg.value = 'Nieprawidłowa odpowiedź logowania.'
    }
  } catch (err) {
    console.error('Login error:', err)
    errorMsg.value = 'Logowanie nie powiodło się. Sprawdź dane i spróbuj ponownie.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
    <section
      class="w-full max-w-md rounded-xl p-6 bg-slate-900 shadow-xl ring-1 ring-slate-800"
      role="form"
    >
      <h1 class="text-xl font-semibold mb-3">Zaloguj się</h1>

      <form class="grid gap-3.5 mt-6" @submit.prevent="handleSubmit" novalidate>
        <div>
          <label for="email" class="block mb-2 text-sm text-slate-300">Email</label>
          <input
            id="email"
            name="email"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            class="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-3 px-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label for="password" class="block mb-2 text-sm text-slate-300">Hasło</label>
          <div class="relative">
            <input
              id="password"
              name="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              minlength="6"
              required
              class="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-3 px-3 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 pr-12"
            />
            <button
              type="button"
              aria-label="Pokaż lub ukryj hasło"
              @click="showPassword = !showPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:border-violet-500 active:scale-[0.98] transition cursor-pointer"
            >
              <svg
                v-if="!showPassword"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3l18 18"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.43-4.42M7.31 7.35C4.33 8.86 2 12 2 12s4 7 10 7c2.05 0 3.93-.61 5.55-1.58M15.89 6.62A9.92 9.92 0 0 1 22 12s-1.05 1.85-2.93 3.67"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          class="mt-1 w-full py-3 px-4 rounded-xl font-bold text-[#0b1220] bg-gradient-to-br from-violet-600 to-cyan-400 shadow-xl hover:brightness-[1.08] active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed transition cursor-pointer"
          type="submit"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Zaloguj się</span>
          <span v-else>Logowanie…</span>
        </button>

        <p v-if="errorMsg" class="text-sm text-red-400 mt-2">{{ errorMsg }}</p>
      </form>
    </section>
  </div>
</template>
