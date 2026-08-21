import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { History, Search, BookOpen, Calendar, ShieldAlert } from 'lucide-react';

export const BorrowingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getIssues(params);
      setHistory(res.issues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-indigo-600" /> Full Borrowing Audit Log
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Comprehensive historical archive of all current checkouts, returns, and overdue fines
        </p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, book, ISBN, or issue code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white outline-none"
        >
          <option value="all">All History</option>
          <option value="Issued">Active Issued</option>
          <option value="Returned">Completed Returned</option>
          <option value="Overdue">Overdue Archive</option>
        </select>
      </div>

      {/* Table Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No borrowing log history records match search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Transaction Code</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Return Date</th>
                  <th className="py-3.5 px-4">Fine Amount</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {item.issue_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{item.student_name}</p>
                      <p className="text-[11px] text-slate-500">{item.student_email}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{item.book_title}</p>
                      <p className="text-[11px] font-mono text-slate-500">ISBN: {item.isbn}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.issue_date}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.due_date}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {item.return_date || <span className="text-slate-400 font-normal">Pending Check-in</span>}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {parseFloat(item.fine_amount) > 0 ? (
                        <span className="text-rose-600 font-mono">${parseFloat(item.fine_amount).toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
