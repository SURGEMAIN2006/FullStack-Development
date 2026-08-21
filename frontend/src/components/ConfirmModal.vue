<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 text-center space-y-4">
      <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
        <p class="text-xs text-slate-500 mt-1">{{ message }}</p>
      </div>
      <div class="pt-3 flex items-center justify-center gap-3">
        <button
          @click="$emit('close')"
          class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm'); $emit('close');"
          :class="[
            'px-6 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all',
            variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  title: String,
  message: String,
  confirmText: { type: String, default: 'Confirm' },
  variant: { type: String, default: 'danger' }
});

defineEmits(['close', 'confirm']);
</script>
