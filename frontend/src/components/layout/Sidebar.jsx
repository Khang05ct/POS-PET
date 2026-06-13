import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, ShoppingCart, Package, 
  Users, Settings, LogOut, ClipboardList, 
  Warehouse, PawPrint, Scissors, CalendarDays, 
  TicketPercent, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { userInfo, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard, role: 'ADMIN' },
        { name: 'Bán hàng', path: '/pos', icon: ShoppingCart, role: 'ALL' },
      ]
    },
    {
      title: 'QUẢN LÝ',
      items: [
        { name: 'Đơn hàng', path: '/orders', icon: ClipboardList, role: 'ALL' },
        { name: 'Khách hàng', path: '/customers', icon: Users, role: 'ALL' },
        { name: 'Sản phẩm', path: '/products', icon: Package, role: 'ADMIN' },
        { name: 'Kho hàng', path: '/inventory', icon: Warehouse, role: 'ADMIN' },
      ]
    },
    {
      title: 'DỊCH VỤ',
      items: [
        { name: 'Dịch vụ', path: '/services', icon: Scissors, role: 'ADMIN' },
        { name: 'Lịch hẹn', path: '/appointments', icon: CalendarDays, role: 'ALL' },
      ]
    },
    {
      title: 'KINH DOANH',
      items: [
        { name: 'Khuyến mãi', path: '/promotions', icon: TicketPercent, role: 'ADMIN' },
        { name: 'Báo cáo', path: '/reports', icon: BarChart3, role: 'ADMIN' },
      ]
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { name: 'Cài đặt', path: '/settings', icon: Settings, role: 'ADMIN' },
      ]
    },
  ];

  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.role === 'ALL' || (userInfo && userInfo.role === item.role)
    )
  })).filter(section => section.items.length > 0);

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-white border-r border-gray-100 h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative`}>
      
      {/* Logo */}
      <div className="h-[68px] flex items-center px-5 border-b border-gray-100 gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <PawPrint size={20} fill="currentColor" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[17px] font-extrabold text-gray-900 tracking-tight leading-tight">PetCare POS</h1>
            <p className="text-[10px] text-gray-400 font-medium">Hệ thống bán hàng</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[76px] w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
        {filteredSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[1.5px] px-3 mb-2">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
                      )}
                      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                      {!collapsed && (
                        <span className="text-[13.5px] truncate">{item.name}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-xl bg-gray-50">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {userInfo?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{userInfo?.full_name}</p>
                <p className="text-[11px] text-gray-400 truncate">{userInfo?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            title="Đăng xuất"
            className="w-full flex items-center justify-center py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
