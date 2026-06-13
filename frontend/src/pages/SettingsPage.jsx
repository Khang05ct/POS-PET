import { useState, useEffect } from 'react';
import settingApi from '../api/settingApi';
import { 
  Store, Phone, MapPin, Mail, CreditCard, Building, 
  FileText, Printer, Warehouse, Shield, Save, 
  CheckCircle, AlertTriangle
} from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setSaving(true);
      await settingApi.updateStoreStatus(newStatus);
      setSettings({...settings, store_status: newStatus});
      showToast('success', 'Đã cập nhật trạng thái cửa hàng');
    } catch(err) {
      showToast('error', 'Lỗi cập nhật trạng thái');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: 'store', label: 'Cửa hàng', icon: Store },
    { id: 'invoice', label: 'Hóa đơn', icon: FileText },
    { id: 'inventory', label: 'Kho hàng', icon: Warehouse },
    { id: 'security', label: 'Bảo mật', icon: Shield },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fadeInUp max-w-4xl">
      <div className="skeleton h-10 w-64"></div>
      <div className="skeleton h-80"></div>
    </div>
  );

  const statusOptions = [
    { value: 'OPEN', label: 'Đang mở cửa', desc: 'Cửa hàng hoạt động bình thường', color: 'emerald' },
    { value: 'PAUSED', label: 'Tạm ngưng', desc: 'Tạm dừng nhận đơn mới', color: 'amber' },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 toast-enter flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg font-medium text-[14px] ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý cấu hình cửa hàng và hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Store Settings Tab */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          {/* Store Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1">Trạng thái cửa hàng</h2>
            <p className="text-[12px] text-gray-400 mb-5">Kiểm soát trạng thái hoạt động của cửa hàng</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={saving}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    settings?.store_status === opt.value 
                      ? `border-${opt.color}-500 bg-${opt.color}-50` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${settings?.store_status === opt.value ? `bg-${opt.color}-500` : 'bg-gray-300'}`}></div>
                    <span className="text-[14px] font-bold text-gray-900">{opt.label}</span>
                  </div>
                  <p className="text-[12px] text-gray-500 ml-6">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1">Thông tin cửa hàng</h2>
            <p className="text-[12px] text-gray-400 mb-5">Thông tin hiển thị trên hóa đơn và hệ thống</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <Store size={14} /> Tên cửa hàng
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.store_name || ''} readOnly />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <Phone size={14} /> Số điện thoại
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.phone || ''} readOnly />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <Mail size={14} /> Email
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.email || ''} readOnly />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <MapPin size={14} /> Địa chỉ
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.address || ''} readOnly />
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1">Thông tin ngân hàng</h2>
            <p className="text-[12px] text-gray-400 mb-5">Dùng cho thanh toán QR Code và chuyển khoản</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <Building size={14} /> Ngân hàng
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.bank_name || ''} readOnly />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <CreditCard size={14} /> Số tài khoản
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.bank_account || ''} readOnly />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[12px] font-bold text-gray-600 mb-2">
                  <CreditCard size={14} /> Chủ tài khoản
                </label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" value={settings?.bank_owner || ''} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoice' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">Cài đặt hóa đơn</h2>
          <p className="text-[12px] text-gray-400 mb-5">Tùy chỉnh mẫu hóa đơn và in ấn</p>
          <div className="space-y-5">
            <div>
              <label className="text-[12px] font-bold text-gray-600 mb-2 block">Footer hóa đơn</label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-24" 
                value={settings?.invoice_footer || ''} 
                readOnly 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">Cài đặt kho hàng</h2>
          <p className="text-[12px] text-gray-400 mb-5">Quản lý quy tắc tồn kho và cảnh báo</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-[14px] font-semibold text-gray-800">Cảnh báo tồn kho thấp</p>
                <p className="text-[12px] text-gray-400">Thông báo khi sản phẩm dưới mức tối thiểu</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-[14px] font-semibold text-gray-800">Cho phép bán khi hết hàng</p>
                <p className="text-[12px] text-gray-400">Cho phép tạo đơn hàng khi tồn kho = 0</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">Bảo mật</h2>
          <p className="text-[12px] text-gray-400 mb-5">Quản lý mật khẩu và phiên đăng nhập</p>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-emerald-600" />
                <p className="text-[14px] font-semibold text-emerald-700">Mật khẩu được bảo vệ</p>
              </div>
              <p className="text-[12px] text-emerald-600 ml-6">Mật khẩu được mã hóa bằng bcrypt, an toàn tuyệt đối</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-[14px] font-semibold text-gray-800">Phiên đăng nhập</p>
              <p className="text-[12px] text-gray-400 mt-1">Token JWT hết hạn sau 30 ngày</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
