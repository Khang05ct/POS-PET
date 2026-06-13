import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, ShoppingCart, Package, 
  Users, UserCircle, Settings, LogOut, 
  Store, ClipboardList, ListTree
} from 'lucide-react';

const Sidebar = () => {
  const { userInfo, logout } = useAuth();

  const navItems = [
    { name: 'POS Bán hàng', path: '/pos', icon: <ShoppingCart size={20} />, role: 'ALL' },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, role: 'ADMIN' },
    { name: 'Hóa đơn', path: '/orders', icon: <ClipboardList size={20} />, role: 'ALL' },
    { name: 'Sản phẩm', path: '/products', icon: <Package size={20} />, role: 'ADMIN' },
    { name: 'Danh mục', path: '/categories', icon: <ListTree size={20} />, role: 'ADMIN' },
    { name: 'Kho hàng', path: '/inventory', icon: <Store size={20} />, role: 'ADMIN' },
    { name: 'Khách hàng', path: '/customers', icon: <Users size={20} />, role: 'ALL' },
    { name: 'Nhân viên', path: '/users', icon: <UserCircle size={20} />, role: 'ADMIN' },
    { name: 'Cài đặt', path: '/settings', icon: <Settings size={20} />, role: 'ADMIN' },
  ];

  const filteredNav = navItems.filter(item => 
    item.role === 'ALL' || (userInfo && userInfo.role === item.role)
  );

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold text-emerald-600 tracking-tight">PetCare POS</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredNav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            {userInfo?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{userInfo?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
