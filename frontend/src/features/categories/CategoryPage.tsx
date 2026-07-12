import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Tag, TrendingUp, TrendingDown, ArrowLeft, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import type { Category } from '../../types/index';
import api from '../../services/api';

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => api.post('/api/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setError('');
      setShowForm(false);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'An error occurred');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: () => alert('Cannot delete this category — it has operations linked to it.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    createMutation.mutate({ name, type });
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  const otherCategories = categories.filter(c => !c.type);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 flex-1 w-full">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            {returnTo && (
              <a href={returnTo} className="flex items-center gap-1 text-xs text-[#00C49A] hover:underline mb-1">
                <ArrowLeft size={12} />
                Back to operation form
              </a>
            )}
            <h1 className="text-xl font-bold text-gray-800">Categories</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-[#00C49A] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#156064] transition-colors"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? 'Close' : 'New'}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-2xl p-4 mb-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">New Category</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setType('expense')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors ${type === 'expense' ? 'bg-red-50 border-red-300 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                  <TrendingDown size={13} />
                  Expense
                </button>
                <button type="button" onClick={() => setType('income')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors ${type === 'income' ? 'bg-green-50 border-green-300 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                  <TrendingUp size={13} />
                  Income
                </button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C49A]" />
                <button type="submit" disabled={createMutation.isPending}
                  className="bg-[#156064] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#00C49A] transition-colors disabled:opacity-50">
                  Add
                </button>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </form>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="space-y-4">

            {expenseCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <TrendingDown size={13} className="text-red-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expenses</span>
                  <span className="text-xs text-gray-300">({expenseCategories.length})</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {expenseCategories.map((c, idx) => (
                    <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className={`flex items-center justify-between px-4 py-3 ${idx < expenseCategories.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                          <Tag size={13} className="text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${c.name}"? This action cannot be undone.`))
                            deleteMutation.mutate(c.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {incomeCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <TrendingUp size={13} className="text-green-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Income</span>
                  <span className="text-xs text-gray-300">({incomeCategories.length})</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {incomeCategories.map((c, idx) => (
                    <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className={`flex items-center justify-between px-4 py-3 ${idx < incomeCategories.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                          <Tag size={13} className="text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${c.name}"? This action cannot be undone.`))
                            deleteMutation.mutate(c.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {otherCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Tag size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Other</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {otherCategories.map((c, idx) => (
                    <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className={`flex items-center justify-between px-4 py-3 ${idx < otherCategories.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                          <Tag size={13} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${c.name}"? This action cannot be undone.`))
                            deleteMutation.mutate(c.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {categories.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No categories yet — click New to create one
              </div>
            )}

            {returnTo && (
              <div className="text-center pt-4">
                <a href={returnTo} className="bg-[#156064] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-[#00C49A] transition-colors inline-flex items-center gap-2">
                  <ArrowLeft size={14} />
                  Back to operation form
                </a>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}