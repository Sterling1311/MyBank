import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowLeft, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import type { Category, Operation } from '../../types/index';
import api from '../../services/api';
import toast from 'react-hot-toast'

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
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')}
            className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-400">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Operation' : 'New Operation'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Toggle Income / Expense */}
          <div className="bg-white rounded-2xl p-1 shadow-sm flex gap-1">
            <button type="button" onClick={() => { setOperationType('income'); setCategoryId(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                operationType === 'income'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              <TrendingUp size={15} />
              Income
            </button>
            <button type="button" onClick={() => { setOperationType('expense'); setCategoryId(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                operationType === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              <TrendingDown size={15} />
              Expense
            </button>
          </div>

          {/* Amount */}
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Amount</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-light text-gray-300">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-4xl font-bold text-gray-800 bg-transparent outline-none text-center w-40"
              />
            </div>
            <p className="text-xs text-gray-300 mt-2">
              {operationType === 'expense' ? 'Will be recorded as negative' : 'Will be recorded as positive'}
            </p>
          </div>

          {/* Label */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Label</p>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Groceries, Salary..."
              className="w-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-300"
            />
          </div>

          {/* Date */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Date</p>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-sm text-gray-800 bg-transparent outline-none"
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Category</p>
            {filteredCategories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">
                No {operationType} categories.{' '}
                <a href={`/categories?returnTo=/operations${isEdit ? `/${id}/edit` : '/new'}`}
                  className="text-[#00C49A] hover:underline">Create one</a>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(String(c.id))}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      categoryId === String(c.id)
                        ? operationType === 'expense'
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-green-50 border-green-300 text-green-600'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {c.name}
                    {categoryId === String(c.id) && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
            <a href={`/categories?returnTo=/operations${isEdit ? `/${id}/edit` : '/new'}`}
              className="block text-center text-xs text-[#00C49A] hover:underline mt-3">
              + Create new category
            </a>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs text-center bg-red-50 p-3 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-2 pb-6">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className={`flex-1 py-3 rounded-2xl text-white text-sm font-medium transition-colors disabled:opacity-50 ${
                operationType === 'expense'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}