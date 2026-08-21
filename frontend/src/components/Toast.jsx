import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast, dismissToast } = useAuth();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  const bgStyles = {
    success: 'bg-slate-900 border-emerald-500/30 text-white',
    error: 'bg-slate-900 border-rose-500/30 text-white',
    warning: 'bg-slate-900 border-amber-500/30 text-white',
    info: 'bg-slate-900 border-sky-500/30 text-white'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all ${bgStyles[toast.type] || bgStyles.info}`}>
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium pr-2">{toast.message}</span>
        <button
          onClick={dismissToast}
          className="ml-auto text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
