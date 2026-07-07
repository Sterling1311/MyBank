import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import type { Category, Operation } from '../../types/index';
import api from '../../services/api';

export default function OperationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [operationType, setOperationType] = useState<'income' | 'expense'>('expense');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  const { data: operation } = useQuery<Operation>({
    queryKey: ['operation', id],
    queryFn: () => api.get(`/api/operations/${id}`).then(r => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (operation && !initialized) {
      setLabel(operation.label);
      setAmount(String(Math.abs(Number(operation.amount))));
      setOperationType(Number(operation.amount) >= 0 ? 'income' : 'expense');
      setDate(operation.date);
      setCategoryId(String(operation.category.id));
      setInitialized(true);
    }
  }, [operation, initialized]);

  const mutation = useMutation({
    mutationFn: (data: object) => isEdit
      ? api.put(`/api/operations/${id}`, data)
      : api.post('/api/operations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success(isEdit ? 'Operation updated!' : 'Operation created!');
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'An error occurred');
      toast.error('Failed to save operation');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amount || !date || !categoryId) {
      setError('All fields are required');
      return;
    }
    const finalAmount = operationType === 'expense'
      ? -Math.abs(parseFloat(amount))
      : Math.abs(parseFloat(amount));

    mutation.mutate({ label, amount: finalAmount, date, category_id: parseInt(categoryId) });
  };

  const filteredCategories = categories.filter(c => c.type === operationType);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-[#156064] mb-6">
            {isEdit ? 'Edit Operation' : 'Add Operation'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operation Type</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setOperationType('income'); setCategoryId(''); }}
                  className={`flex-1 py-3 rounded-lg font-medium border-2 transition-colors ${operationType === 'income' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'}`}>
                  ↑ Income
                </button>
                <button type="button" onClick={() => { setOperationType('expense'); setCategoryId(''); }}
                  className={`flex-1 py-3 rounded-lg font-medium border-2 transition-colors ${operationType === 'expense' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
                  ↓ Expense
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]"
                placeholder="Groceries" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount * ({operationType === 'expense' ? 'will be negative' : 'will be positive'})
              </label>
              <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]"
                placeholder="45.50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]">
                <option value="">Select a category</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-400 mt-1">
                {"Can't find your category? "}
                <a href={`/categories?returnTo=/operations${isEdit ? `/${id}/edit` : '/new'}`}
                  className="text-[#00C49A] hover:underline font-medium">
                  Create one here
                </a>
              </p>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/dashboard')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending}
                className={`flex-1 text-white py-2 rounded-lg transition-colors disabled:opacity-50 ${operationType === 'expense' ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}>
                {mutation.isPending ? 'Saving...' : 'Save Operation'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}