<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookMarked class="w-7 h-7 text-indigo-600" /> Issued Books Register
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          Track, audit, and process physical checkout check-ins and check-outs
        </p>
      </div>

      <button
        v-if="isAdmin"
        @click="$emit('open-issue-book')"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start"
      >
        <BookMarked class="w-4 h-4" /> Issue New Book
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student name, book title, ISBN, issue code..."
          v-model="search"
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
        />
      </div>

      <select
        v-model="statusFilter"
        class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
      >
        <option value="all">All Issue Statuses</option>
        <option value="Issued">Issued Only</option>
        <option value="Returned">Returned</option>
        <option value="Overdue">Overdue Only</option>
      </select>
    </div>

    <!-- Professional Master Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 space-y-4">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="issues.length === 0" class="p-12 text-center text-slate-400 text-sm">
        No checkout records found matching filter criteria.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4">Issue Code</th>
              <th class="py-3.5 px-4">Student Details</th>
              <th class="py-3.5 px-4">Book Title</th>
              <th class="py-3.5 px-4">Issue Date</th>
              <th class="py-3.5 px-4">Due Date</th>
              <th class="py-3.5 px-4">Status</th>
              <th v-if="isAdmin" class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium">
            <tr v-for="item in issues" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-indigo-600">
                {{ item.issue_code }}
              </td>
              <td class="py-3.5 px-4">
                <div>
                  <p class="font-bold text-slate-900">{{ item.student_name }}</p>
                  <p class="text-[11px] text-slate-500 font-mono">{{ item.student_id || item.student_email }}</p>
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
                    <p class="text-[11px] text-slate-500 truncate">ISBN: {{ item.isbn }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 text-slate-700">
                {{ item.issue_date }}
              </td>
              <td class="py-3.5 px-4">
                <span :class="item.overdue_days > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'">
                  {{ item.due_date }}
                </span>
                <span v-if="item.overdue_days > 0" class="block text-[10px] text-rose-500 font-extrabold">
                  ({{ item.overdue_days }} days overdue)
                </span>
              </td>
              <td class="py-3.5 px-4">
                <StatusBadge :status="item.status" />
              </td>
              <td v-if="isAdmin" class="py-3.5 px-4 text-right">
                <button
                  v-if="item.status !== 'Returned'"
                  @click="handleOpenReturnModal(item)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  <BookDown class="w-3.5 h-3.5" /> Return Book
                </button>
                <span v-else class="text-[11px] text-slate-400 font-mono">
                  Returned on {{ item.return_date }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Return Book Modal -->
    <div v-if="selectedIssue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <BookDown class="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-900">Process Book Return</h3>
          </div>
          <button @click="selectedIssue = null" class="text-slate-400 hover:text-slate-700">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
          <p class="text-slate-500">Student: <strong class="text-slate-900">{{ selectedIssue.student_name }}</strong></p>
          <p class="text-slate-500">Book: <strong class="text-slate-900">{{ selectedIssue.book_title }}</strong></p>
          <p class="text-slate-500">Due Date: <strong class="text-slate-900">{{ selectedIssue.due_date }}</strong></p>
          <p v-if="selectedIssue.overdue_days > 0" class="text-rose-600 font-bold">Overdue by {{ selectedIssue.overdue_days }} days!</p>
        </div>

        <form @submit.prevent="handleConfirmReturn" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Return Date</label>
            <input
              type="date"
              required
              v-model="returnDate"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Overdue Fine Amount ($)
            </label>
            <div class="relative">
              <DollarSign class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.50"
                v-model.number="fineAmount"
                class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Condition / Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Returned in pristine condition"
              v-model="notes"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
            />
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button
              type="button"
              @click="selectedIssue = null"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <CheckCircle2 class="w-4 h-4" /> Confirm Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge.vue';
import { BookMarked, Search, BookDown, X, DollarSign, CheckCircle2 } from 'lucide-vue-next';

defineEmits(['open-issue-book']);

const { isAdmin, showToast } = useAuth();

const issues = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('all');

const selectedIssue = ref(null);
const returnDate = ref(new Date().toISOString().split('T')[0]);
const fineAmount = ref(0);
const notes = ref('');

const fetchIssues = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (statusFilter.value !== 'all') params.status = statusFilter.value;

    const res = await api.getIssues(params);
    issues.value = res.issues || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchIssues);

watch([search, statusFilter], fetchIssues);

const handleOpenReturnModal = (issue) => {
  selectedIssue.value = issue;
  returnDate.value = new Date().toISOString().split('T')[0];
  fineAmount.value = issue.overdue_days > 0 ? issue.overdue_days * 2.0 : 0;
  notes.value = '';
};

const handleConfirmReturn = async () => {
  if (!selectedIssue.value) return;

  try {
    const res = await api.returnBook(selectedIssue.value.id, {
      return_date: returnDate.value,
      fine_amount: fineAmount.value,
      notes: notes.value
    });
    showToast(res.message, 'success');
    selectedIssue.value = null;
    fetchIssues();
  } catch (err) {
    showToast(err.message || 'Failed to process return.', 'error');
  }
};
</script>
