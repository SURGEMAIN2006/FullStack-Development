<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FolderTree class="w-7 h-7 text-indigo-600" /> Book Categories
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          Organize catalog inventory into academic subjects & disciplines
        </p>
      </div>

      <button
        v-if="isAdmin"
        @click="showAddModal = true"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start"
      >
        <PlusCircle class="w-4 h-4" /> Add Category
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-40 bg-slate-200/60 rounded-2xl animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <BookOpen class="w-6 h-6" />
            </div>
            <span class="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-full">
              {{ cat.book_count || 0 }} Books
            </span>
          </div>
          <h3 class="text-base font-extrabold text-slate-900">{{ cat.name }}</h3>
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {{ cat.description || 'No specific description.' }}
          </p>
        </div>

        <div v-if="isAdmin" class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-400 font-mono">ID: CAT-{{ cat.id }}</span>
          <button
            @click="handleDeleteCategory(cat.id, cat.name)"
            class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            title="Delete Category"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900">Add New Category</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleCreateCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Data Science & Machine Learning"
              v-model="name"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Brief description of books in this domain..."
              v-model="description"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
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
              <Save class="w-3.5 h-3.5" /> Save Category
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
import { FolderTree, PlusCircle, Trash2, BookOpen, X, Save } from 'lucide-vue-next';

const { isAdmin, showToast } = useAuth();
const categories = ref([]);
const loading = ref(true);

const showAddModal = ref(false);
const name = ref('');
const description = ref('');
const icon = ref('BookOpen');

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.getCategories();
    categories.value = res.categories || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);

const handleCreateCategory = async () => {
  if (!name.value.trim()) return;

  try {
    await api.createCategory({ name: name.value, description: description.value, icon: icon.value });
    showToast(`Category "${name.value}" created successfully.`, 'success');
    name.value = '';
    description.value = '';
    showAddModal.value = false;
    fetchCategories();
  } catch (err) {
    showToast(err.message || 'Failed to create category.', 'error');
  }
};

const handleDeleteCategory = async (id, catName) => {
  if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
  try {
    await api.deleteCategory(id);
    showToast(`Category "${catName}" deleted.`, 'success');
    fetchCategories();
  } catch (err) {
    showToast(err.message || 'Failed to delete category.', 'error');
  }
};
</script>
