<template>
  <div class="p-6 space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bell class="w-7 h-7 text-indigo-600" /> Notifications Feed
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          System updates, checkout due reminders, and reservation alerts
        </p>
      </div>

      <button
        @click="handleMarkAllRead"
        class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
      >
        Mark All Read
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
      <div v-if="loading" class="p-8 space-y-4">
        <div v-for="i in 5" :key="i" class="h-16 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
      <div v-else-if="notifications.length === 0" class="p-12 text-center text-slate-400 text-sm">
        No notifications in your inbox.
      </div>
      <div
        v-else
        v-for="n in notifications"
        :key="n.id"
        @click="handleMarkSingleRead(n.id)"
        :class="[
          'p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer',
          parseInt(n.is_read) === 1 ? 'opacity-60' : 'bg-indigo-50/30'
        ]"
      >
        <div
          :class="[
            'p-2.5 rounded-2xl shrink-0',
            n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
            n.type === 'danger' ? 'bg-rose-100 text-rose-600' :
            n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
          ]"
        >
          <CheckCircle2 v-if="n.type === 'success'" class="w-5 h-5" />
          <ShieldAlert v-else-if="n.type === 'danger'" class="w-5 h-5" />
          <Info v-else class="w-5 h-5" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-slate-900">{{ n.title }}</h4>
            <span class="text-[10px] text-slate-400 font-mono">
              {{ new Date(n.created_at).toLocaleString() }}
            </span>
          </div>
          <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ n.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import { Bell, CheckCircle2, ShieldAlert, Info } from 'lucide-vue-next';

const { showToast } = useAuth();
const notifications = ref([]);
const loading = ref(true);

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await api.getNotifications();
    notifications.value = res.notifications || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchNotifications);

const handleMarkAllRead = async () => {
  try {
    await api.markAllNotificationsRead();
    notifications.value = notifications.value.map(n => ({ ...n, is_read: 1 }));
    showToast('All notifications marked as read.', 'success');
  } catch (err) {
    showToast('Failed to update notifications.', 'error');
  }
};

const handleMarkSingleRead = async (id) => {
  try {
    await api.markNotificationRead(id);
    notifications.value = notifications.value.map(n => n.id === id ? { ...n, is_read: 1 } : n);
  } catch (err) {
    console.error(err);
  }
};
</script>
