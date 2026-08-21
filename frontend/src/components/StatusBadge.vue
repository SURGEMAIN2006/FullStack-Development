<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border',
      computedStyle
    ]"
  >
    <CheckCircle2 v-if="type === 'available'" class="w-3.5 h-3.5 text-emerald-600" />
    <BookCheck v-else-if="type === 'issued'" class="w-3.5 h-3.5 text-sky-600" />
    <ShieldAlert v-else-if="type === 'overdue'" class="w-3.5 h-3.5 text-rose-600" />
    <AlertTriangle v-else-if="type === 'reserved'" class="w-3.5 h-3.5 text-amber-600" />
    <Clock v-else class="w-3.5 h-3.5" />

    <span>{{ status }}</span>
    <span v-if="count !== undefined" class="ml-0.5 font-bold">({{ count }})</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { CheckCircle2, Clock, AlertTriangle, BookCheck, ShieldAlert } from 'lucide-vue-next';

const props = defineProps({
  status: [String, Number],
  count: Number
});

const norm = computed(() => String(props.status || '').toLowerCase());

const type = computed(() => {
  if (norm.value === 'available' || norm.value === 'returned' || norm.value === 'completed') return 'available';
  if (norm.value === 'issued' || norm.value === 'approved') return 'issued';
  if (norm.value === 'overdue' || norm.value === 'danger') return 'overdue';
  if (norm.value === 'pending' || norm.value === 'reserved' || norm.value === 'unavailable') return 'reserved';
  return 'default';
});

const computedStyle = computed(() => {
  switch (type.value) {
    case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium';
    case 'issued': return 'bg-sky-50 text-sky-700 border-sky-200/80 font-medium';
    case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-200/80 font-medium';
    case 'reserved': return 'bg-amber-50 text-amber-700 border-amber-200/80 font-medium';
    default: return 'bg-slate-100 text-slate-500 border-slate-200 font-medium';
  }
});
</script>
