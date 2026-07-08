import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Filter, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import type { Operation, Category } from '../../types/index';
import api from '../../services/api';

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(month: string) {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function getPrevMonth(month: string) {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getNextMonth(month: string) {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const { data: operations = [], isLoading: loadingOps } = useQuery<Operation[]>({
    queryKey: ['operations', currentMonth],
    queryFn: () => api.get(`/api/operations?month=${currentMonth}`).then(r => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then(r => r.data),
  });

  const { data: summary = [] } = useQuery<MonthlySummary[]>({
    queryKey: ['operations-summary'],
    queryFn: () => api.get('/api/operations/summary').then(r => r.data),
  });

  const deleteOp = useMutation({
    mutationFn: (id: number) => api.delete(`/api/operations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', currentMonth] });
      queryClient.invalidateQueries({ queryKey: ['operations-summary'] });
      toast.success('Operation deleted!');
    },
    onError: () => toast.error('Failed to delete operation'),
  });

  const filtered = filterCategory
    ? operations.filter(o => o.category.id === Number(filterCategory))
    : operations;

  const total = filtered.reduce((sum, o) => sum + Number(o.amount), 0);
  const totalIncome = filtered.filter(o => Number(o.amount) > 0).reduce((sum, o) => sum + Number(o.amount), 0);
  const totalExpense = filtered.filter(o => Number(o.amount) < 0).reduce((sum, o) => sum + Number(o.amount), 0);
  const currentBalance = summary.reduce((sum, s) => sum + s.balance, 0);

  const amountClass = (amount: number) => amount >= 0 ? 'text-green-500' : 'text-red-500';
  const amountPrefix = (amount: number) => amount >= 0 ? '+' : '';
  const isCurrentMonth = currentMonth === getCurrentMonth();

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Solde actuel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#156064] rounded-2xl p-6 mb-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="opacity-70" />
            <p className="text-sm opacity-70 uppercase tracking-widest">Current Balance</p>
          </div>
          <p className="text-4xl font-bold mb-4">
            {amountPrefix(currentBalance)}{currentBalance.toFixed(2)} €
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 flex-1">
              <TrendingUp size={16} className="text-green-300" />
              <div>
                <p className="text-xs opacity-60">Income</p>
                <p className="text-sm font-bold text-green-300">+{totalIncome.toFixed(2)} €</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 flex-1">
              <TrendingDown size={16} className="text-red-300" />
              <div>
                <p className="text-xs opacity-60">Expense</p>
                <p className="text-sm font-bold text-red-300">{totalExpense.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sélecteur de mois */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth(getPrevMonth(currentMonth))}
            className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-[#156064] font-bold"
          >
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-base font-semibold text-[#156064] capitalize">
              {getMonthLabel(currentMonth)}
            </h2>
            {!isCurrentMonth && (
              <button onClick={() => setCurrentMonth(getCurrentMonth())} className="text-xs text-[#00C49A] hover:underline">
                Today
              </button>
            )}
          </div>
          <button
            onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
            disabled={isCurrentMonth}
            className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-[#156064] font-bold disabled:opacity-30"
          >
            ›
          </button>
        </div>

        {/* Filtre + bouton ajout */}
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm flex-1">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm text-gray-600 bg-transparent outline-none flex-1"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Link
            to="/operations/new"
            className="flex items-center gap-2 bg-[#00C49A] text-white px-4 py-2 rounded-xl shadow-sm hover:bg-[#156064] transition-colors font-medium text-sm"
          >
            <Plus size={16} />
            Add
          </Link>
        </div>

        {/* Liste des opérations */}
        {loadingOps ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-3">No operations this month</p>
            <Link to="/operations/new" className="text-[#00C49A] font-medium text-sm">+ Add your first operation</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">This month</span>
              <span className={`text-sm font-bold ${amountClass(total)}`}>
                {amountPrefix(total)}{total.toFixed(2)} €
              </span>
            </div>

            {filtered.map((op, idx) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/operations/${op.id}`} className="font-semibold text-gray-800 hover:text-[#156064] transition-colors">
                      {op.label}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-[#F8E16C] text-[#156064] px-2 py-0.5 rounded-full font-medium">
                        {op.category.name}
                      </span>
                      <span className="text-xs text-gray-400">{op.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-base ${amountClass(Number(op.amount))}`}>
                      {amountPrefix(Number(op.amount))}{Number(op.amount).toFixed(2)} €
                    </span>
                    <div className="flex gap-1">
                      <Link to={`/operations/${op.id}/edit`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                        <Pencil size={13} className="text-gray-400" />
                      </Link>
                      <button
                        onClick={() => { if (confirm('Delete?')) deleteOp.mutate(op.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}