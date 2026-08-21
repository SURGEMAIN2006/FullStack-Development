import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { BookmarkCheck, Search, Check, X, Clock, Layers, ShieldAlert, ArrowRight } from 'lucide-react';

export const Bookings = () => {
  const { user, isAdmin, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getBookings(params);
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateBookingStatus(id, { status: newStatus });
      showToast(res.message, 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to update reservation status.', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation request?')) return;
    try {
      const res = await api.cancelBooking(id);
      showToast(res.message, 'info');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookmarkCheck className="w-7 h-7 text-indigo-600" /> Bookings & Reservations Queue
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage hold requests, queue ordering, and reservation approvals
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, book title, booking code..."
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
          <option value="all">All Reservation Statuses</option>
          <option value="Pending">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Reserved">Held at Desk (Reserved)</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Queue Grid/Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No reservation records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking Code</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Book Requested</th>
                  <th className="py-3.5 px-4">Queue Position</th>
                  <th className="py-3.5 px-4">Booking Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {item.booking_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{item.student_name}</p>
                        <p className="text-[11px] text-slate-500">{item.department}</p>
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
                          <p className="text-[11px] text-slate-500 truncate">by {item.book_author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full">
                        #{item.queue_position} in line
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.booking_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin ? (
                          <>
                            {item.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'Approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                              >
                                Approve
                              </button>
                            )}
                            {item.status === 'Approved' && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'Reserved')}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-sm"
                              >
                                Mark Ready
                              </button>
                            )}
                            {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                              <button
                                onClick={() => handleCancelBooking(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                title="Cancel Reservation"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          item.status !== 'Cancelled' && item.status !== 'Completed' && (
                            <button
                              onClick={() => handleCancelBooking(item.id)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] rounded-lg"
                            >
                              Cancel Hold
                            </button>
                          )
                        )}
                      </div>
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
