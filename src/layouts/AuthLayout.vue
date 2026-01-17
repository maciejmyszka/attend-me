<script setup lang="ts">
import { computed, onMounted, watchEffect } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  auth.ensureUser()
})

watchEffect(() => {
  if (auth.loaded && !auth.isAuthenticated) {
    const redirect = route.fullPath || '/'
    router.replace({ name: 'login', query: { redirect } })
  }
})

const displayName = computed(() => {
  const u = auth.user
  if (!u) return '—'
  const full = [u.name, u.surname].filter(Boolean).join(' ').trim()
  return full || u.loginName || '—'
})

const roleLabels = computed(() => {
  const labels: string[] = []
  if (auth.isTeacher) labels.push('Teacher')
  if (auth.isStudent) labels.push('Student')
  if (auth.isAdmin) labels.push('Admin')
  return labels
})

function handleLogout() {
  auth.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200">
    <header class="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div class="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-violet-500"></span>
          <RouterLink to="/" class="font-semibold">AttendMe</RouterLink>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 text-sm text-slate-300">
            <span class="text-slate-400">{{ displayName }}</span>
            <template v-for="label in roleLabels" :key="label">
              <span class="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700">{{
                label
              }}</span>
            </template>
          </div>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-violet-500 hover:text-white active:translate-y-[1px]s cursor-pointer"
            type="button"
            @click="handleLogout"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <div v-if="!auth.loaded" class="grid place-items-center py-24 text-slate-300">Ładowanie…</div>
      <RouterView v-else-if="auth.isAuthenticated" />
      <div v-else class="grid place-items-center py-24 text-slate-300">Przekierowanie…</div>
    </main>
  </div>
</template>

<style scoped></style>
