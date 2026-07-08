import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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
      toast.success('Operation deleted successfully!');
    },
    onError: () => toast.error('Failed to delete operation'),
  });

  const filtered = filterCategory
    ? operations.filter(o => o.category.id === Number(filterCategory))
    : operations;

  const total = filtered.reduce((sum, o) => sum + Number(o.amount), 0);
  const totalIncome = filtered.filter(o => Number(o.amount) > 0).reduce((sum, o) => sum + Number(o.amount), 0);
  const totalExpense = filtered.filter(o => Number(o.amount) < 0).reduce((sum, o) => sum + Number(o.amount), 0);

  // Solde actuel = toutes les opérations sans filtre
  const currentBalance = summary.reduce((sum, s) => sum + s.balance, 0);

  const amountClass = (amount: number) => amount >= 0 ? 'text-green-600' : 'text-red-500';
  const amountPrefix = (amount: number) => amount >= 0 ? '+' : '';
  const isCurrentMonth = currentMonth === getCurrentMonth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* Solde actuel */}
        <div className="bg-white rounded-xl shadow p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
          <p className={`text-3xl font-bold ${amountClass(currentBalance)}`}>
            {amountPrefix(currentBalance)}{currentBalance.toFixed(2)} €
          </p>
          <p className="text-xs text-gray-400 mt-1">All your operations</p>
        </div>

        {/* Sélecteur de mois */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(getPrevMonth(currentMonth))}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors text-[#156064] font-medium"
          >
            ← Prev
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#156064] capitalize">
              {getMonthLabel(currentMonth)}
            </h2>
            {!isCurrentMonth && (
              <button
                onClick={() => setCurrentMonth(getCurrentMonth())}
                className="text-sm text-[#00C49A] hover:underline mt-1"
              >
                Back to current month
              </button>
            )}
          </div>
          <button
            onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
            disabled={isCurrentMonth}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors text-[#156064] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>

        {/* Résumé du mois */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Income</p>
            <p className="text-xl font-bold text-green-600">+{totalIncome.toFixed(2)} €</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Expense</p>
            <p className="text-xl font-bold text-red-500">{totalExpense.toFixed(2)} €</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00C49A]">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Link to="/operations/new" className="bg-[#00C49A] text-white px-4 py-2 rounded-lg hover:bg-[#156064] transition-colors font-medium text-sm">
            Add Operation
          </Link>
        </div>

        {loadingOps ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No operations for this month.{' '}
            <Link to="/operations/new" className="text-[#00C49A]">Add one!</Link>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
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
                    <motion.tr
                      key={op.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FFFE]'}
                    >
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
                    </motion.tr>
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

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((op, idx) => (
                <motion.div
                  key={op.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl shadow p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/operations/${op.id}`} className="font-bold text-[#156064] text-lg">{op.label}</Link>
                    <span className={`font-bold text-lg ${amountClass(Number(op.amount))}`}>
                      {amountPrefix(Number(op.amount))}{Number(op.amount).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span className="bg-[#F8E16C] text-[#156064] px-2 py-1 rounded-full text-xs font-medium">{op.category.name}</span>
                      <span className="text-gray-400 text-sm">{op.date}</span>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/operations/${op.id}/edit`} className="text-[#00C49A] font-medium text-sm">Edit</Link>
                      <button onClick={() => { if (confirm('Delete this operation?')) deleteOp.mutate(op.id); }} className="text-red-500 font-medium text-sm">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <span className="font-bold text-[#156064]">Total</span>
                <span className={`font-bold text-lg ${amountClass(total)}`}>
                  {amountPrefix(total)}{total.toFixed(2)} €
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}