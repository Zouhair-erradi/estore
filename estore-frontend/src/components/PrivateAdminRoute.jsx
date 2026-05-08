import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateAdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return children;
}
