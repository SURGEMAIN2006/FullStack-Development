<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users class="w-7 h-7 text-indigo-600" /> Student & User Directory
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          View student academic profiles, contact info, and active checkout logs
        </p>
      </div>

      <button
        v-if="isAdmin"
        @click="showAddModal = true"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start"
      >
        <PlusCircle class="w-4 h-4" /> Add New User
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student name, email, ID, or department..."
          v-model="search"
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
        />
      </div>

      <select
        v-model="departmentFilter"
        class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
      >
        <option value="all">All Departments</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Data Science">Data Science</option>
        <option value="Electrical Engineering">Electrical Engineering</option>
        <option value="Literature & Arts">Literature & Arts</option>
        <option value="Mathematics">Mathematics</option>
      </select>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 space-y-4">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4">Student Profile</th>
              <th class="py-3.5 px-4">Student ID & Code</th>
              <th class="py-3.5 px-4">Department</th>
              <th class="py-3.5 px-4">Role</th>
              <th class="py-3.5 px-4">Active Checkouts</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3 cursor-pointer" @click="handleSelectUser(u)">
                  <img
                    :src="u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
                    :alt="u.name"
                    class="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p class="font-bold text-slate-900">{{ u.name }}</p>
                    <p class="text-[11px] text-slate-500">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 font-mono">
                <strong class="text-slate-800">{{ u.student_id || 'N/A' }}</strong><br />
                <span class="text-[10px] text-indigo-600">{{ u.user_code }}</span>
              </td>
              <td class="py-3.5 px-4 text-slate-700">
                {{ u.department || 'General' }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider',
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-800">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-xs',
                    (u.active_issues || 0) > 0 ? 'bg-sky-100 text-sky-700 font-extrabold' : 'bg-slate-100 text-slate-500'
                  ]"
                >
                  {{ u.active_issues || 0 }} active
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <button
                  @click="handleSelectUser(u)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                >
                  <History class="w-3.5 h-3.5" /> History
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900">Add New Student / User</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleCreateUser" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Mercer"
              v-model="formData.name"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="student@university.edu"
              v-model="formData.email"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Student ID</label>
              <input
                type="text"
                placeholder="STU-2024-001"
                v-model="formData.student_id"
                class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
              <select
                v-model="formData.role"
                class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-medium"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
            <input
              type="text"
              placeholder="Computer Science"
              v-model="formData.department"
              class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
            />
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <Save class="w-3.5 h-3.5" /> Save User
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Borrowing Profile Drawer -->
    <div v-if="selectedUser" class="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-lg h-full border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 class="text-base font-bold text-slate-900">Student Profile & History</h3>
          <button @click="selectedUser = null" class="text-slate-400 hover:text-slate-800">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Profile Summary -->
        <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
          <img
            :src="selectedUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
            :alt="selectedUser.name"
            class="w-14 h-14 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 class="text-base font-bold text-slate-900">{{ selectedUser.name }}</h4>
            <p class="text-xs text-slate-500">{{ selectedUser.email }}</p>
            <p class="text-xs text-indigo-600 font-mono font-semibold mt-1">
              ID: {{ selectedUser.student_id || selectedUser.user_code }} • {{ selectedUser.department }}
            </p>
          </div>
        </div>

        <!-- Active Checkouts & Past Borrowings -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Borrowing Records</h4>
          <p v-if="userHistory?.issues?.length === 0" class="text-xs text-slate-400">
            No borrowing records on file for this user.
          </p>
          <div v-else class="space-y-2.5">
            <div
              v-for="iss in userHistory?.issues"
              :key="iss.id"
              class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
            >
              <div>
                <p class="font-bold text-slate-900">{{ iss.book_title }}</p>
                <p class="text-[11px] text-slate-500">Due: {{ iss.due_date }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold',
                  iss.status === 'Issued' ? 'bg-sky-100 text-sky-700' :
                  iss.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                ]"
              >
                {{ iss.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import { Users, Search, PlusCircle, History, X, Save } from 'lucide-vue-next';

const { isAdmin, showToast } = useAuth();
const users = ref([]);
const loading = ref(true);
const search = ref('');
const departmentFilter = ref('all');

const showAddModal = ref(false);
const formData = ref({
  name: '',
  email: '',
  password: 'student123',
  role: 'student',
  phone: '',
  student_id: '',
  department: 'Computer Science'
});

const selectedUser = ref(null);
const userHistory = ref(null);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (departmentFilter.value !== 'all') params.department = departmentFilter.value;

    const res = await api.getUsers(params);
    users.value = res.users || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

watch([search, departmentFilter], fetchUsers);

const handleCreateUser = async () => {
  try {
    await api.createUser(formData.value);
    showToast(`User "${formData.value.name}" created successfully.`, 'success');
    showAddModal.value = false;
    formData.value = {
      name: '',
      email: '',
      password: 'student123',
      role: 'student',
      phone: '',
      student_id: '',
      department: 'Computer Science'
    };
    fetchUsers();
  } catch (err) {
    showToast(err.message || 'Failed to create user.', 'error');
  }
};

const handleSelectUser = async (userObj) => {
  selectedUser.value = userObj;
  try {
    const res = await api.getUserById(userObj.id);
    userHistory.value = res;
  } catch (err) {
    console.error(err);
  }
};
</script>
