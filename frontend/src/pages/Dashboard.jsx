import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle2,
  BookMarked,
  BookmarkCheck,
  ShieldAlert,
  Users,
  PlusCircle,
  BookUp,
  BookDown,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

export const Dashboard = ({ onOpenAddBook, onOpenIssueBook }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-20 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const overdueAlerts = data?.overdueAlerts || [];
  const recentIssues = data?.recentIssues || [];

  // 1. Books Issued Over Time Line Chart
  const lineChartData = {
    labels: charts.issuedOverTime?.map(d => d.month) || ['May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        fill: true,
        label: 'Books Issued',
        data: charts.issuedOverTime?.map(d => d.total_issued) || [12, 19, 25, 31],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4
      }
    ]
  };

  // 2. Monthly Activity Bar Chart
  const barChartData = {
    labels: charts.monthlyActivity?.map(d => d.month_name) || ['May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Issued',
        data: charts.monthlyActivity?.map(d => d.issued_count) || [14, 22, 28, 35],
        backgroundColor: '#3b82f6',
        borderRadius: 6
      },
      {
        label: 'Returned',
        data: charts.monthlyActivity?.map(d => d.returned_count) || [10, 18, 24, 29],
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Overdue',
        data: charts.monthlyActivity?.map(d => d.overdue_count) || [1, 2, 3, 4],
        backgroundColor: '#f43f5e',
        borderRadius: 6
      }
    ]
  };

  // 3. Category Distribution Doughnut Chart
  const categoryChartData = {
    labels: charts.categoryWise?.map(c => c.category) || [],
    datasets: [
      {
        data: charts.categoryWise?.map(c => c.book_count) || [],
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Executive Welcome & Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Systematic Library Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {isAdmin
                ? 'Here is an overview of active catalog metrics, circulating items, borrowing velocity, and overdue items.'
                : 'Manage your active book checkouts, reservations, and explore new academic additions.'}
            </p>
          </div>

          {/* Action Bar */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenIssueBook}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                <BookUp className="w-4 h-4" /> Issue Book
              </button>
              <button
                onClick={onOpenAddBook}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Add Book
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Warning Alert Banner if any overdue books */}
      {overdueAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Overdue Alert Notice</h4>
              <p className="text-xs text-rose-700 font-medium">
                There are <strong className="font-bold">{stats.overdueBooks} overdue items</strong> requiring librarian review or student notice.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/overdue')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors shrink-0"
          >
            Review Overdues
          </button>
        </div>
      )}

      {/* 6 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Books"
          value={stats.totalBooks || 0}
          subtitle={`${stats.totalCopies || 0} Total Copies`}
          icon={BookOpen}
          color="indigo"
          onClick={() => navigate('/books')}
        />
        <StatCard
          title="Available Copies"
          value={stats.availableBooks || 0}
          subtitle="Ready to Issue"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/books?availability=available')}
        />
        <StatCard
          title="Issued Books"
          value={stats.issuedBooks || 0}
          subtitle="Currently Out"
          icon={BookMarked}
          color="sky"
          onClick={() => navigate('/issues')}
        />
        <StatCard
          title="Reserved Copies"
          value={stats.reservedBooks || 0}
          subtitle="Active Queues"
          icon={BookmarkCheck}
          color="amber"
          onClick={() => navigate('/bookings')}
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueBooks || 0}
          subtitle="Action Needed"
          icon={ShieldAlert}
          color="rose"
          onClick={() => navigate('/overdue')}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          subtitle="Registered Users"
          icon={Users}
          color="purple"
          onClick={() => navigate('/students')}
        />
      </div>

      {/* Visual Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Books Issued Over Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Books Issued Over Time
              </h3>
              <p className="text-xs text-slate-500 font-medium">Monthly circulation trajectory</p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-600 rounded-lg">
              Historical Velocity
            </span>
          </div>
          <div className="h-64">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 2: Monthly Borrowing Activity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" /> Monthly Borrowing Activity
              </h3>
              <p className="text-xs text-slate-500 font-medium">Issued vs Returned vs Overdue breakdown</p>
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Category-wise Distribution & Most Popular Books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category-wise Distribution Doughnut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Category-wise Books</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Stock distribution by subject discipline</p>
            <div className="h-56 flex items-center justify-center">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }}
              />
            </div>
          </div>
        </div>

        {/* Most Popular Books */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Most Popular Books
              </h3>
              <p className="text-xs text-slate-500 font-medium">Highest frequency borrowed titles</p>
            </div>
            <button
              onClick={() => navigate('/books')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {charts.popularBooks?.map((book, idx) => (
              <div key={book.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center text-xs font-extrabold text-slate-400">#{idx + 1}</span>
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="w-10 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">by {book.author}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full">
                    {book.borrow_count} checkouts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
