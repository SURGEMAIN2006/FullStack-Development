<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-8 rounded-3xl text-white border border-rose-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30">
          <ShieldAlert class="w-4 h-4" /> Overdue Compliance Monitor
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Overdue Books Tracker</h1>
        <p class="text-sm text-rose-200/80 max-w-xl">
          Identifies all unreturned books past their scheduled due date. Overdue penalties are calculated automatically at check-in.
        </p>
      </div>

      <div class="bg-rose-500/10 border border-rose-500/30 px-6 py-4 rounded-2xl text-center shrink-0">
        <span class="text-3xl font-extrabold text-white block">{{ overdues.length }}</span>
        <span class="text-xs text-rose-300 font-bold uppercase tracking-wider">Active Overdues</span>
      </div>
    </div>

    <!-- Overdue Cards / List -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
      <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
        <Clock class="w-5 h-5 text-rose-600" /> Overdue Items Requiring Librarian Action
      </h3>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-20 bg-slate-100 rounded-2xl animate-pulse" />
      </div>

      <div v-else-if="overdues.length === 0" class="p-12 text-center text-emerald-600 space-y-2">
        <ShieldAlert class="w-12 h-12 mx-auto text-emerald-500 opacity-80" />
        <h4 class="font-bold text-base">Great news! Zero overdue items</h4>
        <p class="text-xs text-slate-500">All issued books are within their valid borrowing windows.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in overdues"
          :key="item.id"
          class="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-300 transition-all"
        >
          <!-- Book & Student Info -->
          <div class="flex items-start gap-4">
            <img
              :src="item.cover_image"
              :alt="item.book_title"
              class="w-12 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900 text-sm">{{ item.book_title }}</h4>
                <span class="px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full">
                  {{ item.overdue_days }} DAYS OVERDUE
                </span>
              </div>
              <p class="text-xs text-slate-600 font-medium">
                Student: <strong class="text-slate-900">{{ item.student_name }}</strong> ({{ item.student_id || item.student_email }})
              </p>
              <div class="flex items-center gap-4 text-[11px] text-slate-500">
                <span>Issue Date: <strong>{{ item.issue_date }}</strong></span>
                <span>Due Date: <strong class="text-rose-600">{{ item.due_date }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="isAdmin" class="flex items-center gap-2 shrink-0">
            <button
              @click="handleOpenReturnModal(item)"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <BookDown class="w-4 h-4" /> Process Return
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Return Modal -->
    <div v-if="selectedIssue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-base font-bold text-slate-900">Return Overdue Book</h3>
        <p class="text-xs text-slate-500">
          Calculate fine and clear overdue status for <strong>{{ selectedIssue.book_title }}</strong> issued to <strong>{{ selectedIssue.student_name }}</strong>.
        </p>

        <form @submit.prevent="handleConfirmReturn" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Return Date</label>
            <input
              type="date"
              v-model="returnDate"
              class="w-full px-3.5 py-2 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Overdue Fine ($)</label>
            <input
              type="number"
              step="0.50"
              v-model.number="fineAmount"
              class="w-full px-3.5 py-2 text-sm border rounded-xl font-bold"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="selectedIssue = null"
              class="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Confirm Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import { ShieldAlert, BookDown, Clock } from 'lucide-vue-next';

const { isAdmin, showToast } = useAuth();
const overdues = ref([]);
const loading = ref(true);

const selectedIssue = ref(null);
const returnDate = ref(new Date().toISOString().split('T')[0]);
const fineAmount = ref(0);

const fetchOverdues = async () => {
  loading.value = true;
  try {
    const res = await api.getOverdueIssues();
    overdues.value = res.overdues || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOverdues);

const handleOpenReturnModal = (item) => {
  selectedIssue.value = item;
  returnDate.value = new Date().toISOString().split('T')[0];
  fineAmount.value = (item.overdue_days || 1) * 2.0;
};

const handleConfirmReturn = async () => {
  if (!selectedIssue.value) return;
  try {
    const res = await api.returnBook(selectedIssue.value.id, {
      return_date: returnDate.value,
      fine_amount: fineAmount.value
    });
    showToast(res.message, 'success');
    selectedIssue.value = null;
    fetchOverdues();
  } catch (err) {
    showToast(err.message || 'Failed to return book.', 'error');
  }
};
</script>
