import { useState, useEffect } from 'react';
import settingApi from '../api/settingApi';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await settingApi.updateStoreStatus(newStatus);
      setSettings({...settings, store_status: newStatus});
      alert('Đã cập nhật trạng thái cửa hàng');
    } catch(err) {
      alert('Lỗi cập nhật trạng thái');
    }
  }

  if(!settings) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Trạng thái cửa hàng</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="OPEN" checked={settings.store_status === 'OPEN'} onChange={handleStatusChange} />
            <span className="text-green-600 font-medium">Đang mở cửa</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="PAUSED" checked={settings.store_status === 'PAUSED'} onChange={handleStatusChange} />
            <span className="text-yellow-600 font-medium">Tạm ngưng</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Thông tin chung (Chỉ xem)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tên cửa hàng</label>
            <input type="text" className="w-full border rounded p-2" value={settings.store_name || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
            <input type="text" className="w-full border rounded p-2" value={settings.phone || ''} readOnly />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
            <input type="text" className="w-full border rounded p-2" value={settings.address || ''} readOnly />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Thông tin Ngân hàng (QR Pay)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngân hàng</label>
            <input type="text" className="w-full border rounded p-2 bg-gray-50" value={settings.bank_name || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số tài khoản</label>
            <input type="text" className="w-full border rounded p-2 bg-gray-50" value={settings.bank_account || ''} readOnly />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Tên chủ TK</label>
            <input type="text" className="w-full border rounded p-2 bg-gray-50" value={settings.bank_owner || ''} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
