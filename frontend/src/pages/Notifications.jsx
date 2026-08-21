import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, AlertCircle, Info, Check, ShieldAlert } from 'lucide-react';

export const Notifications = () => {
  const { showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast('Failed to update notifications.', 'error');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600" /> Notifications Feed
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            System updates, checkout due reminders, and reservation alerts
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
        >
          Mark All Read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkSingleRead(n.id)}
              className={`p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                parseInt(n.is_read) === 1 ? 'opacity-60' : 'bg-indigo-50/30'
              }`}
            >
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                n.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
              }`}>
                {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                 n.type === 'danger' ? <ShieldAlert className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
