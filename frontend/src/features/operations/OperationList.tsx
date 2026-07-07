import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import type { Operation, Category } from '../../types/index';
import api from '../../services/api';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string>('');

  const { data: operations = [], isLoading: loadingOps } = useQuery<Operation[]>({
    queryKey: ['operations'],
    queryFn: () => api.get('/api/operations').then(r => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  const deleteOp = useMutation({
    mutationFn: (id: number) => api.delete(`/api/operations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Operation deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete operation');
    }
  });

  const filtered = filterCategory
    ? operations.filter(o => o.category.id === Number(filterCategory))
    : operations;

  const total = filtered.reduce((sum, o) => sum + Number(o.amount), 0);

  const amountClass = (amount: number) => amount >= 0 ? 'text-green-600' : 'text-red-500';
  const amountPrefix = (amount: number) => amount >= 0 ? '+' : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#156064]">My Operations</h2>
          <Link to="/operations/new" className="bg-[#00C49A] text-white px-4 py-2 rounded-lg hover:bg-[#156064] transition-colors font-medium">Add Operation</Link>
        </div>

        <div className="mb-4">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {loadingOps ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No operations yet. <Link to="/operations/new" className="text-[#00C49A]">Add one!</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#156064] text-white">
                <tr>
                  <th className="text-left px-6 py-3">Label</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Category</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((op, idx) => (
                  <tr key={op.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}>
                    <td className="px-6 py-3">
                      <Link to={`/operations/${op.id}`} className="text-[#156064] hover:underline font-medium">{op.label}</Link>
                    </td>
                    <td className={`px-6 py-3 font-bold ${amountClass(Number(op.amount))}`}>
                      {amountPrefix(Number(op.amount))}{Number(op.amount).toFixed(2)} €
                    </td>
                    <td className="px-6 py-3 text-gray-600">{op.date}</td>
                    <td className="px-6 py-3">
                      <span className="bg-[#F8E16C] text-[#156064] px-2 py-1 rounded-full text-sm font-medium">{op.category.name}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Link to={`/operations/${op.id}/edit`} className="text-[#00C49A] hover:text-[#156064] font-medium">Edit</Link>
                        <button onClick={() => { if (confirm('Delete this operation?')) deleteOp.mutate(op.id); }} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td className="px-6 py-3 font-bold text-[#156064]">Total</td>
                  <td className={`px-6 py-3 font-bold ${amountClass(total)}`}>
                    {amountPrefix(total)}{total.toFixed(2)} €
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}