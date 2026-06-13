import { useState, useEffect } from 'react';
import inventoryApi from '../api/inventoryApi';
import productApi from '../api/productApi';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, X, Package, ArrowDownToLine, FileText } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const InventoryPage = () => {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ product_id: '', quantity: 1, note: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchProducts();
  }, []);

  const fetchHistory = async () => {
    try {
      // Create an API call in inventoryApi for getHistory if not exists, 
      // Assuming GET /api/inventory/history exists (we created report/inventory, let's just fetch products for now, or fake history if missing)
      // Wait, we didn't create a GET history endpoint in the backend. I will use the products list as the main view.
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.importStock({
        product_id: formData.product_id,
        quantity: Number(formData.quantity),
        note: formData.note
      });
      alert('Nhập kho thành công!');
      await fetchProducts();
      setIsModalOpen(false);
      setFormData({ product_id: '', quantity: 1, note: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Kho hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Kiểm soát tồn kho và nhập hàng hóa</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <ArrowDownToLine size={20} />
            Nhập kho
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Package className="text-emerald-600"/> Tổng quan kho</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Tổng mã sản phẩm:</span>
                <span className="font-bold text-xl">{products.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Tổng số lượng tồn:</span>
                <span className="font-bold text-xl text-blue-600">
                  {products.reduce((sum, p) => sum + p.stock_quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-600">Sắp hết hàng ({'<='} 10):</span>
                <span className="font-bold text-xl text-red-600">
                  {products.filter(p => p.stock_quantity <= 10).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Trạng thái tồn kho hiện tại</h3>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-gray-50 shadow-sm">
                <tr className="text-sm text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-6 font-medium">Mã SP</th>
                  <th className="py-3 px-6 font-medium">Sản phẩm</th>
                  <th className="py-3 px-6 font-medium text-right">Giá vốn</th>
                  <th className="py-3 px-6 font-medium text-right">Tồn kho</th>
                  <th className="py-3 px-6 font-medium text-center">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="py-3 px-6 text-sm text-gray-500">{p.product_code}</td>
                    <td className="py-3 px-6 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 px-6 text-right text-gray-600">{formatCurrency(p.base_price)}</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-600">{p.stock_quantity} <span className="text-xs font-normal text-gray-500">{p.unit}</span></td>
                    <td className="py-3 px-6 text-center">
                      {p.stock_quantity <= 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Hết hàng</span>
                      ) : p.stock_quantity <= 10 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Sắp hết</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Ổn định</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ArrowDownToLine size={24} className="text-emerald-600" />
                Phiếu nhập kho
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-gray-50/30">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn sản phẩm <span className="text-red-500">*</span></label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                  value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>[{p.product_code}] {p.name} - Tồn: {p.stock_quantity}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập thêm <span className="text-red-500">*</span></label>
                <input 
                  type="number" required min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white font-bold text-emerald-600 text-lg"
                  value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Nguồn nhập</label>
                <textarea 
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white resize-none"
                  placeholder="Nhập từ nhà cung cấp ABC..."
                  value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70 shadow-sm"
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận nhập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
