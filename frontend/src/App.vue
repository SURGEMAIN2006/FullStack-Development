<template>
  <div v-if="loading" class="min-h-screen bg-slate-950 flex items-center justify-center text-white">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm font-semibold text-slate-400">Loading LibraSphere Vue 3 System...</p>
    </div>
  </div>

  <div v-else-if="!user || isPublicRoute" class="min-h-screen bg-slate-950">
    <router-view />
    <Toast />
  </div>

  <div v-else class="min-h-screen bg-slate-50 flex">
    <!-- Fixed Sidebar -->
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
      :unread-count="unreadNotifCount"
      :overdue-count="overdueCount"
    />

    <!-- Fixed Top Navbar -->
    <Navbar
      :is-collapsed="isSidebarCollapsed"
      :unread-count="unreadNotifCount"
      @notification-read="fetchGlobalBadgeCounts"
    />

    <!-- Main View Area -->
    <main
      :class="[
        'flex-1 transition-all duration-300 pt-16 pb-12',
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      ]"
    >
      <router-view
        @open-add-book="handleOpenAddBook"
        @open-edit-book="handleOpenEditBook"
        @open-issue-book="handleOpenIssueBook"
        @delete-book="deleteBookData = $event"
      />
    </main>

    <!-- Global Modals -->
    <BookFormModal
      :is-open="showAddBookModal"
      :initial-data="editBookData"
      :categories="categories"
      @close="showAddBookModal = false; editBookData = null;"
      @submit="handleSaveBook"
    />

    <IssueBookModal
      :is-open="showIssueModal"
      :preselected-book="preselectedBook"
      @close="showIssueModal = false; preselectedBook = null;"
      @issued="handleBookIssued"
    />

    <ConfirmModal
      :is-open="!!deleteBookData"
      title="Delete Book Record"
      :message="`Are you sure you want to permanently delete '${deleteBookData?.title}' from the catalog? This action cannot be undone.`"
      confirm-text="Delete Book"
      variant="danger"
      @close="deleteBookData = null"
      @confirm="handleDeleteBookConfirm"
    />

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from './composables/useAuth';
import { api } from './services/api';

import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import Toast from './components/Toast.vue';
import BookFormModal from './components/BookFormModal.vue';
import IssueBookModal from './components/IssueBookModal.vue';
import ConfirmModal from './components/ConfirmModal.vue';

const { user, loading, showToast } = useAuth();
const route = useRoute();

const isSidebarCollapsed = ref(false);
const unreadNotifCount = ref(0);
const overdueCount = ref(0);

const showAddBookModal = ref(false);
const editBookData = ref(null);

const showIssueModal = ref(false);
const preselectedBook = ref(null);

const deleteBookData = ref(null);
const categories = ref([]);

const isPublicRoute = computed(() => route.meta?.public === true);

const fetchGlobalBadgeCounts = async () => {
  try {
    const [notifRes, overdueRes] = await Promise.all([
      api.getNotifications(),
      api.getOverdueIssues()
    ]);
    unreadNotifCount.value = notifRes.unreadCount || 0;
    overdueCount.value = overdueRes.count || 0;
  } catch (err) {
    console.error(err);
  }
};

const fetchCategories = async () => {
  try {
    const res = await api.getCategories();
    categories.value = res.categories || [];
  } catch (err) {
    console.error(err);
  }
};

watch(() => route.path, () => {
  if (user.value) {
    fetchGlobalBadgeCounts();
    fetchCategories();
  }
});

onMounted(() => {
  if (user.value) {
    fetchGlobalBadgeCounts();
    fetchCategories();
  }
});

const handleOpenAddBook = () => {
  editBookData.value = null;
  showAddBookModal.value = true;
};

const handleOpenEditBook = (book) => {
  editBookData.value = book;
  showAddBookModal.value = true;
};

const handleOpenIssueBook = (book = null) => {
  preselectedBook.value = book;
  showIssueModal.value = true;
};

const handleSaveBook = async (bookFormData) => {
  try {
    if (editBookData.value) {
      await api.updateBook(editBookData.value.id, bookFormData);
      showToast(`Book "${bookFormData.title}" updated successfully!`, 'success');
    } else {
      await api.createBook(bookFormData);
      showToast(`Book "${bookFormData.title}" added to library!`, 'success');
    }
    showAddBookModal.value = false;
    editBookData.value = null;
  } catch (err) {
    showToast(err.message || 'Failed to save book.', 'error');
  }
};

const handleBookIssued = () => {
  showToast('Book issued successfully!', 'success');
  fetchGlobalBadgeCounts();
};

const handleDeleteBookConfirm = async () => {
  if (!deleteBookData.value) return;
  try {
    await api.deleteBook(deleteBookData.value.id);
    showToast(`Book "${deleteBookData.value.title}" deleted.`, 'success');
    deleteBookData.value = null;
  } catch (err) {
    showToast(err.message || 'Failed to delete book.', 'error');
  }
};
</script>
