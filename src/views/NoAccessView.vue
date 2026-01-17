<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-16 text-center">
    <h1 class="text-2xl font-semibold mb-2">Brak uprawnień</h1>
    <p class="text-slate-400 mb-6">Nie masz dostępu do tej strony lub zasobu.</p>
    <button
      class="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-500 cursor-pointer"
      type="button"
      @click="goHome"
    >
      Wróć do strony głównej
    </button>
  </main>
</template>
