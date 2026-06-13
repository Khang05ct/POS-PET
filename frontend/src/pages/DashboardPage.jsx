import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import reportApi from '../api/reportApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, ShoppingBag, AlertTriangle, CreditCard, Radio, Users, PackageOpen } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardPage = () => {
  const socket = useSocket();
  const [metrics, setMetrics] = useState(null);
  const [bestSelling, setBestSelling] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [metricsData, bestSellingData, paymentData] = await Promise.all([
        reportApi.getDashboard(),
        reportApi.getBestSelling(),
        reportApi.getPaymentMethods()
      ]);
      setMetrics(metricsData);
      setBestSelling(bestSellingData);
      setPaymentMethods(paymentData);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      const handleUpdate = () => {
        setIsUpdating(true);
        fetchData();
        setTimeout(() => setIsUpdating(false), 1500); // Highlight for 1.5s
      };
      
      socket.on('dashboard:update', handleUpdate);
      return () => {
        socket.off('dashboard:update', handleUpdate);
      };
    }
  }, [socket]);

  if (!metrics) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Phân tích toàn diện tình hình kinh doanh</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-medium text-emerald-700 flex items-center gap-1">
            <Radio size={14} />
            Live Realtime
          </span>
        </div>
      </div>

      {isUpdating && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Đang cập nhật dữ liệu mới...
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Doanh thu hôm nay</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.today_revenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Đơn hàng hôm nay</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.today_orders} đơn</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <PackageOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng giá trị tồn kho</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.inventory_value)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng khách hàng</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.total_customers}</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ doanh thu 7 ngày qua</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.revenue_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => formatDate(val, 'dd/MM')} 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis tickFormatter={(val) => `${val / 1000}k`} />
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label, 'dd/MM/yyyy')}
                />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Phương thức thanh toán</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  fill="#8884d8" paddingAngle={5}
                  dataKey="total_amount" nameKey="payment_method"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top 10 sản phẩm bán chạy</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSelling} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="product_name" type="category" width={120} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="total_sold" name="Đã bán" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20}/>
              Cảnh báo sắp hết hàng
            </h2>
            <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {metrics.low_stock_products.length} mã cảnh báo
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="space-y-3">
              {metrics.low_stock_products.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">Mã: {p.product_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 text-lg">{p.stock_quantity}</div>
                    <div className="text-xs text-gray-500">Tồn kho</div>
                  </div>
                </div>
              ))}
              {metrics.low_stock_products.length === 0 && (
                <div className="text-center py-10 text-emerald-600 font-medium bg-emerald-50 rounded-lg border border-emerald-100">
                  Tuyệt vời! Không có mặt hàng nào sắp hết.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng mới nhất</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-sm font-medium text-gray-500">
                <th className="py-3 px-4">Mã Hóa Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Thành Tiền</th>
                <th className="py-3 px-4">Phương Thức</th>
                <th className="py-3 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {metrics.recent_orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-emerald-600">{order.order_code}</td>
                  <td className="py-3 px-4">{order.customer_name || 'Khách lẻ'}</td>
                  <td className="py-3 px-4 font-bold">{formatCurrency(order.final_amount)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {metrics.recent_orders.length === 0 && (
            <div className="text-center py-6 text-gray-500">Chưa có đơn hàng nào hôm nay</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
