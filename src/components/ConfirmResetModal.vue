<script setup lang="ts">
type Props = {
  open: boolean
  userLabel?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function confirm() {
  emit('confirm')
}
function cancel() {
  emit('cancel')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60" @click="cancel"></div>
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 shadow-xl"
    >
      <div class="p-4 border-b border-slate-800">
        <h2 class="text-lg font-semibold">Potwierdź reset urządzenia</h2>
      </div>
      <div class="p-4">
        <p class="text-sm text-slate-300">
          Czy na pewno chcesz zresetować urządzenie
          <span v-if="userLabel" class="font-medium text-slate-100">{{ userLabel }}</span
          >?
        </p>
        <div class="mt-4 flex gap-2 justify-end">
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-slate-500 cursor-pointer"
            type="button"
            @click="cancel"
          >
            Anuluj
          </button>
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium bg-rose-800 border border-rose-700 hover:border-rose-500 cursor-pointer"
            type="button"
            @click="confirm"
          >
            Resetuj
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
