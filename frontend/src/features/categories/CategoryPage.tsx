import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '../../types/index';
import api from '../../services/api';

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

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
    createMutation.mutate({ name });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#156064] text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🏦 MyBank</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="hover:text-[#F8E16C]">Dashboard</a>
          <a href="/categories" className="hover:text-[#F8E16C]">Categories</a>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-[#156064] mb-6">Categories</h2>

        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No categories yet</div>
          ) : (
            <ul>
              {categories.map((c, idx) => (
                <li key={c.id} className={`flex justify-between items-center px-6 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}`}>
                  <span className="font-medium text-[#156064]">🏷 {c.name}</span>
                  <button
                    onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-[#156064] mb-4">Add Category</h3>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#00C49A] text-white px-4 py-2 rounded-lg hover:bg-[#156064] transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </main>
    </div>
  );
}