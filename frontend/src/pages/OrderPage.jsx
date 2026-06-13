import { useState, useEffect } from 'react';
import orderApi from '../api/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/ui/StatusBadge';
import StatCard from '../components/ui/StatCard';
import { 
  ClipboardList, Clock, CheckCircle2, XCircle, 
  Search, Filter, X, Printer, Eye, ChevronDown, 
  User, Phone, Calendar, CreditCard, Package,
  FileText, MapPin
} from 'lucide-react';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = async (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
    try {
      const detail = await orderApi.getOrderById(order.id);
      setOrderDetails(detail);
    } catch (err) {
      console.error(err);
      setOrderDetails(null);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = !searchQuery || 
      o.order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'TEMPORARY').length,
    paid: orders.filter(o => o.order_status === 'PAID').length,
    cancelled: orders.filter(o => o.order_status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Tổng đơn hàng" value={stats.total} icon={ClipboardList} color="emerald" />
        <StatCard title="Đang xử lý" value={stats.pending} icon={Clock} color="amber" />
        <StatCard title="Hoàn thành" value={stats.paid} icon={CheckCircle2} color="blue" />
        <StatCard title="Đã hủy" value={stats.cancelled} icon={XCircle} color="red" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn hàng, tên khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[160px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="TEMPORARY">Tạm tính</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã đơn hàng</th>
                <th className="py-3.5 px-5">Khách hàng</th>
                <th className="py-3.5 px-5">Thành tiền</th>
                <th className="py-3.5 px-5">Thanh toán</th>
                <th className="py-3.5 px-5">Trạng thái</th>
                <th className="py-3.5 px-5">Thời gian</th>
                <th className="py-3.5 px-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan="7" className="py-4 px-5"><div className="skeleton h-5 w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ClipboardList size={24} className="text-gray-300" />
                    </div>
                    <p className="text-[14px] font-semibold text-gray-800 mb-1">Không tìm thấy đơn hàng</p>
                    <p className="text-[12px] text-gray-400">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => openDrawer(o)}>
                    <td className="py-3.5 px-5 font-bold text-emerald-600">{o.order_code}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[11px] font-bold flex-shrink-0">
                          {(o.customer_name || 'KL').charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{o.customer_name || 'Khách lẻ'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-gray-900">{formatCurrency(o.final_amount)}</td>
                    <td className="py-3.5 px-5"><StatusBadge status={o.payment_method} /></td>
                    <td className="py-3.5 px-5"><StatusBadge status={o.order_status} /></td>
                    <td className="py-3.5 px-5 text-gray-500">{formatDate(o.created_at)}</td>
                    <td className="py-3.5 px-5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDrawer(o); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrawer}></div>
          <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 drawer-enter overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-[13px] text-emerald-600 font-semibold mt-0.5">{selectedOrder?.order_code}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                  <Printer size={18} />
                </button>
                <button onClick={closeDrawer} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedOrder?.order_status} size="md" />
                <StatusBadge status={selectedOrder?.payment_method} size="md" />
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Thông tin khách hàng</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[14px]">
                    {(selectedOrder?.customer_name || 'KL').charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900">{selectedOrder?.customer_name || 'Khách lẻ'}</p>
                    <p className="text-[12px] text-gray-400">{selectedOrder?.customer_phone || 'Không có SĐT'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Sản phẩm đã mua</h4>
                <div className="space-y-2.5">
                  {(orderDetails?.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                          <Package size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800">{item.product_name}</p>
                          <p className="text-[11px] text-gray-400">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-bold text-gray-900">{formatCurrency(item.total_price)}</p>
                    </div>
                  ))}
                  {(!orderDetails?.items || orderDetails.items.length === 0) && (
                    <div className="skeleton h-16 w-full"></div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium text-gray-700">{formatCurrency(selectedOrder?.total_amount)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Giảm giá</span>
                  <span className="font-medium text-red-500">-{formatCurrency(selectedOrder?.discount_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-bold border-t border-gray-100 pt-3 mt-3">
                  <span className="text-gray-900">Tổng thanh toán</span>
                  <span className="text-emerald-600">{formatCurrency(selectedOrder?.final_amount)}</span>
                </div>
              </div>

              {/* Note */}
              {selectedOrder?.note && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="text-[12px] font-bold text-amber-600 mb-1">Ghi chú</h4>
                  <p className="text-[13px] text-gray-700">{selectedOrder.note}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Thời gian</h4>
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Tạo lúc: {formatDate(selectedOrder?.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                  <User size={14} className="text-gray-400" />
                  <span>Nhân viên: {selectedOrder?.user_name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderPage;
