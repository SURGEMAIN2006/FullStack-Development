import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { BookFormModal } from './components/BookFormModal';
import { IssueBookModal } from './components/IssueBookModal';
import { ConfirmModal } from './components/ConfirmModal';
import { api } from './services/api';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Categories } from './pages/Categories';
import { IssuedBooks } from './pages/IssuedBooks';
import { Bookings } from './pages/Bookings';
import { Students } from './pages/Students';
import { BorrowingHistory } from './pages/BorrowingHistory';
import { Overdue } from './pages/Overdue';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

const ProtectedLayout = () => {
  const { user, loading, showToast } = useAuth();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  // Global Modals State
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editBookData, setEditBookData] = useState(null);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [preselectedBook, setPreselectedBook] = useState(null);

  const [deleteBookData, setDeleteBookData] = useState(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user) {
      fetchGlobalBadgeCounts();
      fetchCategories();
    }
  }, [user, location.pathname]);

  const fetchGlobalBadgeCounts = async () => {
    try {
      const [notifRes, overdueRes] = await Promise.all([
        api.getNotifications(),
        api.getOverdueIssues()
      ]);
      setUnreadNotifCount(notifRes.unreadCount || 0);
      setOverdueCount(overdueRes.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading LibraSphere System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenAddBook = () => {
    setEditBookData(null);
    setShowAddBookModal(true);
  };

  const handleOpenEditBook = (book) => {
    setEditBookData(book);
    setShowAddBookModal(true);
  };

  const handleOpenIssueBook = (book = null) => {
    setPreselectedBook(book);
    setShowIssueModal(true);
  };

  const handleSaveBook = async (bookFormData) => {
    try {
      if (editBookData) {
        await api.updateBook(editBookData.id, bookFormData);
        showToast(`Book "${bookFormData.title}" updated successfully!`, 'success');
      } else {
        await api.createBook(bookFormData);
        showToast(`Book "${bookFormData.title}" added to library!`, 'success');
      }
      setShowAddBookModal(false);
      setEditBookData(null);
      // Trigger refresh via state reload or navigation
      window.dispatchEvent(new Event('refresh-books'));
    } catch (err) {
      showToast(err.message || 'Failed to save book.', 'error');
    }
  };

  const handleDeleteBookConfirm = async () => {
    if (!deleteBookData) return;
    try {
      await api.deleteBook(deleteBookData.id);
      showToast(`Book "${deleteBookData.title}" deleted.`, 'success');
      setDeleteBookData(null);
      window.dispatchEvent(new Event('refresh-books'));
    } catch (err) {
      showToast(err.message || 'Failed to delete book.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        unreadCount={unreadNotifCount}
        overdueCount={overdueCount}
      />

      {/* Fixed Top Navbar */}
      <Navbar
        isCollapsed={isSidebarCollapsed}
        unreadCount={unreadNotifCount}
        onNotificationRead={fetchGlobalBadgeCounts}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-16 pb-12 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={<Dashboard onOpenAddBook={handleOpenAddBook} onOpenIssueBook={() => handleOpenIssueBook(null)} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard onOpenAddBook={handleOpenAddBook} onOpenIssueBook={() => handleOpenIssueBook(null)} />}
          />
          <Route
            path="/books"
            element={
              <Books
                onOpenAddBook={handleOpenAddBook}
                onOpenIssueBook={handleOpenIssueBook}
                onOpenEditBook={handleOpenEditBook}
                onDeleteBook={(b) => setDeleteBookData(b)}
              />
            }
          />
          <Route
            path="/books/add"
            element={
              <Books
                onOpenAddBook={handleOpenAddBook}
                onOpenIssueBook={handleOpenIssueBook}
                onOpenEditBook={handleOpenEditBook}
                onDeleteBook={(b) => setDeleteBookData(b)}
              />
            }
          />
          <Route path="/categories" element={<Categories />} />
          <Route path="/issues" element={<IssuedBooks onOpenIssueBook={() => handleOpenIssueBook(null)} />} />
          <Route path="/issues/new" element={<IssuedBooks onOpenIssueBook={() => handleOpenIssueBook(null)} />} />
          <Route path="/issues/return" element={<IssuedBooks onOpenIssueBook={() => handleOpenIssueBook(null)} />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/students" element={<Students />} />
          <Route path="/history" element={<BorrowingHistory />} />
          <Route path="/overdue" element={<Overdue />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <BookFormModal
        isOpen={showAddBookModal}
        onClose={() => { setShowAddBookModal(false); setEditBookData(null); }}
        onSubmit={handleSaveBook}
        initialData={editBookData}
        categories={categories}
      />

      <IssueBookModal
        isOpen={showIssueModal}
        onClose={() => { setShowIssueModal(false); setPreselectedBook(null); }}
        onIssued={() => {
          showToast('Book issued successfully!', 'success');
          fetchGlobalBadgeCounts();
          window.dispatchEvent(new Event('refresh-books'));
        }}
        preselectedBook={preselectedBook}
      />

      <ConfirmModal
        isOpen={!!deleteBookData}
        onClose={() => setDeleteBookData(null)}
        onConfirm={handleDeleteBookConfirm}
        title="Delete Book Record"
        message={`Are you sure you want to permanently delete "${deleteBookData?.title}" from the catalog? This action cannot be undone.`}
        confirmText="Delete Book"
        variant="danger"
      />

      <Toast />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
