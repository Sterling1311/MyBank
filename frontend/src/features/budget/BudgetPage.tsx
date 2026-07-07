import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Category, Operation } from '../../types/index';
import api from '../../services/api';

interface BudgetItem {
  id: number;
  category: Category;
  allocated_amount: number;
  spent: number;
  remaining: number;
  percentage_used: number;
}

interface BudgetData {
  total_balance: number;
  budgets: BudgetItem[];
}

const COLORS = ['#156064', '#00C49A', '#F8E16C', '#E74C3C', '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C'];

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);

  const { data: budgetData, isLoading } = useQuery<BudgetData>({
    queryKey: ['budgets'],
    queryFn: () => api.get('/api/budgets').then(r => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  const { data: operations = [] } = useQuery<Operation[]>({
    queryKey: ['operations'],
    queryFn: () => api.get('/api/operations').then(r => r.data),
  });

  const expenseCategories = categories.filter(c => !c.type || c.type === 'expense');

  const createMutation = useMutation({
    mutationFn: (data: object) => api.post('/api/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setCategoryId('');
      setAmount('');
      setError('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'An error occurred');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setSelectedBudget(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) { setError('All fields are required'); return; }
    createMutation.mutate({ category_id: parseInt(categoryId), allocated_amount: parseFloat(amount) });
  };

  const balanceClass = (budgetData?.total_balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-500';
  const balancePrefix = (budgetData?.total_balance ?? 0) >= 0 ? '+' : '';

  const pieData = (budgetData?.budgets ?? []).map(b => ({
    name: b.category.name,
    value: b.spent,
    allocated: b.allocated_amount,
    remaining: b.remaining,
  }));

  const selectedOperations = selectedBudget
    ? operations.filter(o => o.category.id === selectedBudget.category.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#156064] text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🏦 MyBank</h1>
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="hover:text-[#F8E16C]">Dashboard</a>
          <a href="/budget" className="hover:text-[#F8E16C] text-[#F8E16C]">Budget</a>
          <a href="/categories" className="hover:text-[#F8E16C]">Categories</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Solde global */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-500 mb-1">Total Balance</h2>
          <p className={`text-4xl font-bold ${balanceClass}`}>
            {balancePrefix}{(budgetData?.total_balance ?? 0).toFixed(2)} €
          </p>
          <p className="text-sm text-gray-400 mt-1">Sum of all your operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-[#156064] mb-4">Spending by Category</h2>
            {pieData.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No budget data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Formulaire allocation */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-[#156064] mb-4">Allocate Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]">
                  <option value="">Select a category</option>
                  {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount (€)</label>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]" placeholder="100.00" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={createMutation.isPending} className="w-full bg-[#00C49A] text-white py-2 rounded-lg hover:bg-[#156064] transition-colors disabled:opacity-50">
                {createMutation.isPending ? 'Saving...' : 'Save Budget'}
              </button>
            </form>
          </div>
        </div>

        {/* Budget Tracker */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <h2 className="text-xl font-bold text-[#156064] p-6 border-b">Budget Tracker</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (budgetData?.budgets ?? []).length === 0 ? (
            <div className="text-center py-8 text-gray-400">No budgets allocated yet</div>
          ) : (
            <div className="divide-y">
              {(budgetData?.budgets ?? []).map((b, idx) => (
                <div
                  key={b.id}
                  className={`p-6 cursor-pointer transition-colors ${selectedBudget?.id === b.id ? 'bg-[#E8F8F5] border-l-4 border-[#00C49A]' : idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-[#F5FFFE] hover:bg-gray-50'}`}
                  onClick={() => setSelectedBudget(selectedBudget?.id === b.id ? null : b)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#156064]">{b.category.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">Click to see operations</span>
                      <span className="text-sm text-gray-500">{b.percentage_used}% used</span>
                      <button
                        onClick={e => { e.stopPropagation(); if (confirm(`Delete budget for ${b.category.name}?`)) deleteMutation.mutate(b.id); }}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all ${b.percentage_used > 100 ? 'bg-red-500' : b.percentage_used > 80 ? 'bg-yellow-400' : 'bg-[#00C49A]'}`}
                      style={{ width: `${Math.min(b.percentage_used, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Spent: <span className="font-medium text-red-500">{b.spent.toFixed(2)} €</span></span>
                    <span className="text-gray-500">Allocated: <span className="font-medium">{b.allocated_amount.toFixed(2)} €</span></span>
                    <span className="text-gray-500">Remaining: <span className={`font-medium ${b.remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>{b.remaining.toFixed(2)} €</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique des opérations de la catégorie sélectionnée */}
        {selectedBudget && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#156064]">
                Operations — {selectedBudget.category.name}
              </h2>
              <button onClick={() => setSelectedBudget(null)} className="text-gray-400 hover:text-gray-600 text-sm">
                Close ✕
              </button>
            </div>
            {selectedOperations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No operations in this category yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="text-left px-6 py-3">Label</th>
                    <th className="text-left px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOperations.map((op, idx) => (
                    <tr key={op.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}>
                      <td className="px-6 py-3 font-medium text-[#156064]">{op.label}</td>
                      <td className={`px-6 py-3 font-bold ${Number(op.amount) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {Number(op.amount) >= 0 ? '+' : ''}{Number(op.amount).toFixed(2)} €
                      </td>
                      <td className="px-6 py-3 text-gray-500">{op.date}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="px-6 py-3 font-bold text-[#156064]">Total spent</td>
                    <td className="px-6 py-3 font-bold text-red-500">
                      -{selectedBudget.spent.toFixed(2)} €
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}