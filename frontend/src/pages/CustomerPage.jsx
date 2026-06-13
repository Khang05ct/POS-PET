import { useState, useEffect } from 'react';
import customerApi from '../api/customerApi';
import { formatCurrency } from '../utils/formatCurrency';
import { Edit, Trash2, Plus, X, User } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '', note: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customerApi.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (customer = null) => {
    setCurrentCustomer(customer);
    if (customer) {
      setFormData({ 
        full_name: customer.full_name, 
        phone: customer.phone || '', 
        address: customer.address || '', 
        note: customer.note || '' 
      });
    } else {
      setFormData({ full_name: '', phone: '', address: '', note: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentCustomer) {
        await customerApi.updateCustomer(currentCustomer.id, formData);
      } else {
        await customerApi.createCustomer(formData);
      }
      await fetchCustomers();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await customerApi.deleteCustomer(id);
        await fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể xóa khách hàng đã có giao dịch mua hàng.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Lưu trữ thông tin và lịch sử mua hàng</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Thêm khách hàng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6 font-medium">Khách hàng</th>
              <th className="py-4 px-6 font-medium">Số điện thoại</th>
              <th className="py-4 px-6 font-medium">Địa chỉ</th>
              <th className="py-4 px-6 font-medium">Điểm tích lũy</th>
              <th className="py-4 px-6 font-medium">Ngày tham gia</th>
              <th className="py-4 px-6 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{c.full_name}</div>
                      <div className="text-xs text-gray-500 max-w-[150px] truncate">{c.note || 'Không có ghi chú'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-gray-700">{c.phone || '-'}</td>
                <td className="py-4 px-6 text-sm text-gray-600 max-w-[200px] truncate">{c.address || '-'}</td>
                <td className="py-4 px-6 font-bold text-amber-500">{c.reward_points} pt</td>
                <td className="py-4 px-6 text-sm text-gray-500">{formatDate(c.created_at, 'dd/MM/yyyy')}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openModal(c)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 bg-blue-50 rounded hover:bg-blue-100">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 transition-colors p-1 bg-red-50 rounded hover:bg-red-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500">
                  <User size={48} className="mx-auto text-gray-300 mb-3" />
                  <p>Chưa có khách hàng nào. Hãy thêm mới!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {currentCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-gray-50/30">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  placeholder="VD: 0987654321"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  placeholder="VD: 123 Đường ABC..."
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Thói quen, sở thích pet...)</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white resize-none"
                  placeholder="..."
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70 shadow-sm"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
