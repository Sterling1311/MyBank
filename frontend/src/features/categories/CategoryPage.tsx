import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import type { Category } from '../../types/index';
import api from '../../services/api';

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [error, setError] = useState('');
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
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'An error occurred');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-6 py-8">

        {returnTo && (
          <div className="mb-6">
            <a href={returnTo} className="text-[#00C49A] hover:underline font-medium">
              ← Back to operation form
            </a>
          </div>
        )}

        <h2 className="text-2xl font-bold text-[#156064] mb-6">Categories</h2>

        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No categories yet</div>
          ) : (
            <div>
              {expenseCategories.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase">Expenses</div>
                  <ul>
                    {expenseCategories.map((c, idx) => (
                      <li key={c.id} className={`flex justify-between items-center px-6 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}`}>
                        <span className="font-medium text-[#156064]">🏷 {c.name}</span>
                        <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {incomeCategories.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-green-50 text-green-600 text-xs font-bold uppercase">Income</div>
                  <ul>
                    {incomeCategories.map((c, idx) => (
                      <li key={c.id} className={`flex justify-between items-center px-6 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}`}>
                        <span className="font-medium text-[#156064]">🏷 {c.name}</span>
                        <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {otherCategories.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-gray-50 text-gray-500 text-xs font-bold uppercase">Other</div>
                  <ul>
                    {otherCategories.map((c, idx) => (
                      <li key={c.id} className={`flex justify-between items-center px-6 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}`}>
                        <span className="font-medium text-[#156064]">🏷 {c.name}</span>
                        <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-[#156064] mb-4">Add Category</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${type === 'expense' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                Expense
              </button>
              <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${type === 'income' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                Income
              </button>
            </div>
            <div className="flex gap-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category name"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]" />
              <button type="submit" disabled={createMutation.isPending}
                className="bg-[#00C49A] text-white px-4 py-2 rounded-lg hover:bg-[#156064] transition-colors disabled:opacity-50">
                Add
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        {returnTo && (
          <div className="mt-6 text-center">
            <a href={returnTo} className="bg-[#156064] text-white px-6 py-3 rounded-lg hover:bg-[#00C49A] transition-colors font-medium">
              ← Back to operation form
            </a>
          </div>
        )}
      </main>
    </div>
  );
}