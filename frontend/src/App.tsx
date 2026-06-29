import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import Dashboard from './features/operations/OperationList';
import OperationForm from './features/operations/OperationForm';
import OperationDetail from './features/operations/OperationDetail';
import CategoryPage from './features/categories/CategoryPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/operations/new" element={<ProtectedRoute><OperationForm /></ProtectedRoute>} />
            <Route path="/operations/:id" element={<ProtectedRoute><OperationDetail /></ProtectedRoute>} />
            <Route path="/operations/:id/edit" element={<ProtectedRoute><OperationForm /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;