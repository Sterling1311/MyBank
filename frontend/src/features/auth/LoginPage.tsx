import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../../services/api';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !consent) {
      setError('You must accept the Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await api.post('/api/auth/register', { email, password });
        setMode('login');
        setError('Account created! Please log in.');
        return;
      }
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA]">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#156064]">🏦 MyBank</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your finances</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-[#156064] shadow-sm' : 'text-gray-400'}`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white text-[#156064] shadow-sm' : 'text-gray-400'}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00C49A]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00C49A]"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#00C49A]"
              />
              <label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed">
                I agree to the{' '}
                <Link to="/privacy" className="text-[#00C49A] hover:underline font-medium">
                  Privacy Policy
                </Link>
                {' '}and consent to the processing of my personal data by BankBank in accordance with GDPR.
              </label>
            </div>
          )}

          {error && (
            <p className={`text-xs p-3 rounded-xl ${error.includes('created') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00C49A] text-white py-3 rounded-xl font-medium hover:bg-[#156064] transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link to="/privacy" className="text-xs text-gray-400 hover:text-[#00C49A] transition-colors">
          Privacy Policy
        </Link>
      </div>
    </main>
  );
}