<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
        <BookmarkCheck class="w-7 h-7 text-indigo-600" /> Bookings & Reservations Queue
      </h1>
      <p class="text-xs text-slate-500 font-medium mt-0.5">
        Manage hold requests, queue ordering, and reservation approvals
      </p>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student name, book title, booking code..."
          v-model="search"
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
        />
      </div>

      <select
        v-model="statusFilter"
        class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
      >
        <option value="all">All Reservation Statuses</option>
        <option value="Pending">Pending Approval</option>
        <option value="Approved">Approved</option>
        <option value="Reserved">Held at Desk (Reserved)</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Bookings Queue Grid/Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 space-y-4">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="bookings.length === 0" class="p-12 text-center text-slate-400 text-sm">
        No reservation records found.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4">Booking Code</th>
              <th class="py-3.5 px-4">Student</th>
              <th class="py-3.5 px-4">Book Requested</th>
              <th class="py-3.5 px-4">Queue Position</th>
              <th class="py-3.5 px-4">Booking Date</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium">
            <tr v-for="item in bookings" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-indigo-600">
                {{ item.booking_code }}
              </td>
              <td class="py-3.5 px-4">
                <div>
                  <p class="font-bold text-slate-900">{{ item.student_name }}</p>
                  <p class="text-[11px] text-slate-500">{{ item.department }}</p>
                </div>
              </td>
              <td class="py-3.5 px-4 max-w-xs">
                <div class="flex items-center gap-2.5">
                  <img
                    :src="item.cover_image"
                    :alt="item.book_title"
                    class="w-7 h-9 rounded object-cover border border-slate-200 shrink-0"
                  />
                  <div class="truncate">
                    <p class="font-bold text-slate-900 truncate">{{ item.book_title }}</p>
                    <p class="text-[11px] text-slate-500 truncate">by {{ item.book_author }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full">
                  #{{ item.queue_position }} in line
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-700">
                {{ item.booking_date }}
              </td>
              <td class="py-3.5 px-4">
                <StatusBadge :status="item.status" />
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <template v-if="isAdmin">
                    <button
                      v-if="item.status === 'Pending'"
                      @click="handleUpdateStatus(item.id, 'Approved')"
                      class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      v-if="item.status === 'Approved'"
                      @click="handleUpdateStatus(item.id, 'Reserved')"
                      class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-sm"
                    >
                      Mark Ready
                    </button>
                    <button
                      v-if="item.status !== 'Cancelled' && item.status !== 'Completed'"
                      @click="handleCancelBooking(item.id)"
                      class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Cancel Reservation"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </template>
                  <template v-else>
                    <button
                      v-if="item.status !== 'Cancelled' && item.status !== 'Completed'"
                      @click="handleCancelBooking(item.id)"
                      class="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] rounded-lg"
                    >
                      Cancel Hold
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge.vue';
import { BookmarkCheck, Search, X } from 'lucide-vue-next';

const { isAdmin, showToast } = useAuth();
const bookings = ref([]);
const loading = ref(true);

const search = ref('');
const statusFilter = ref('all');

const fetchBookings = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (statusFilter.value !== 'all') params.status = statusFilter.value;

    const res = await api.getBookings(params);
    bookings.value = res.bookings || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBookings);

watch([search, statusFilter], fetchBookings);

const handleUpdateStatus = async (id, newStatus) => {
  try {
    const res = await api.updateBookingStatus(id, { status: newStatus });
    showToast(res.message, 'success');
    fetchBookings();
  } catch (err) {
    showToast(err.message || 'Failed to update reservation status.', 'error');
  }
};

const handleCancelBooking = async (id) => {
  if (!window.confirm('Are you sure you want to cancel this reservation request?')) return;
  try {
    const res = await api.cancelBooking(id);
    showToast(res.message, 'info');
    fetchBookings();
  } catch (err) {
    showToast(err.message || 'Failed to cancel booking.', 'error');
  }
};
</script>
