<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessions } from '@/composables/useSessions'
import { fmtDate, computePresetRange, type DatePreset } from '@/utils/date'
import { debounce } from '@/utils/debounce'

const {
  loading,
  errorMsg,
  isStudent,
  isTeacher,
  student,
  teacher,
  refresh,
  setStudentRequest,
  setTeacherRequest,
} = useSessions()

const router = useRouter()
const route = useRoute()

const items = computed(() => {
  if (isStudent.value) return student.value?.items ?? []
  if (isTeacher.value) return teacher.value?.items ?? []
  return []
})

const sortOrder = ref<'asc' | 'desc'>('desc')
const sortedItems = computed(() => {
  const arr = [...items.value]
  arr.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
  return sortOrder.value === 'desc' ? arr.reverse() : arr
})

const search = ref<string>((route.query.search as string) || '')
const preset = ref<DatePreset>((route.query.preset as DatePreset) || 'month')

const totalPages = computed(() => {
  const src = isStudent.value ? student.value : teacher.value
  return src?.totalPages ?? 0
})

const pageNumber = computed(() => {
  const src = isStudent.value ? student.value : teacher.value
  return src?.pageNumber ?? 1
})

function applyPreset() {
  const range = computePresetRange(preset.value)
  const filters = {
    search: search.value || undefined,
    dateStart: range.dateStart,
    dateEnd: range.dateEnd,
  }
  if (isStudent.value) {
    setStudentRequest({ pageNumber: 1, filters })
  } else if (isTeacher.value) {
    setTeacherRequest({ pageNumber: 1, filters })
  }
  router.replace({
    query: {
      ...route.query,
      preset: preset.value,
      search: search.value || undefined,
      sort: sortOrder.value,
    },
  })
  refresh()
}

const applyPresetDebounced = debounce(() => applyPreset(), 350)

watch(search, () => {
  applyPresetDebounced()
})

watch(
  preset,
  () => {
    applyPreset()
  },
  { immediate: true },
)

watch(sortOrder, () => {
  router.replace({
    query: {
      ...route.query,
      preset: preset.value,
      search: search.value || undefined,
      sort: sortOrder.value,
    },
  })
})

function changePage(next: number) {
  if (next < 1 || (totalPages.value && next > totalPages.value)) return
  if (isStudent.value) {
    setStudentRequest({ pageNumber: next })
  } else if (isTeacher.value) {
    setTeacherRequest({ pageNumber: next })
  }
  refresh()
}

function openItem(it: { courseSessionId: number; courseGroupId: number }) {
  if (isTeacher.value) {
    router.push({ name: 'teacher-session-detail', params: { sessionId: it.courseSessionId } })
  } else if (isStudent.value) {
    router.push({
      name: 'student-session-detail',
      params: { sessionId: it.courseSessionId, groupId: it.courseGroupId },
    })
  }
}

function statusDotClass(it: { dateStart: string; dateEnd: string }) {
  const now = Date.now()
  const start = new Date(it.dateStart).getTime()
  const end = new Date(it.dateEnd).getTime()
  if (end < now) return 'bg-slate-500'
  if (start > now) return 'bg-cyan-400'
  return 'bg-emerald-400'
}
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8">
    <div class="mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold">Twoje sesje</h1>
        <span
          v-if="isStudent"
          class="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700"
          >Student</span
        >
        <span
          v-if="isTeacher"
          class="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700"
          >Teacher</span
        >
      </div>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          v-model="preset"
          class="w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-200 py-2 px-3"
        >
          <option value="today">Dzisiaj</option>
          <option value="week">Bieżący tydzień</option>
          <option value="month">Bieżący miesiąc</option>
          <option value="upcoming">Przyszłe</option>
          <option value="past">Minione</option>
          <option value="all">Wszystkie</option>
        </select>
        <input
          v-model="search"
          type="search"
          placeholder="Przedmiot, grupa, lokalizacja…"
          class="w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none py-2 px-3"
        />
        <select
          v-model="sortOrder"
          class="w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-200 py-2 px-3"
        >
          <option value="desc">Najpierw najnowsze</option>
          <option value="asc">Najpierw najstarsze</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid place-items-center py-24 text-slate-300">Ładowanie…</div>
    <div v-else-if="errorMsg" class="py-4 text-red-400">{{ errorMsg }}</div>

    <div v-else-if="items.length === 0" class="py-12 text-center text-slate-400">
      Brak wyników dla wybranych filtrów.
      <div class="mt-2 text-sm">Zmień zakres czasu lub frazę wyszukiwania.</div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="it in sortedItems"
        :key="it.courseSessionId"
        class="cursor-pointer rounded-xl p-4 bg-slate-900 border border-slate-800 shadow-sm hover:border-violet-500/70 hover:bg-slate-800 transition border-l border-emerald-500"
        @click="openItem(it)"
      >
        <header class="mb-2 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-slate-100">{{ it.courseName }}</h2>
            <span class="inline-block w-2 h-2 rounded-full" :class="statusDotClass(it)"></span>
          </div>
          <p class="text-sm text-slate-400">{{ it.courseGroupName }}</p>
        </header>
        <p class="text-sm text-slate-300">{{ it.locationName }}</p>
        <p class="text-sm text-slate-300 mt-1">{{ fmtDate(it.dateStart) }}</p>
        <p class="text-sm text-slate-300">{{ fmtDate(it.dateEnd) }}</p>
      </article>
    </div>

    <div v-if="totalPages > 1" class="mt-6 flex items-center gap-2">
      <button
        class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-violet-500 disabled:opacity-50 cursor-pointer"
        type="button"
        :disabled="pageNumber <= 1"
        @click="changePage(pageNumber - 1)"
      >
        Poprzednia
      </button>
      <span class="text-sm text-slate-400">Strona {{ pageNumber }} z {{ totalPages }}</span>
      <button
        class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 hover:border-violet-500 disabled:opacity-50 cursor-pointer"
        type="button"
        :disabled="pageNumber >= totalPages"
        @click="changePage(pageNumber + 1)"
      >
        Następna
      </button>
    </div>
  </main>
</template>
