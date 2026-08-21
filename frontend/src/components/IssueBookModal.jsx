import React, { useState, useEffect } from 'react';
import { X, BookUp, Calendar, UserCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const IssueBookModal = ({ isOpen, onClose, onIssued, preselectedBook }) => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(preselectedBook?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default due date: 14 days from today
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);
  
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsersAndBooks();
      if (preselectedBook) {
        setSelectedBookId(preselectedBook.id);
      }
    }
  }, [isOpen, preselectedBook]);

  const fetchUsersAndBooks = async () => {
    try {
      const [userRes, bookRes] = await Promise.all([
        api.getUsers({ role: 'student' }),
        api.getBooks({ availability: 'available' })
      ]);
      setUsers(userRes.users || []);
      setBooks(bookRes.books || []);
      if (userRes.users?.length > 0 && !selectedUserId) {
        setSelectedUserId(userRes.users[0].id);
      }
      if (bookRes.books?.length > 0 && !selectedBookId && !preselectedBook) {
        setSelectedBookId(bookRes.books[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedBookId || !dueDate) {
      setError('Please select a student, book, and due date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.issueBook({
        user_id: selectedUserId,
        book_id: selectedBookId,
        issue_date: issueDate,
        due_date: dueDate,
        notes
      });
      onIssued();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to issue book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
              <BookUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Issue Book to Student</h3>
              <p className="text-xs text-slate-500 font-medium">Record a new physical checkout</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Student / User *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
            >
              <option value="">-- Choose Student --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.student_id || u.user_code}) - {u.department || 'General'}
                </option>
              ))}
            </select>
          </div>

          {/* Book Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Book to Issue *
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
            >
              <option value="">-- Choose Available Book --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.book_code}) - Available: {b.available_copies}
                </option>
              ))}
            </select>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Issue Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Standard 14-day borrowing for semester assignment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Issuing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
