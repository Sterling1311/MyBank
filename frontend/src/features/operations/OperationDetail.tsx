import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import type { Operation } from '../../types/index';
import api from '../../services/api';

export default function OperationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: operation, isLoading } = useQuery<Operation>({
    queryKey: ['operation', id],
    queryFn: () => api.get(`/api/operations/${id}`).then(r => r.data),
  });

  const deleteOp = useMutation({
    mutationFn: () => api.delete(`/api/operations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      navigate('/dashboard');
    },
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!operation) return <div className="text-center py-12">Operation not found</div>;

  const amountClass = Number(operation.amount) >= 0 ? 'text-green-600' : 'text-red-500';
  const amountPrefix = Number(operation.amount) >= 0 ? '+' : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => navigate('/dashboard')} className="text-[#00C49A] mb-6 flex items-center gap-1 hover:underline">
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-[#156064] mb-6">Operation Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500 font-medium">Label</span>
              <span className="font-semibold">{operation.label}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500 font-medium">Amount</span>
              <span className={`font-bold text-lg ${amountClass}`}>
                {amountPrefix}{Number(operation.amount).toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500 font-medium">Date</span>
              <span>{operation.date}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500 font-medium">Category</span>
              <span className="bg-[#F8E16C] text-[#156064] px-3 py-1 rounded-full text-sm font-medium">
                {operation.category.name}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <a href={`/operations/${id}/edit`} className="flex-1 text-center bg-[#00C49A] text-white py-2 rounded-lg hover:bg-[#156064] transition-colors font-medium">
              Edit Operation
            </a>
            <button onClick={() => { if (confirm('Delete this operation?')) deleteOp.mutate(); }}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Delete Operation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}