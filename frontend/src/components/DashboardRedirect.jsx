import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Dashboard routing based on roles
  switch (user.role) {
    case 'admin':
      return <Navigate to="/app/admin" replace />;
    case 'citizen':
      return <Navigate to="/app/citizen" replace />;
    case 'maintenance':
      return <Navigate to="/app/maintenance" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;
