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
import ServicePage from './pages/ServicePage';
import AppointmentPage from './pages/AppointmentPage';
import PromotionPage from './pages/PromotionPage';
import ReportPage from './pages/ReportPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userInfo, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[14px] text-gray-500 font-medium">Đang tải...</p>
      </div>
    </div>
  );

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
        <Route path="services" element={<ProtectedRoute adminOnly><ServicePage /></ProtectedRoute>} />
        <Route path="appointments" element={<AppointmentPage />} />
        <Route path="promotions" element={<ProtectedRoute adminOnly><PromotionPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute adminOnly><ReportPage /></ProtectedRoute>} />
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
