<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background Glow Overlay -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-2xl shadow-indigo-500/40 mb-4">
        <Library class="w-8 h-8" />
      </div>
      <h2 class="text-3xl font-extrabold text-white tracking-tight">LibraSphere (Vue 3)</h2>
      <p class="mt-1 text-sm font-medium text-slate-400">Classy & Systematic Library Operating System</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
      <div class="bg-slate-900/90 border border-slate-800 p-8 shadow-2xl rounded-3xl backdrop-blur-xl">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                v-model="email"
                placeholder="name@librasphere.com"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                v-model="password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {{ loading ? 'Authenticating...' : 'Sign In to Dashboard' }}
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <!-- Quick Demo Login Buttons -->
        <div class="mt-6 pt-6 border-t border-slate-800/80 space-y-2">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
            Quick One-Click Demo Access
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="handleQuickLogin('admin@librasphere.com', 'admin123')"
              class="px-3 py-2 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck class="w-3.5 h-3.5 text-indigo-400" /> Admin Demo
            </button>
            <button
              type="button"
              @click="handleQuickLogin('student@librasphere.com', 'student123')"
              class="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              Student Demo
            </button>
          </div>
        </div>

        <div class="mt-6 text-center text-xs text-slate-400">
          Don't have a student account?
          <router-link to="/register" class="font-bold text-indigo-400 hover:text-indigo-300">
            Register here
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
import { Library, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-vue-next';

const email = ref('admin@librasphere.com');
const password = ref('admin123');
const loading = ref(false);

const { login } = useAuth();
const router = useRouter();

const handleSubmit = async () => {
  loading.value = true;
  try {
    await login(email.value, password.value);
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleQuickLogin = (demoEmail, demoPass) => {
  email.value = demoEmail;
  password.value = demoPass;
};
</script>
