<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-2xl shadow-indigo-500/40 mb-4">
        <Library class="w-8 h-8" />
      </div>
      <h2 class="text-3xl font-extrabold text-white tracking-tight">Student Registration</h2>
      <p class="mt-1 text-sm font-medium text-slate-400">Join the LibraSphere academic portal</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
      <div class="bg-slate-900/90 border border-slate-800 p-8 shadow-2xl rounded-3xl backdrop-blur-xl">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Full Name *</label>
            <div class="relative">
              <User class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Alex Mercer"
                v-model="formData.name"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email *</label>
              <div class="relative">
                <Mail class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@university.edu"
                  v-model="formData.email"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Password *</label>
              <div class="relative">
                <Lock class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  v-model="formData.password"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Student ID</label>
              <div class="relative">
                <BadgeCheck class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="STU-2024-001"
                  v-model="formData.student_id"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Phone</label>
              <div class="relative">
                <Phone class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  v-model="formData.phone"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Department</label>
            <div class="relative">
              <GraduationCap class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <select
                v-model="formData.department"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Literature & Arts">Literature & Arts</option>
                <option value="Business Administration">Business Administration</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-4"
          >
            {{ loading ? 'Creating Account...' : 'Register Student Account' }}
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-slate-400">
          Already have an account?
          <router-link to="/login" class="font-bold text-indigo-400 hover:text-indigo-300">
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { Library, User, Mail, Lock, Phone, BadgeCheck, GraduationCap, ArrowRight } from 'lucide-vue-next';

const formData = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  student_id: '',
  department: 'Computer Science'
});

const loading = ref(false);
const { register } = useAuth();
const router = useRouter();

const handleSubmit = async () => {
  loading.value = true;
  try {
    await register({ ...formData.value, role: 'student' });
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
