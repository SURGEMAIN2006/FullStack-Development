import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  BookMarked,
  Search,
  BookDown,
  Calendar,
  User,
  ShieldAlert,
  CheckCircle2,
  X,
  Filter,
  DollarSign
} from 'lucide-react';

export const IssuedBooks = ({ onOpenIssueBook }) => {
  const { isAdmin, showToast } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Return Processing Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [fineAmount, setFineAmount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchIssues();
  }, [search, statusFilter]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getIssues(params);
      setIssues(res.issues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (issue) => {
    setSelectedIssue(issue);
    setReturnDate(new Date().toISOString().split('T')[0]);
    // Auto calculate fine if overdue
    if (issue.overdue_days > 0) {
      setFineAmount(issue.overdue_days * 2.0); // $2 per day
    } else {
      setFineAmount(0);
    }
    setNotes('');
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      const res = await api.returnBook(selectedIssue.id, {
        return_date: returnDate,
        fine_amount: fineAmount,
        notes
      });
      showToast(res.message, 'success');
      setSelectedIssue(null);
      fetchIssues();
    } catch (err) {
      showToast(err.message || 'Failed to process return.', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-indigo-600" /> Issued Books Register
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track, audit, and process physical checkout check-ins and check-outs
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenIssueBook}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start"
          >
            <BookMarked className="w-4 h-4" /> Issue New Book
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, book title, ISBN, issue code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
        >
          <option value="all">All Issue Statuses</option>
          <option value="Issued">Issued Only</option>
          <option value="Returned">Returned</option>
          <option value="Overdue">Overdue Only</option>
        </select>
      </div>

      {/* Professional Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No checkout records found matching filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Issue Code</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {issues.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {item.issue_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{item.student_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.student_id || item.student_email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.cover_image}
                          alt={item.book_title}
                          className="w-7 h-9 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{item.book_title}</p>
                          <p className="text-[11px] text-slate-500 truncate">ISBN: {item.isbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.issue_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={item.overdue_days > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {item.due_date}
                      </span>
                      {item.overdue_days > 0 && (
                        <span className="block text-[10px] text-rose-500 font-extrabold">
                          ({item.overdue_days} days overdue)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        {item.status !== 'Returned' ? (
                          <button
                            onClick={() => handleOpenReturnModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                          >
                            <BookDown className="w-3.5 h-3.5" /> Return Book
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Returned on {item.return_date}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Book Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <BookDown className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Process Book Return</h3>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
              <p className="text-slate-500">Student: <strong className="text-slate-900">{selectedIssue.student_name}</strong></p>
              <p className="text-slate-500">Book: <strong className="text-slate-900">{selectedIssue.book_title}</strong></p>
              <p className="text-slate-500">Due Date: <strong className="text-slate-900">{selectedIssue.due_date}</strong></p>
              {selectedIssue.overdue_days > 0 && (
                <p className="text-rose-600 font-bold">Overdue by {selectedIssue.overdue_days} days!</p>
              )}
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Overdue Fine Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.50"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Condition / Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Returned in pristine condition"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
