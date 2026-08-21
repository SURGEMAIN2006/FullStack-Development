<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Executive Welcome & Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles class="w-3.5 h-3.5" /> Systematic Library Control Center (Vue 3)
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {{ user?.name }}!
          </h1>
          <p class="text-sm text-slate-300 max-w-xl">
            {{ isAdmin
              ? 'Here is an overview of active catalog metrics, circulating items, borrowing velocity, and overdue items.'
              : 'Manage your active book checkouts, reservations, and explore new academic additions.' }}
          </p>
        </div>

        <!-- Action Bar -->
        <div v-if="isAdmin" class="flex flex-wrap items-center gap-3">
          <button
            @click="$emit('open-issue-book')"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <BookUp class="w-4 h-4" /> Issue Book
          </button>
          <button
            @click="$emit('open-add-book')"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
          >
            <PlusCircle class="w-4 h-4" /> Add Book
          </button>
        </div>
      </div>
    </div>

    <!-- Overdue Warning Alert Banner -->
    <div v-if="overdueAlerts.length > 0" class="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
          <ShieldAlert class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-rose-900 uppercase tracking-wider">Overdue Alert Notice</h4>
          <p class="text-xs text-rose-700 font-medium">
            There are <strong class="font-bold">{{ stats.overdueBooks }} overdue items</strong> requiring librarian review or student notice.
          </p>
        </div>
      </div>
      <button
        @click="$router.push('/overdue')"
        class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors shrink-0"
      >
        Review Overdues
      </button>
    </div>

    <!-- 6 Metric Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        title="Total Books"
        :value="stats.totalBooks || 0"
        :subtitle="`${stats.totalCopies || 0} Total Copies`"
        :icon="BookOpen"
        color="indigo"
        @click="$router.push('/books')"
      />
      <StatCard
        title="Available Copies"
        :value="stats.availableBooks || 0"
        subtitle="Ready to Issue"
        :icon="CheckCircle2"
        color="emerald"
        @click="$router.push('/books?availability=available')"
      />
      <StatCard
        title="Issued Books"
        :value="stats.issuedBooks || 0"
        subtitle="Currently Out"
        :icon="BookMarked"
        color="sky"
        @click="$router.push('/issues')"
      />
      <StatCard
        title="Reserved Copies"
        :value="stats.reservedBooks || 0"
        subtitle="Active Queues"
        :icon="BookmarkCheck"
        color="amber"
        @click="$router.push('/bookings')"
      />
      <StatCard
        title="Overdue Books"
        :value="stats.overdueBooks || 0"
        subtitle="Action Needed"
        :icon="ShieldAlert"
        color="rose"
        @click="$router.push('/overdue')"
      />
      <StatCard
        title="Total Students"
        :value="stats.totalStudents || 0"
        subtitle="Registered Users"
        :icon="Users"
        color="purple"
        @click="$router.push('/students')"
      />
    </div>

    <!-- Visual Analytics & Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chart 1: Books Issued Over Time -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-indigo-600" /> Books Issued Over Time
            </h3>
            <p class="text-xs text-slate-500 font-medium">Monthly circulation trajectory</p>
          </div>
          <span class="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-600 rounded-lg">
            Historical Velocity
          </span>
        </div>
        <div class="h-64">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Chart 2: Monthly Borrowing Activity -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock class="w-4 h-4 text-sky-600" /> Monthly Borrowing Activity
            </h3>
            <p class="text-xs text-slate-500 font-medium">Issued vs Returned vs Overdue breakdown</p>
          </div>
        </div>
        <div class="h-64">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>

    <!-- Bottom Grid: Category-wise Distribution & Most Popular Books -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Category-wise Distribution Doughnut -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900 mb-1">Category-wise Books</h3>
          <p class="text-xs text-slate-500 font-medium mb-4">Stock distribution by subject discipline</p>
          <div class="h-56 flex items-center justify-center">
            <Doughnut :data="categoryChartData" :options="doughnutChartOptions" />
          </div>
        </div>
      </div>

      <!-- Most Popular Books -->
      <div class="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award class="w-4 h-4 text-amber-500" /> Most Popular Books
            </h3>
            <p class="text-xs text-slate-500 font-medium">Highest frequency borrowed titles</p>
          </div>
          <button
            @click="$router.push('/books')"
            class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View Catalog <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="(book, idx) in popularBooks" :key="book.id" class="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-6 text-center text-xs font-extrabold text-slate-400">#{{ idx + 1 }}</span>
              <img
                :src="book.cover_image"
                :alt="book.title"
                class="w-10 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-slate-900 truncate">{{ book.title }}</h4>
                <p class="text-[11px] text-slate-500 truncate">by {{ book.author }}</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full">
                {{ book.borrow_count }} checkouts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import StatCard from '../components/StatCard.vue';
import {
  BookOpen,
  CheckCircle2,
  BookMarked,
  BookmarkCheck,
  ShieldAlert,
  Users,
  PlusCircle,
  BookUp,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-vue-next';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

defineEmits(['open-add-book', 'open-issue-book']);

const { user, isAdmin } = useAuth();
const router = useRouter();

const stats = ref({});
const charts = ref({});
const overdueAlerts = ref([]);
const popularBooks = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.getDashboardStats();
    stats.value = res.stats || {};
    charts.value = res.charts || {};
    overdueAlerts.value = res.overdueAlerts || [];
    popularBooks.value = res.charts?.popularBooks || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const lineChartData = computed(() => ({
  labels: charts.value.issuedOverTime?.map(d => d.month) || ['May', 'Jun', 'Jul', 'Aug'],
  datasets: [
    {
      fill: true,
      label: 'Books Issued',
      data: charts.value.issuedOverTime?.map(d => d.total_issued) || [12, 19, 25, 31],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      pointBackgroundColor: '#4f46e5',
      pointRadius: 4
    }
  ]
}));

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
    x: { grid: { display: false } }
  }
};

const barChartData = computed(() => ({
  labels: charts.value.monthlyActivity?.map(d => d.month_name) || ['May', 'Jun', 'Jul', 'Aug'],
  datasets: [
    {
      label: 'Issued',
      data: charts.value.monthlyActivity?.map(d => d.issued_count) || [14, 22, 28, 35],
      backgroundColor: '#3b82f6',
      borderRadius: 6
    },
    {
      label: 'Returned',
      data: charts.value.monthlyActivity?.map(d => d.returned_count) || [10, 18, 24, 29],
      backgroundColor: '#10b981',
      borderRadius: 6
    },
    {
      label: 'Overdue',
      data: charts.value.monthlyActivity?.map(d => d.overdue_count) || [1, 2, 3, 4],
      backgroundColor: '#f43f5e',
      borderRadius: 6
    }
  ]
}));

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
    x: { grid: { display: false } }
  }
};

const categoryChartData = computed(() => ({
  labels: charts.value.categoryWise?.map(c => c.category) || [],
  datasets: [
    {
      data: charts.value.categoryWise?.map(c => c.book_count) || [],
      backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      borderWidth: 0
    }
  ]
}));

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
};
</script>
