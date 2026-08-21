<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
        <History class="w-7 h-7 text-indigo-600" /> Full Borrowing Audit Log
      </h1>
      <p class="text-xs text-slate-500 font-medium mt-0.5">
        Comprehensive historical archive of all current checkouts, returns, and overdue fines
      </p>
    </div>

    <!-- Filter & Search -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student, book, ISBN, or issue code..."
          v-model="search"
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white outline-none"
        />
      </div>

      <select
        v-model="statusFilter"
        class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white outline-none"
      >
        <option value="all">All History</option>
        <option value="Issued">Active Issued</option>
        <option value="Returned">Completed Returned</option>
        <option value="Overdue">Overdue Archive</option>
      </select>
    </div>

    <!-- Table Log -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 space-y-4">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="history.length === 0" class="p-12 text-center text-slate-400 text-sm">
        No borrowing log history records match search criteria.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4">Transaction Code</th>
              <th class="py-3.5 px-4">Student</th>
              <th class="py-3.5 px-4">Book Title</th>
              <th class="py-3.5 px-4">Issue Date</th>
              <th class="py-3.5 px-4">Due Date</th>
              <th class="py-3.5 px-4">Return Date</th>
              <th class="py-3.5 px-4">Fine Amount</th>
              <th class="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium">
            <tr v-for="item in history" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-indigo-600">
                {{ item.issue_code }}
              </td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900">{{ item.student_name }}</p>
                <p class="text-[11px] text-slate-500">{{ item.student_email }}</p>
              </td>
              <td class="py-3.5 px-4 max-w-xs">
                <p class="font-bold text-slate-900 truncate">{{ item.book_title }}</p>
                <p class="text-[11px] font-mono text-slate-500">ISBN: {{ item.isbn }}</p>
              </td>
              <td class="py-3.5 px-4 text-slate-700">{{ item.issue_date }}</td>
              <td class="py-3.5 px-4 text-slate-700">{{ item.due_date }}</td>
              <td class="py-3.5 px-4 text-slate-700 font-bold">
                {{ item.return_date || 'Pending Check-in' }}
              </td>
              <td class="py-3.5 px-4 font-bold">
                <span v-if="parseFloat(item.fine_amount) > 0" class="text-rose-600 font-mono">
                  ${{ parseFloat(item.fine_amount).toFixed(2) }}
                </span>
                <span v-else class="text-slate-400">$0.00</span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <StatusBadge :status="item.status" />
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
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge.vue';
import { History, Search } from 'lucide-vue-next';

const history = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('all');

const fetchHistory = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (statusFilter.value !== 'all') params.status = statusFilter.value;

    const res = await api.getIssues(params);
    history.value = res.issues || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchHistory);

watch([search, statusFilter], fetchHistory);
</script>
