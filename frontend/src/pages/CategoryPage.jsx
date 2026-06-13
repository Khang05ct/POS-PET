import { useState, useEffect } from 'react';
import categoryApi from '../api/categoryApi';
import { Edit, Trash2, Plus, X } from 'lucide-react';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (category = null) => {
    setCurrentCategory(category);
    if (category) {
      setFormData({ name: category.name, description: category.description || '', status: category.status });
    } else {
      setFormData({ name: '', description: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentCategory) {
        await categoryApi.updateCategory(currentCategory.id, formData);
      } else {
        await categoryApi.createCategory(formData);
      }
      await fetchCategories();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm thuộc danh mục sẽ bị ảnh hưởng.')) {
      try {
        await categoryApi.deleteCategory(id);
        await fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh mục sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các phân loại mặt hàng trong cửa hàng</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6 font-medium">Tên danh mục</th>
              <th className="py-4 px-6 font-medium">Mô tả</th>
              <th className="py-4 px-6 font-medium">Trạng thái</th>
              <th className="py-4 px-6 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{cat.name}</td>
                <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">{cat.description || '-'}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cat.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openModal(cat)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 bg-blue-50 rounded hover:bg-blue-100">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 transition-colors p-1 bg-red-50 rounded hover:bg-red-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  Chưa có danh mục nào. Hãy tạo mới!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {currentCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-gray-50/30">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white"
                  placeholder="VD: Thức ăn cho chó"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white resize-none"
                  placeholder="Mô tả chi tiết..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Khóa</option>
                </select>
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

export default CategoryPage;
