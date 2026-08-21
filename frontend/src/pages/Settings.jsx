import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, ShieldCheck, Database, Key, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-600" /> Account & System Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your account profile, role security settings, and view environment configurations
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-md"
          />
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 mt-1.5 text-[10px] font-extrabold rounded bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              {user?.role} Role
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">User Identification Code</span>
            <p className="text-sm font-mono font-bold text-slate-900">{user?.user_code || 'USR-001'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Department / Unit</span>
            <p className="text-sm font-bold text-slate-900">{user?.department || 'Library Operations'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Student / Employee ID</span>
            <p className="text-sm font-mono font-bold text-slate-900">{user?.student_id || 'ADM-001'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Phone Contact</span>
            <p className="text-sm font-bold text-slate-900">{user?.phone || '+1 (555) 019-2834'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">System Information</h4>
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">System Version</span>
              <strong className="text-indigo-950 font-mono">LibraSphere v2.0 (Production Architecture)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Backend API Engine</span>
              <strong className="text-indigo-950 font-mono">Node.js + Express REST Engine</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Database Layer</span>
              <strong className="text-indigo-950 font-mono">MySQL Engine / Dual Fallback Interface</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Authentication</span>
              <strong className="text-indigo-950 font-mono">JWT Bearer Token + bcrypt (10 rounds)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
