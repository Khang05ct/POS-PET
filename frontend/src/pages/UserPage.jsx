import { useState, useEffect } from 'react';
import userApi from '../api/userApi';
import { Edit, Lock, Unlock, Plus, X, ShieldAlert } from 'lucide-react';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: 'STAFF', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (user = null) => {
    setCurrentUser(user);
    if (user) {
      setFormData({ 
        full_name: user.full_name, 
        email: user.email, 
        phone: user.phone || '', 
        role: user.role,
        password: '' // Don't fill password on edit
      });
    } else {
      setFormData({ full_name: '', email: '', phone: '', role: 'STAFF', password: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser) {
        // Exclude password if it's empty during update
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await userApi.updateUser(currentUser.id, payload);
      } else {
        await userApi.createUser(formData);
      }
      await fetchUsers();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const action = newStatus === 'LOCKED' ? 'khóa' : 'mở khóa';
    
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      try {
        await userApi.lockUser(id, newStatus);
        await fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
          <p className="text-sm text-gray-500 mt-1">Phân quyền và quản lý tài khoản truy cập hệ thống</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6 font-medium">Nhân viên</th>
              <th className="py-4 px-6 font-medium">Email</th>
              <th className="py-4 px-6 font-medium">Số điện thoại</th>
              <th className="py-4 px-6 font-medium">Vai trò</th>
              <th className="py-4 px-6 font-medium">Trạng thái</th>
              <th className="py-4 px-6 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{u.full_name}</td>
                <td className="py-4 px-6 text-gray-600">{u.email}</td>
                <td className="py-4 px-6 text-gray-600">{u.phone || '-'}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 bg-blue-50 rounded hover:bg-blue-100">
                      <Edit size={18} />
                    </button>
                    {u.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleToggleLock(u.id, u.status)} 
                        className={`${u.status === 'ACTIVE' ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'} transition-colors p-1 rounded`}
                        title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {u.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {currentUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-gray-50/30">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Tên đăng nhập) <span className="text-red-500">*</span></label>
                <input 
                  type="email" required disabled={!!currentUser}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {currentUser && '(Chỉ nhập khi cần đổi)'} {!currentUser && <span className="text-red-500">*</span>}</label>
                <input 
                  type="password" required={!currentUser}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  placeholder="********"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  disabled={currentUser?.role === 'ADMIN'} // Prevent demoting the main admin easily in this basic view
                >
                  <option value="STAFF">Nhân viên (STAFF)</option>
                  <option value="ADMIN">Quản lý (ADMIN)</option>
                </select>
                {currentUser?.role === 'ADMIN' && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><ShieldAlert size={12}/> Không thể đổi quyền Admin</p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={closeModal}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" disabled={loading}
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

export default UserPage;
