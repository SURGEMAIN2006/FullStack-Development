import React from 'react';
import { StatusBadge } from './StatusBadge';
import { BookOpen, Edit3, Trash2, Bookmark, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BookCard = ({ book, onSelect, onEdit, onDelete, onReserve, onIssue }) => {
  const { isAdmin } = useAuth();
  const isAvailable = book.available_copies > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
      {/* Cover Image & Category Pill */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect(book)}>
        <img
          src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
            {book.category_name || 'General'}
          </span>
          <StatusBadge
            status={isAvailable ? 'Available' : 'Reserved'}
            count={book.available_copies}
            className="backdrop-blur-md shadow-sm"
          />
        </div>

        {/* Bottom Title overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-[11px] font-mono text-indigo-300 tracking-wider mb-0.5">{book.book_code} • {book.isbn}</p>
          <h3 className="text-base font-extrabold leading-tight line-clamp-2 drop-shadow-sm">{book.title}</h3>
          <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">by {book.author}</p>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Rack: <strong className="text-slate-800">{book.location_rack || 'A-1'}</strong></span>
          <span>Copies: <strong className="text-slate-800">{book.available_copies}/{book.total_copies}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {isAdmin ? (
            <>
              {isAvailable ? (
                <button
                  onClick={() => onIssue(book)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Issue
                </button>
              ) : (
                <button
                  onClick={() => onReserve(book)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Queue
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(book)}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Edit Book"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(book)}
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => onReserve(book)}
              className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-colors shadow-sm ${
                isAvailable
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> {isAvailable ? 'Reserve Book' : 'Join Queue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
