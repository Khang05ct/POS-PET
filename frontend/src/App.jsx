import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import InventoryPage from './pages/InventoryPage';
import CustomerPage from './pages/CustomerPage';
import OrderPage from './pages/OrderPage';
import SettingsPage from './pages/SettingsPage';
import UserPage from './pages/UserPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userInfo, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userInfo.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
        <Route path="pos" element={<POSPage />} />
        <Route path="products" element={<ProtectedRoute adminOnly><ProductPage /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute adminOnly><CategoryPage /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute adminOnly><InventoryPage /></ProtectedRoute>} />
        <Route path="customers" element={<CustomerPage />} />
        <Route path="orders" element={<OrderPage />} />
        <Route path="settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute adminOnly><UserPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
