<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
            <BookUp class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Issue Book to Student</h3>
            <p class="text-xs text-slate-500 font-medium">Record a new physical checkout</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="error" class="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
          {{ error }}
        </div>

        <!-- Student Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Select Student / User *
          </label>
          <select
            v-model="selectedUserId"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
          >
            <option value="">-- Choose Student --</option>
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.student_id || u.user_code }}) - {{ u.department || 'General' }}
            </option>
          </select>
        </div>

        <!-- Book Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Select Book to Issue *
          </label>
          <select
            v-model="selectedBookId"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
          >
            <option value="">-- Choose Available Book --</option>
            <option v-for="b in books" :key="b.id" :value="b.id">
              {{ b.title }} ({{ b.book_code }}) - Available: {{ b.available_copies }}
            </option>
          </select>
        </div>

        <!-- Dates grid -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Issue Date *
            </label>
            <input
              type="date"
              v-model="issueDate"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none font-medium"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Due Date *
            </label>
            <input
              type="date"
              v-model="dueDate"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none font-medium"
            />
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Issue Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Standard 14-day borrowing for semester assignment"
            v-model="notes"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        <!-- Action buttons -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <CheckCircle2 class="w-4 h-4" />
            {{ loading ? 'Issuing...' : 'Confirm Issue' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, BookUp, CheckCircle2 } from 'lucide-vue-next';
import { api } from '../services/api';

const props = defineProps({
  isOpen: Boolean,
  preselectedBook: Object
});

const emit = defineEmits(['close', 'issued']);

const users = ref([]);
const books = ref([]);
const selectedUserId = ref('');
const selectedBookId = ref('');
const issueDate = ref(new Date().toISOString().split('T')[0]);

const defaultDue = new Date();
defaultDue.setDate(defaultDue.getDate() + 14);
const dueDate = ref(defaultDue.toISOString().split('T')[0]);

const notes = ref('');
const loading = ref(false);
const error = ref('');

const fetchUsersAndBooks = async () => {
  try {
    const [userRes, bookRes] = await Promise.all([
      api.getUsers({ role: 'student' }),
      api.getBooks({ availability: 'available' })
    ]);
    users.value = userRes.users || [];
    books.value = bookRes.books || [];

    if (users.value.length > 0 && !selectedUserId.value) {
      selectedUserId.value = users.value[0].id;
    }
    if (books.value.length > 0 && !selectedBookId.value && !props.preselectedBook) {
      selectedBookId.value = books.value[0].id;
    }
  } catch (err) {
    console.error(err);
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchUsersAndBooks();
    if (props.preselectedBook) {
      selectedBookId.value = props.preselectedBook.id;
    }
    error.value = '';
  }
});

const handleSubmit = async () => {
  if (!selectedUserId.value || !selectedBookId.value || !dueDate.value) {
    error.value = 'Please select a student, book, and due date.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await api.issueBook({
      user_id: selectedUserId.value,
      book_id: selectedBookId.value,
      issue_date: issueDate.value,
      due_date: dueDate.value,
      notes: notes.value
    });
    emit('issued');
    emit('close');
  } catch (err) {
    error.value = err.message || 'Failed to issue book.';
  } finally {
    loading.value = false;
  }
};
</script>
