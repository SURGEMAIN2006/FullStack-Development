<template>
  <div v-if="toast" class="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-md">
    <div
      :class="[
        'flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all',
        bgStyles[toast.type] || bgStyles.info
      ]"
    >
      <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-400" />
      <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-400" />
      <AlertCircle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-400" />
      <Info v-else class="w-5 h-5 text-sky-400" />

      <span class="text-sm font-medium pr-2">{{ toast.message }}</span>

      <button
        @click="dismissToast"
        class="ml-auto text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const { toast, dismissToast } = useAuth();

const bgStyles = {
  success: 'bg-slate-900 border-emerald-500/30 text-white',
  error: 'bg-slate-900 border-rose-500/30 text-white',
  warning: 'bg-slate-900 border-amber-500/30 text-white',
  info: 'bg-slate-900 border-sky-500/30 text-white'
};
</script>
