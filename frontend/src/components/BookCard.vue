<template>
  <div class="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
    <!-- Cover Image & Category Pill -->
    <div class="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer" @click="$emit('select', book)">
      <img
        :src="book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'"
        :alt="book.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="handleImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      <!-- Top Badges -->
      <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
          {{ book.category_name || 'General' }}
        </span>
        <StatusBadge
          :status="isAvailable ? 'Available' : 'Reserved'"
          :count="book.available_copies"
          class="backdrop-blur-md shadow-sm"
        />
      </div>

      <!-- Bottom Title overlay -->
      <div class="absolute bottom-3 left-3 right-3 text-white">
        <p class="text-[11px] font-mono text-indigo-300 tracking-wider mb-0.5">{{ book.book_code }} • {{ book.isbn }}</p>
        <h3 class="text-base font-extrabold leading-tight line-clamp-2 drop-shadow-sm">{{ book.title }}</h3>
        <p class="text-xs text-slate-300 font-medium mt-0.5 truncate">by {{ book.author }}</p>
      </div>
    </div>

    <!-- Card Info Details -->
    <div class="p-4 space-y-3 bg-white">
      <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Rack: <strong class="text-slate-800">{{ book.location_rack || 'A-1' }}</strong></span>
        <span>Copies: <strong class="text-slate-800">{{ book.available_copies }}/{{ book.total_copies }}</strong></span>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
        <template v-if="isAdmin">
          <button
            v-if="isAvailable"
            @click="$emit('issue', book)"
            class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <BookOpen class="w-3.5 h-3.5" /> Issue
          </button>
          <button
            v-else
            @click="$emit('reserve', book)"
            class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Bookmark class="w-3.5 h-3.5" /> Queue
          </button>
          <button
            @click="$emit('edit', book)"
            class="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Edit Book"
          >
            <Edit3 class="w-4 h-4" />
          </button>
          <button
            @click="$emit('delete', book)"
            class="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete Book"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </template>
        <template v-else>
          <button
            @click="$emit('reserve', book)"
            :class="[
              'w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-colors shadow-sm',
              isAvailable ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
            ]"
          >
            <Bookmark class="w-3.5 h-3.5" /> {{ isAvailable ? 'Reserve Book' : 'Join Queue' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import StatusBadge from './StatusBadge.vue';
import { BookOpen, Edit3, Trash2, Bookmark } from 'lucide-vue-next';

const props = defineProps({
  book: { type: Object, required: true }
});

defineEmits(['select', 'edit', 'delete', 'reserve', 'issue']);

const { isAdmin } = useAuth();
const isAvailable = computed(() => props.book.available_copies > 0);

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400';
};
</script>
