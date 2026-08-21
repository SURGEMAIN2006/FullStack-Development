<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
            <BookPlus class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ initialData ? 'Edit Book Details' : 'Add New Book to Library' }}
            </h3>
            <p class="text-xs text-slate-500 font-medium">Fill in authoritative metadata & copies count</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-4 flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Title -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Book Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
              v-model="formData.title"
              :class="[
                'w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all',
                errors.title ? 'border-rose-500' : 'border-slate-200'
              ]"
            />
            <p v-if="errors.title" class="text-xs text-rose-500 font-medium mt-1">{{ errors.title }}</p>
          </div>

          <!-- Author -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Author *</label>
            <input
              type="text"
              placeholder="e.g. Robert C. Martin"
              v-model="formData.author"
              :class="[
                'w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all',
                errors.author ? 'border-rose-500' : 'border-slate-200'
              ]"
            />
            <p v-if="errors.author" class="text-xs text-rose-500 font-medium mt-1">{{ errors.author }}</p>
          </div>

          <!-- ISBN -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ISBN Number *</label>
            <input
              type="text"
              placeholder="e.g. 978-0132350884"
              v-model="formData.isbn"
              :class="[
                'w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all',
                errors.isbn ? 'border-rose-500' : 'border-slate-200'
              ]"
            />
            <p v-if="errors.isbn" class="text-xs text-rose-500 font-medium mt-1">{{ errors.isbn }}</p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
            <select
              v-model="formData.category_id"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
            >
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Total Copies -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Copies *</label>
            <input
              type="number"
              min="1"
              max="100"
              v-model.number="formData.total_copies"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-semibold"
            />
          </div>

          <!-- Publisher -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Publisher</label>
            <input
              type="text"
              placeholder="e.g. O'Reilly Media"
              v-model="formData.publisher"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          <!-- Publication Year -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Publication Year</label>
            <input
              type="number"
              placeholder="2024"
              v-model.number="formData.publication_year"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          <!-- Shelf Location -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rack / Shelf Location</label>
            <input
              type="text"
              placeholder="e.g. Rack CS-02"
              v-model="formData.location_rack"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          <!-- Cover Image URL -->
          <div class="sm:col-span-2 space-y-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Book Cover Image URL</label>
            <div class="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                v-model="formData.cover_image"
                class="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <!-- Presets picker -->
            <div class="flex items-center gap-2 pt-1">
              <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Sparkles class="w-3 h-3 text-indigo-500" /> Presets:
              </span>
              <div class="flex gap-1.5 overflow-x-auto py-1">
                <button
                  v-for="(url, i) in coverPresets"
                  :key="i"
                  type="button"
                  @click="formData.cover_image = url"
                  class="w-8 h-10 rounded overflow-hidden border hover:border-indigo-600 transition-all shrink-0"
                >
                  <img :src="url" alt="preset" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Book Description</label>
            <textarea
              rows="3"
              placeholder="Brief summary or abstract of the book..."
              v-model="formData.description"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>
        </div>

        <!-- Footer Actions -->
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
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save class="w-4 h-4" />
            {{ initialData ? 'Save Changes' : 'Add Book' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, BookPlus, Save, Sparkles } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  initialData: Object,
  categories: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'submit']);

const formData = ref({
  title: '',
  author: '',
  isbn: '',
  category_id: '',
  publisher: '',
  publication_year: new Date().getFullYear(),
  description: '',
  total_copies: 1,
  cover_image: '',
  location_rack: 'Rack A-1'
});

const errors = ref({});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      formData.value = {
        title: props.initialData.title || '',
        author: props.initialData.author || '',
        isbn: props.initialData.isbn || '',
        category_id: props.initialData.category_id || (props.categories[0]?.id || ''),
        publisher: props.initialData.publisher || '',
        publication_year: props.initialData.publication_year || new Date().getFullYear(),
        description: props.initialData.description || '',
        total_copies: props.initialData.total_copies || 1,
        cover_image: props.initialData.cover_image || '',
        location_rack: props.initialData.location_rack || 'Rack A-1'
      };
    } else {
      formData.value = {
        title: '',
        author: '',
        isbn: '',
        category_id: props.categories[0]?.id || '',
        publisher: '',
        publication_year: new Date().getFullYear(),
        description: '',
        total_copies: 1,
        cover_image: '',
        location_rack: 'Rack A-1'
      };
    }
    errors.value = {};
  }
});

const coverPresets = [
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400'
];

const validate = () => {
  const errs = {};
  if (!formData.value.title.trim()) errs.title = 'Title is required';
  if (!formData.value.author.trim()) errs.author = 'Author is required';
  if (!formData.value.isbn.trim()) errs.isbn = 'ISBN is required';
  if (!formData.value.category_id) errs.category_id = 'Category is required';
  if (formData.value.total_copies < 1) errs.total_copies = 'At least 1 copy required';
  errors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleSubmit = () => {
  if (validate()) {
    emit('submit', { ...formData.value });
  }
};
</script>
