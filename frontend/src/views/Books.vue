<template>
  <div class="p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookOpen class="w-7 h-7 text-indigo-600" /> Book Catalog
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          Browse, search, and manage all books in the library system
        </p>
      </div>

      <button
        v-if="isAdmin"
        @click="$emit('open-add-book')"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start"
      >
        <PlusCircle class="w-4 h-4" /> Add New Book
      </button>
    </div>

    <!-- Filter & Search Bar Controls -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <!-- Dynamic Search Input -->
        <div class="relative">
          <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, author, ISBN..."
            v-model="search"
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
          />
        </div>

        <!-- Category Filter -->
        <div>
          <select
            v-model="selectedCategory"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
          >
            <option value="all">All Categories ({{ categories.length }})</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Availability Filter -->
        <div>
          <select
            v-model="availability"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
          >
            <option value="all">All Availability</option>
            <option value="available">Available Copies Only</option>
            <option value="unavailable">Fully Issued / Reserved</option>
          </select>
        </div>

        <!-- View Switcher Toggle (Grid vs Table) -->
        <div class="flex items-center justify-end gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all',
              viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            <Grid class="w-3.5 h-3.5" /> Grid
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all',
              viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            <List class="w-3.5 h-3.5" /> Table
          </button>
        </div>
      </div>
    </div>

    <!-- Results Header -->
    <div class="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
      <span>Showing {{ books.length }} matching books</span>
    </div>

    <!-- Books Display -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
    </div>

    <div v-else-if="books.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
      <BookOpen class="w-12 h-12 text-slate-300 mx-auto" />
      <h3 class="text-base font-bold text-slate-800">No books found</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        Try adjusting your search criteria or category filter to view more titles.
      </p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <BookCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        @select="selectedBook = $event"
        @edit="$emit('open-edit-book', $event)"
        @delete="$emit('delete-book', $event)"
        @issue="$emit('open-issue-book', $event)"
        @reserve="handleReserveBook"
      />
    </div>

    <!-- Table View -->
    <div v-else class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4">Book Details</th>
              <th class="py-3.5 px-4">ISBN & Code</th>
              <th class="py-3.5 px-4">Category</th>
              <th class="py-3.5 px-4">Rack</th>
              <th class="py-3.5 px-4">Copies</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <tr v-for="b in books" :key="b.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3 cursor-pointer" @click="selectedBook = b">
                  <img
                    :src="b.cover_image"
                    :alt="b.title"
                    class="w-9 h-11 rounded object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p class="font-bold text-slate-900 line-clamp-1">{{ b.title }}</p>
                    <p class="text-slate-500 font-medium">by {{ b.author }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono font-semibold text-slate-600">
                {{ b.isbn }}<br />
                <span class="text-[10px] text-indigo-600">{{ b.book_code }}</span>
              </td>
              <td class="py-3 px-4 font-medium text-slate-700">
                {{ b.category_name }}
              </td>
              <td class="py-3 px-4 font-semibold text-slate-800">
                {{ b.location_rack }}
              </td>
              <td class="py-3 px-4 font-bold text-slate-800">
                {{ b.available_copies }} / {{ b.total_copies }}
              </td>
              <td class="py-3 px-4">
                <StatusBadge :status="b.available_copies > 0 ? 'Available' : 'Reserved'" />
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <template v-if="isAdmin">
                    <button
                      v-if="b.available_copies > 0"
                      @click="$emit('open-issue-book', b)"
                      class="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
                    >
                      Issue
                    </button>
                    <button
                      v-else
                      @click="handleReserveBook(b)"
                      class="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[11px]"
                    >
                      Queue
                    </button>
                    <button
                      @click="$emit('open-edit-book', b)"
                      class="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                    >
                      <Edit3 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click="$emit('delete-book', b)"
                      class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </template>
                  <template v-else>
                    <button
                      @click="handleReserveBook(b)"
                      class="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
                    >
                      Reserve
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Book Details Modal Drawer -->
    <div v-if="selectedBook" class="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-lg h-full border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
        <div class="space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <span class="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg">
              {{ selectedBook.book_code }}
            </span>
            <button @click="selectedBook = null" class="p-2 text-slate-400 hover:text-slate-800 rounded-xl">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Cover & Primary Info -->
          <div class="flex gap-4">
            <img
              :src="selectedBook.cover_image"
              :alt="selectedBook.title"
              class="w-28 h-36 rounded-xl object-cover border border-slate-200 shadow-md shrink-0"
            />
            <div class="space-y-1">
              <StatusBadge :status="selectedBook.available_copies > 0 ? 'Available' : 'Reserved'" />
              <h2 class="text-lg font-extrabold text-slate-900 leading-tight mt-1">
                {{ selectedBook.title }}
              </h2>
              <p class="text-xs text-slate-500 font-semibold">by {{ selectedBook.author }}</p>
              <p class="text-xs font-mono text-slate-400">ISBN: {{ selectedBook.isbn }}</p>
            </div>
          </div>

          <!-- Meta Grid -->
          <div class="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
            <div>
              <span class="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Category</span>
              <strong class="text-slate-800">{{ selectedBook.category_name }}</strong>
            </div>
            <div>
              <span class="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Shelf Location</span>
              <strong class="text-slate-800">{{ selectedBook.location_rack || 'A-1' }}</strong>
            </div>
            <div>
              <span class="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Publisher</span>
              <strong class="text-slate-800">{{ selectedBook.publisher || 'N/A' }} ({{ selectedBook.publication_year }})</strong>
            </div>
            <div>
              <span class="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Available Copies</span>
              <strong class="text-slate-800">{{ selectedBook.available_copies }} of {{ selectedBook.total_copies }}</strong>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Book Overview</h4>
            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              {{ selectedBook.description || 'No description provided.' }}
            </p>
          </div>
        </div>

        <!-- Bottom Drawer Actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
          <template v-if="isAdmin">
            <button
              @click="const b = selectedBook; selectedBook = null; $emit('open-issue-book', b);"
              class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Issue This Book
            </button>
            <button
              @click="const b = selectedBook; selectedBook = null; $emit('open-edit-book', b);"
              class="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Edit3 class="w-4 h-4" />
            </button>
          </template>
          <template v-else>
            <button
              @click="const b = selectedBook; selectedBook = null; handleReserveBook(b);"
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Reserve This Book
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { api } from '../services/api';
import BookCard from '../components/BookCard.vue';
import StatusBadge from '../components/StatusBadge.vue';
import {
  Search,
  PlusCircle,
  Grid,
  List,
  BookOpen,
  Edit3,
  Trash2,
  X
} from 'lucide-vue-next';

defineEmits(['open-add-book', 'open-issue-book', 'open-edit-book', 'delete-book']);

const { isAdmin, showToast } = useAuth();
const route = useRoute();

const books = ref([]);
const categories = ref([]);
const loading = ref(true);

const search = ref(route.query.search || '');
const selectedCategory = ref(route.query.category || 'all');
const availability = ref(route.query.availability || 'all');
const viewMode = ref('grid');
const selectedBook = ref(null);

const fetchCategories = async () => {
  try {
    const res = await api.getCategories();
    categories.value = res.categories || [];
  } catch (err) {
    console.error(err);
  }
};

const fetchBooks = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (selectedCategory.value !== 'all') params.category = selectedCategory.value;
    if (availability.value !== 'all') params.availability = availability.value;

    const res = await api.getBooks(params);
    books.value = res.books || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  fetchBooks();
});

watch([search, selectedCategory, availability], () => {
  fetchBooks();
});

const handleReserveBook = async (book) => {
  try {
    const res = await api.createBooking({ book_id: book.id });
    showToast(res.message, 'success');
    fetchBooks();
  } catch (err) {
    showToast(err.message || 'Failed to place reservation.', 'error');
  }
};
</script>
