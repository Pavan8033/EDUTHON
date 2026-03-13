import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRedirect from "./components/DashboardRedirect";
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import MapPage from './pages/MapPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Area with App Shell Layout */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="dashboard" element={<DashboardRedirect />} />
            <Route path="citizen" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="maintenance" element={<ProtectedRoute roles={['maintenance']}><MaintenanceDashboard /></ProtectedRoute>} />
            <Route path="map" element={<ProtectedRoute roles={['citizen', 'admin']}><MapPage /></ProtectedRoute>} />
          </Route>
          
          {/* Redirects for old paths */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/map" element={<Navigate to="/app/map" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
