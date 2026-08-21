<template>
  <header
    :class="[
      'fixed top-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 flex items-center justify-between px-6',
      isCollapsed ? 'left-20' : 'left-64'
    ]"
  >
    <!-- Global Search Bar -->
    <form @submit.prevent="handleSearchSubmit" class="relative w-full max-w-md">
      <div class="relative flex items-center">
        <Search class="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search books by title, author, ISBN, category..."
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all outline-none font-medium placeholder:text-slate-400"
        />
      </div>
    </form>

    <!-- Right Controls -->
    <div class="flex items-center gap-4">
      <!-- Notification Bell Dropdown -->
      <div class="relative" ref="notifMenuRef">
        <button
          @click="toggleNotifications"
          class="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="unreadCount > 0"
            class="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <!-- Notifications Panel -->
        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-slate-900">Notifications</h4>
              <span v-if="unreadCount > 0" class="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-100 text-indigo-700 rounded-full">
                {{ unreadCount }} new
              </span>
            </div>
            <button
              @click="markAllRead"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Mark all read
            </button>
          </div>

          <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
            <div v-if="notifications.length === 0" class="p-6 text-center text-slate-400 text-sm">
              No notifications yet.
            </div>
            <div
              v-else
              v-for="n in notifications"
              :key="n.id"
              @click="markSingleRead(n.id)"
              :class="[
                'p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors',
                n.is_read ? 'opacity-70' : 'bg-indigo-50/30'
              ]"
            >
              <div
                :class="[
                  'p-2 rounded-xl shrink-0',
                  n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  n.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                  n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                ]"
              >
                <Check v-if="n.type === 'success'" class="w-4 h-4" />
                <AlertCircle v-else-if="n.type === 'danger'" class="w-4 h-4" />
                <Info v-else class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-900 truncate">{{ n.title }}</p>
                <p class="text-xs text-slate-600 mt-0.5 leading-snug">{{ n.message }}</p>
                <span class="text-[10px] text-slate-400 mt-1 block">
                  {{ new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-2 border-t border-slate-100 text-center bg-slate-50">
            <button
              @click="showNotifications = false; $router.push('/notifications')"
              class="text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              View All Notifications
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Menu Dropdown -->
      <div class="relative" ref="profileMenuRef">
        <button
          @click="showProfileMenu = !showProfileMenu"
          class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <img
            :src="user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
            alt="Profile Avatar"
            class="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div class="hidden sm:block text-left">
            <p class="text-xs font-bold text-slate-900 leading-none">{{ user?.name }}</p>
            <span class="text-[10px] text-slate-500 font-medium capitalize">{{ user?.role }}</span>
          </div>
        </button>

        <div
          v-if="showProfileMenu"
          class="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div class="px-3 py-2 border-b border-slate-100">
            <p class="text-xs font-bold text-slate-900">{{ user?.name }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
          </div>
          <button
            @click="showProfileMenu = false; $router.push('/settings')"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors mt-1"
          >
            <User class="w-4 h-4 text-slate-500" /> Account Settings
          </button>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut class="w-4 h-4 text-rose-500" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import { Search, Bell, User, LogOut, Settings, Check, AlertCircle, Info } from 'lucide-vue-next';

const props = defineProps({
  isCollapsed: Boolean,
  unreadCount: { type: Number, default: 0 }
});

const emit = defineEmits(['notification-read']);

const { user, logout } = useAuth();
const router = useRouter();

const searchQuery = ref('');
const showProfileMenu = ref(false);
const showNotifications = ref(false);
const notifications = ref([]);

const profileMenuRef = ref(null);
const notifMenuRef = ref(null);

const handleClickOutside = (event) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
  if (notifMenuRef.value && !notifMenuRef.value.contains(event.target)) {
    showNotifications.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    router.push(`/books?search=${encodeURIComponent(searchQuery.value.trim())}`);
  }
};

const fetchNotifications = async () => {
  try {
    const res = await api.getNotifications();
    notifications.value = res.notifications || [];
  } catch (err) {
    console.error(err);
  }
};

const toggleNotifications = () => {
  if (!showNotifications.value) {
    fetchNotifications();
  }
  showNotifications.value = !showNotifications.value;
};

const markAllRead = async () => {
  try {
    await api.markAllNotificationsRead();
    notifications.value = notifications.value.map(n => ({ ...n, is_read: 1 }));
    emit('notification-read');
  } catch (err) {
    console.error(err);
  }
};

const markSingleRead = async (id) => {
  try {
    await api.markNotificationRead(id);
    notifications.value = notifications.value.map(n => n.id === id ? { ...n, is_read: 1 } : n);
    emit('notification-read');
  } catch (err) {
    console.error(err);
  }
};

const handleLogout = () => {
  showProfileMenu.value = false;
  logout();
  router.push('/login');
};
</script>
