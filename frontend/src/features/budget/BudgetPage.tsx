import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Wallet, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

const COLORS = ['#156064', '#00C49A', '#F8E16C', '#E74C3C', '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C'];

function getMonthLabel(month: string) {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: budgetData, isLoading } = useQuery<BudgetData>({
    queryKey: ['budgets'],
    queryFn: () => api.get('/api/budgets').then(r => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  const { data: operations = [] } = useQuery<Operation[]>({
    queryKey: ['operations', 'all'],
    queryFn: () => api.get('/api/operations').then(r => r.data),
  });

  const { data: summary = [] } = useQuery<MonthlySummary[]>({
    queryKey: ['operations-summary'],
    queryFn: () => api.get('/api/operations/summary').then(r => r.data),
  });

  const expenseCategories = categories.filter(c => !c.type || c.type === 'expense');

  const createMutation = useMutation({
    mutationFn: (data: object) => api.post('/api/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setCategoryId('');
      setAmount('');
      setError('');
      setShowForm(false);
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

  const balance = budgetData?.total_balance ?? 0;
  const balancePositive = balance >= 0;

  const pieData = (budgetData?.budgets ?? []).map(b => ({
    name: b.category.name,
    value: b.spent,
  }));

  const chartData = summary.slice(-6).map(s => ({
    month: getMonthLabel(s.month),
    Income: Math.round(s.income * 100) / 100,
    Expense: Math.round(s.expense * 100) / 100,
  }));

  const selectedOperations = selectedBudget
    ? operations.filter(o => o.category.id === selectedBudget.category.id)
    : [];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-8 flex-1 w-full">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#156064] rounded-2xl p-6 mb-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="opacity-70" />
            <p className="text-sm opacity-70 uppercase tracking-widest">Total Balance</p>
          </div>
          <p className={`text-4xl font-bold ${balancePositive ? 'text-white' : 'text-red-300'}`}>
            {balancePositive ? '+' : ''}{balance.toFixed(2)} €
          </p>
          <p className="text-xs opacity-50 mt-2">All your operations combined</p>
        </motion.div>

        {chartData.length > 1 && (
          <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Monthly Evolution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} €`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Income" fill="#00C49A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#E74C3C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Budget Tracker</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 bg-[#00C49A] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#156064] transition-colors"
            >
              <Plus size={13} />
              Allocate
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C49A]">
                  <option value="">Select a category</option>
                  {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="Amount (€)"
                    className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C49A]" />
                  <button type="submit" disabled={createMutation.isPending}
                    className="bg-[#156064] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#00C49A] transition-colors disabled:opacity-50">
                    Save
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </form>
            </motion.div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : (budgetData?.budgets ?? []).length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No budgets yet — click Allocate to start</div>
          ) : (
            <div className="space-y-3">
              {(budgetData?.budgets ?? []).map((b, idx) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => setSelectedBudget(selectedBudget?.id === b.id ? null : b)}
                      className="flex items-center gap-2 font-semibold text-gray-800"
                    >
                      {b.category.name}
                      {selectedBudget?.id === b.id
                        ? <ChevronUp size={14} className="text-gray-400" />
                        : <ChevronDown size={14} className="text-gray-400" />
                      }
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${b.percentage_used > 100 ? 'text-red-500' : b.percentage_used > 80 ? 'text-yellow-500' : 'text-[#00C49A]'}`}>
                        {b.percentage_used}%
                      </span>
                      <button onClick={() => { if (confirm(`Delete budget for ${b.category.name}?`)) deleteMutation.mutate(b.id); }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(b.percentage_used, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${b.percentage_used > 100 ? 'bg-red-500' : b.percentage_used > 80 ? 'bg-yellow-400' : 'bg-[#00C49A]'}`}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Spent <span className="font-medium text-red-400">{b.spent.toFixed(2)} €</span></span>
                    <span>Allocated <span className="font-medium text-gray-600">{b.allocated_amount.toFixed(2)} €</span></span>
                    <span>Left <span className={`font-medium ${b.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>{b.remaining.toFixed(2)} €</span></span>
                  </div>

                  {selectedBudget?.id === b.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 pt-3 border-t border-gray-50"
                    >
                      {selectedOperations.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No operations yet</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedOperations.map(op => (
                            <div key={op.id} className="flex justify-between items-center">
                              <div>
                                <p className="text-xs font-medium text-gray-700">{op.label}</p>
                                <p className="text-xs text-gray-400">{op.date}</p>
                              </div>
                              <span className={`text-xs font-bold ${Number(op.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Number(op.amount) >= 0 ? '+' : ''}{Number(op.amount).toFixed(2)} €
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}