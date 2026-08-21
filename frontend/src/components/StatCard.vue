<template>
  <div
    @click="$emit('click')"
    :class="[
      'relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200',
      $attrs.onClick ? 'cursor-pointer hover:border-indigo-200' : ''
    ]"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ title }}</p>
        <h3 class="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{{ value }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-1 font-medium">{{ subtitle }}</p>
      </div>
      <div v-if="icon" :class="['p-3 rounded-xl border', colorMap[color] || colorMap.indigo]">
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>
    <div v-if="badgeText" class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
      <span class="text-slate-500">{{ badgeText }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: Object,
  color: { type: String, default: 'indigo' },
  subtitle: String,
  badgeText: String
});

defineEmits(['click']);

const colorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
  sky: 'bg-sky-500/10 text-sky-600 border-sky-100',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-100',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-100',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-100'
};
</script>
