import React, { useState, useEffect } from 'react';
import { X, BookPlus, Save, Image, Sparkles } from 'lucide-react';

export const BookFormModal = ({ isOpen, onClose, onSubmit, initialData, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    description: '',
    total_copies: 1,
    cover_image: '',
    location_rack: 'Rack A-1'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        category_id: initialData.category_id || (categories[0]?.id || ''),
        publisher: initialData.publisher || '',
        publication_year: initialData.publication_year || new Date().getFullYear(),
        description: initialData.description || '',
        total_copies: initialData.total_copies || 1,
        cover_image: initialData.cover_image || '',
        location_rack: initialData.location_rack || 'Rack A-1'
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category_id: categories[0]?.id || '',
        publisher: '',
        publication_year: new Date().getFullYear(),
        description: '',
        total_copies: 1,
        cover_image: '',
        location_rack: 'Rack A-1'
      });
    }
    setErrors({});
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.author.trim()) errs.author = 'Author is required';
    if (!formData.isbn.trim()) errs.isbn = 'ISBN is required';
    if (!formData.category_id) errs.category_id = 'Category is required';
    if (formData.total_copies < 1) errs.total_copies = 'At least 1 copy required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const coverPresets = [
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Edit Book Details' : 'Add New Book to Library'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Fill in authoritative metadata & copies count</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all ${
                  errors.title ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-500 font-medium mt-1">{errors.title}</p>}
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Author *</label>
              <input
                type="text"
                placeholder="e.g. Robert C. Martin"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all ${
                  errors.author ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.author && <p className="text-xs text-rose-500 font-medium mt-1">{errors.author}</p>}
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ISBN Number *</label>
              <input
                type="text"
                placeholder="e.g. 978-0132350884"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all ${
                  errors.isbn ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.isbn && <p className="text-xs text-rose-500 font-medium mt-1">{errors.isbn}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Total Copies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Copies *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-semibold"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Publisher</label>
              <input
                type="text"
                placeholder="e.g. O'Reilly Media"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Publication Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Publication Year</label>
              <input
                type="number"
                placeholder="2024"
                value={formData.publication_year}
                onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) || 2024 })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Shelf Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rack / Shelf Location</label>
              <input
                type="text"
                placeholder="e.g. Rack CS-02"
                value={formData.location_rack}
                onChange={(e) => setFormData({ ...formData, location_rack: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Cover Image URL */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Book Cover Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
                />
              </div>
              
              {/* Presets picker */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Presets:
                </span>
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {coverPresets.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, cover_image: url })}
                      className="w-8 h-10 rounded overflow-hidden border hover:border-indigo-600 transition-all shrink-0"
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Book Description</label>
              <textarea
                rows="3"
                placeholder="Brief summary or abstract of the book..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
