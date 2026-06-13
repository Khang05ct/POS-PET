import { useState, useEffect } from 'react';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import { formatCurrency } from '../utils/formatCurrency';
import { Edit, Trash2, Plus, X, Image as ImageIcon, PackageSearch } from 'lucide-react';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const initialForm = {
    category_id: '',
    name: '',
    product_code: '',
    barcode: '',
    description: '',
    base_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    unit: 'Cái',
    image_url: '',
    status: 'ACTIVE'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (product = null) => {
    setCurrentProduct(product);
    if (product) {
      setFormData({
        category_id: product.category_id,
        name: product.name,
        product_code: product.product_code,
        barcode: product.barcode || '',
        description: product.description || '',
        base_price: product.base_price,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
        unit: product.unit || 'Cái',
        image_url: product.image_url || '',
        status: product.status
      });
    } else {
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentProduct) {
        await productApi.updateProduct(currentProduct.id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      await fetchProducts();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác không thể phục hồi.')) {
      try {
        await productApi.deleteProduct(id);
        await fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể xóa sản phẩm đã có lịch sử giao dịch.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý kho mặt hàng, giá bán và hình ảnh</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 font-medium w-16">Ảnh</th>
                <th className="py-4 px-6 font-medium">Sản phẩm</th>
                <th className="py-4 px-6 font-medium">Danh mục</th>
                <th className="py-4 px-6 font-medium">Giá bán</th>
                <th className="py-4 px-6 font-medium">Tồn kho</th>
                <th className="py-4 px-6 font-medium">Trạng thái</th>
                <th className="py-4 px-6 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Mã: {p.product_code}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{p.category_name}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-emerald-600">{formatCurrency(p.selling_price)}</div>
                    <div className="text-xs text-gray-400 line-through">{formatCurrency(p.base_price)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${p.stock_quantity > 10 ? 'bg-emerald-500' : p.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium text-gray-700">{p.stock_quantity}</span>
                      <span className="text-xs text-gray-500">{p.unit}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 bg-blue-50 rounded hover:bg-blue-100">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 transition-colors p-1 bg-red-50 rounded hover:bg-red-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <PackageSearch size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>Chưa có sản phẩm nào. Hãy bắt đầu thêm mới!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {currentProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    placeholder="VD: Cát vệ sinh cho mèo 5L"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm (SKU) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    placeholder="VD: SP001"
                    value={formData.product_code} onChange={e => setFormData({...formData, product_code: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch (Barcode)</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    placeholder="Nhập mã vạch để quét"
                    value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                  <select 
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    placeholder="VD: Bịch, Cái, Kg..."
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vốn (VND) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VND) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white font-bold text-emerald-600"
                    value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})}
                  />
                </div>

                {!currentProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho ban đầu <span className="text-red-500">*</span></label>
                    <input 
                      type="number" required min="0"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                      value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})}
                    />
                  </div>
                )}

                <div className={currentProduct ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngừng bán</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh (URL)</label>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border flex-shrink-0 overflow-hidden">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-gray-400" /></div>
                      )}
                    </div>
                    <input 
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white h-10 mt-3"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                  <textarea 
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white resize-none"
                    placeholder="Mô tả công dụng, cách dùng..."
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
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

export default ProductPage;
