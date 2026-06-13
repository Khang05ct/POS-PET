import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import settingApi from '../../api/settingApi';
import { 
  Search, Bell, HelpCircle, ChevronDown, 
  User, Settings, LogOut, Store,
  Package, AlertTriangle
} from 'lucide-react';

const Topbar = () => {
  const socket = useSocket();
  const { userInfo, logout } = useAuth();
  const [storeStatus, setStoreStatus] = useState('OPEN');
  const [storeName, setStoreName] = useState('PetCare Store');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingApi.getSettings();
        setStoreStatus(data.store_status);
        setStoreName(data.store_name);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();

    if (socket) {
      socket.on('store-status:update', (data) => {
        setStoreStatus(data.status);
      });
      
      socket.on('inventory:low-stock', (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'warning',
          title: 'Cảnh báo tồn kho',
          message: `${data.product_name} còn ${data.stock_quantity} ${data.unit || 'sản phẩm'}`,
          time: new Date().toLocaleTimeString('vi-VN'),
          read: false,
        }, ...prev].slice(0, 20));
      });
    }

    return () => {
      if (socket) {
        socket.off('store-status:update');
        socket.off('inventory:low-stock');
      }
    };
  }, [socket]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const statusConfig = {
    OPEN: { label: 'Đang mở', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    PAUSED: { label: 'Tạm ngưng', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    OUT_OF_STOCK: { label: 'Hết hàng', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  };

  const status = statusConfig[storeStatus] || statusConfig.OPEN;

  return (
    <header className="h-[68px] bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0">
      {/* Left Side: Store Name + Status */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">{storeName}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></span>
            <span className={`text-[11px] font-medium ${status.textColor}`}>{status.label}</span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <HelpCircle size={20} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-gray-900">Thông báo</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                    className="text-[12px] text-emerald-600 font-medium hover:underline"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-[13px] text-gray-400">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-emerald-50/30' : ''}`}
                      onClick={() => setNotifications(prev => prev.map(notif => notif.id === n.id ? {...notif, read: true} : notif))}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {n.type === 'warning' ? <AlertTriangle size={16} /> : <Package size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800">{n.title}</p>
                          <p className="text-[12px] text-gray-500 mt-0.5 truncate">{n.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-gray-200 mx-1"></div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[13px]">
              {userInfo?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">{userInfo?.full_name}</p>
              <p className="text-[11px] text-gray-400">{userInfo?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden lg:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-14 w-[220px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[13px] font-bold text-gray-900">{userInfo?.full_name}</p>
                <p className="text-[12px] text-gray-400">{userInfo?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={16} />
                  Thông tin cá nhân
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={16} />
                  Cài đặt
                </button>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
