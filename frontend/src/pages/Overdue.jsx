import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, BookDown, Mail, Phone, Calendar, Clock, DollarSign } from 'lucide-react';

export const Overdue = () => {
  const { isAdmin, showToast } = useAuth();
  const [overdues, setOverdues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [fineAmount, setFineAmount] = useState(0);

  useEffect(() => {
    fetchOverdues();
  }, []);

  const fetchOverdues = async () => {
    setLoading(true);
    try {
      const res = await api.getOverdueIssues();
      setOverdues(res.overdues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (item) => {
    setSelectedIssue(item);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setFineAmount((item.overdue_days || 1) * 2.0); // $2.00 per day fine
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    try {
      const res = await api.returnBook(selectedIssue.id, {
        return_date: returnDate,
        fine_amount: fineAmount
      });
      showToast(res.message, 'success');
      setSelectedIssue(null);
      fetchOverdues();
    } catch (err) {
      showToast(err.message || 'Failed to return book.', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-8 rounded-3xl text-white border border-rose-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30">
            <ShieldAlert className="w-4 h-4" /> Overdue Compliance Monitor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Overdue Books Tracker</h1>
          <p className="text-sm text-rose-200/80 max-w-xl">
            Identifies all unreturned books past their scheduled due date. Overdue penalties are calculated automatically at check-in.
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 px-6 py-4 rounded-2xl text-center shrink-0">
          <span className="text-3xl font-extrabold text-white block">{overdues.length}</span>
          <span className="text-xs text-rose-300 font-bold uppercase tracking-wider">Active Overdues</span>
        </div>
      </div>

      {/* Overdue Cards / List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-600" /> Overdue Items Requiring Librarian Action
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : overdues.length === 0 ? (
          <div className="p-12 text-center text-emerald-600 space-y-2">
            <ShieldAlert className="w-12 h-12 mx-auto text-emerald-500 opacity-80" />
            <h4 className="font-bold text-base">Great news! Zero overdue items</h4>
            <p className="text-xs text-slate-500">All issued books are within their valid borrowing windows.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdues.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-300 transition-all"
              >
                {/* Book & Student Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={item.cover_image}
                    alt={item.book_title}
                    className="w-12 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.book_title}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full">
                        {item.overdue_days} DAYS OVERDUE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Student: <strong className="text-slate-900">{item.student_name}</strong> ({item.student_id || item.student_email})
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span>Issue Date: <strong>{item.issue_date}</strong></span>
                      <span>Due Date: <strong className="text-rose-600">{item.due_date}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenReturnModal(item)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
                    >
                      <BookDown className="w-4 h-4" /> Process Return
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Return Overdue Book</h3>
            <p className="text-xs text-slate-500">
              Calculate fine and clear overdue status for <strong>{selectedIssue.book_title}</strong> issued to <strong>{selectedIssue.student_name}</strong>.
            </p>

            <form onSubmit={handleConfirmReturn} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overdue Fine ($)</label>
                <input
                  type="number"
                  step="0.50"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm border rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Confirm Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
