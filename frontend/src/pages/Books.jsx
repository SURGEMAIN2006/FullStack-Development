import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { BookCard } from '../components/BookCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  PlusCircle,
  Filter,
  Grid,
  List,
  BookOpen,
  Bookmark,
  Edit3,
  Trash2,
  X,
  MapPin,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

export const Books = ({ onOpenAddBook, onOpenIssueBook, onOpenEditBook, onDeleteBook }) => {
  const { isAdmin, showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Selected Book for Drawer Modal
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCategory, availability]);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (availability !== 'all') params.availability = availability;

      const res = await api.getBooks(params);
      setBooks(res.books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveBook = async (book) => {
    try {
      const res = await api.createBooking({ book_id: book.id });
      showToast(res.message, 'success');
      fetchBooks();
    } catch (err) {
      showToast(err.message || 'Failed to place reservation.', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600" /> Book Catalog
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Browse, search, and manage all books in the library system
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddBook}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start"
          >
            <PlusCircle className="w-4 h-4" /> Add New Book
          </button>
        )}
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Dynamic Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Copies Only</option>
              <option value="unavailable">Fully Issued / Reserved</option>
            </select>
          </div>

          {/* View Switcher Toggle (Grid vs Table) */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>Showing {books.length} matching books</span>
      </div>

      {/* Books Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter to view more titles.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={setSelectedBook}
              onEdit={onOpenEditBook}
              onDelete={onDeleteBook}
              onIssue={onOpenIssueBook}
              onReserve={handleReserveBook}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Book Details</th>
                  <th className="py-3.5 px-4">ISBN & Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rack</th>
                  <th className="py-3.5 px-4">Copies</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setSelectedBook(b)}
                      >
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-9 h-11 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{b.title}</p>
                          <p className="text-slate-500 font-medium">by {b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                      {b.isbn}<br />
                      <span className="text-[10px] text-indigo-600">{b.book_code}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {b.category_name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {b.location_rack}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {b.available_copies} / {b.total_copies}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.available_copies > 0 ? 'Available' : 'Reserved'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin ? (
                          <>
                            {b.available_copies > 0 ? (
                              <button
                                onClick={() => onOpenIssueBook(b)}
                                className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
                              >
                                Issue
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReserveBook(b)}
                                className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[11px]"
                              >
                                Queue
                              </button>
                            )}
                            <button
                              onClick={() => onOpenEditBook(b)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteBook(b)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReserveBook(b)}
                            className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
                          >
                            Reserve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Details Modal Drawer */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full border-l border-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg">
                  {selectedBook.book_code}
                </span>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover & Primary Info */}
              <div className="flex gap-4">
                <img
                  src={selectedBook.cover_image}
                  alt={selectedBook.title}
                  className="w-28 h-36 rounded-xl object-cover border border-slate-200 shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <StatusBadge status={selectedBook.available_copies > 0 ? 'Available' : 'Reserved'} />
                  <h2 className="text-lg font-extrabold text-slate-900 leading-tight mt-1">
                    {selectedBook.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">by {selectedBook.author}</p>
                  <p className="text-xs font-mono text-slate-400">ISBN: {selectedBook.isbn}</p>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Category</span>
                  <strong className="text-slate-800">{selectedBook.category_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Shelf Location</span>
                  <strong className="text-slate-800">{selectedBook.location_rack || 'A-1'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Publisher</span>
                  <strong className="text-slate-800">{selectedBook.publisher || 'N/A'} ({selectedBook.publication_year})</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Available Copies</span>
                  <strong className="text-slate-800">{selectedBook.available_copies} of {selectedBook.total_copies}</strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Book Overview</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {selectedBook.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => { const b = selectedBook; setSelectedBook(null); onOpenIssueBook(b); }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Issue This Book
                  </button>
                  <button
                    onClick={() => { const b = selectedBook; setSelectedBook(null); onOpenEditBook(b); }}
                    className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { const b = selectedBook; setSelectedBook(null); handleReserveBook(b); }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Reserve This Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
