import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, BookCheck, ShieldAlert } from 'lucide-react';

export const StatusBadge = ({ status, count, className = '' }) => {
  const norm = String(status || '').toLowerCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label = status;

  if (norm === 'available' || norm === 'returned' || norm === 'completed') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (norm === 'issued' || norm === 'approved') {
    style = 'bg-sky-50 text-sky-700 border-sky-200/80 font-medium';
    icon = <BookCheck className="w-3.5 h-3.5 text-sky-600" />;
  } else if (norm === 'overdue' || norm === 'danger') {
    style = 'bg-rose-50 text-rose-700 border-rose-200/80 font-medium';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
  } else if (norm === 'pending' || norm === 'reserved' || norm === 'unavailable') {
    style = 'bg-amber-50 text-amber-700 border-amber-200/80 font-medium';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
  } else if (norm === 'cancelled') {
    style = 'bg-slate-100 text-slate-500 border-slate-200 font-medium';
    icon = <Clock className="w-3.5 h-3.5" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${style} ${className}`}>
      {icon}
      <span>{label}</span>
      {count !== undefined && <span className="ml-0.5 font-bold">({count})</span>}
    </span>
  );
};
