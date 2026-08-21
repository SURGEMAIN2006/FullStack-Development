import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, onClick, badgeText }) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
    sky: 'bg-sky-500/10 text-sky-600 border-sky-100',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-100',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-100',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-100'
  };

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-indigo-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {badgeText && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{badgeText}</span>
        </div>
      )}
    </div>
  );
};
