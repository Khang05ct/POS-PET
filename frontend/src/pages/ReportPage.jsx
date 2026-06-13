import { useState, useEffect } from 'react';
import reportApi from '../api/reportApi';
import { formatCurrency } from '../utils/formatCurrency';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, 
  Calendar, Download, Filter, BarChart3, ArrowUpRight
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportPage = () => {
  const [period, setPeriod] = useState('7d');
  const [metrics, setMetrics] = useState(null);
  const [bestSelling, setBestSelling] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsData, bestSellingData, paymentData] = await Promise.all([
        reportApi.getDashboard(),
        reportApi.getBestSelling(),
        reportApi.getPaymentMethods()
      ]);
      setMetrics(metricsData);
      setBestSelling(bestSellingData);
      setPaymentMethods(paymentData);
    } catch (error) {
      console.error('Error fetching report data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  if (loading && !metrics) {
    return (
      <div className="space-y-6 animate-fadeInUp">
        <div className="skeleton h-10 w-64"></div>
        <div className="grid grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28"></div>)}
        </div>
        <div className="skeleton h-80"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-sm text-gray-500 mt-1">Phân tích hiệu suất kinh doanh chi tiết</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { label: '7 ngày', value: '7d' },
              { label: '30 ngày', value: '30d' },
              { label: '90 ngày', value: '90d' },
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  period === p.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Doanh thu thuần" 
          value={metrics ? formatCurrency(metrics.today_revenue) : '0đ'} 
          icon={DollarSign} 
          color="emerald" 
          trend="up" 
          trendValue="+12.5%" 
        />
        <StatCard 
          title="Đơn hàng" 
          value={metrics ? `${metrics.today_orders}` : '0'} 
          icon={ShoppingBag} 
          color="blue" 
          trend="up" 
          trendValue="+8.2%" 
        />
        <StatCard 
          title="Tổng khách hàng" 
          value={metrics ? `${metrics.total_customers}` : '0'} 
          icon={Users} 
          color="purple" 
          trend="up" 
          trendValue="+3.1%" 
        />
        <StatCard 
          title="Giá trị tồn kho" 
          value={metrics ? formatCurrency(metrics.inventory_value) : '0đ'} 
          icon={TrendingUp} 
          color="amber" 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-gray-900">Biểu đồ doanh thu</h2>
            <div className="flex items-center gap-2 text-emerald-600 text-[12px] font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
              <ArrowUpRight size={14} />
              Tăng trưởng tốt
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.revenue_trend || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-5">Phương thức thanh toán</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4}
                  dataKey="total_amount" nameKey="payment_method"
                >
                  {paymentMethods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-2">
            {paymentMethods.map((pm, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                  <span className="text-gray-600 font-medium">{pm.payment_method}</span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(pm.total_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-5">Top sản phẩm bán chạy</h2>
          <div className="space-y-3">
            {bestSelling.slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold ${
                  i < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{item.product_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-gray-900">{item.total_sold} sp</p>
                  <p className="text-[11px] text-gray-400">{formatCurrency(item.total_revenue || 0)}</p>
                </div>
              </div>
            ))}
            {bestSelling.length === 0 && (
              <p className="text-center text-[13px] text-gray-400 py-8">Chưa có dữ liệu bán hàng</p>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-gray-900">Cảnh báo tồn kho thấp</h2>
            {metrics?.low_stock_products?.length > 0 && (
              <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[12px] font-bold">
                {metrics.low_stock_products.length} cảnh báo
              </span>
            )}
          </div>
          <div className="space-y-3">
            {(metrics?.low_stock_products || []).slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50/40 border border-red-100/50 rounded-xl">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{p.name}</p>
                  <p className="text-[11px] text-gray-400">Mã: {p.product_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-bold text-red-600">{p.stock_quantity}</p>
                  <p className="text-[10px] text-gray-400 uppercase">Tồn kho</p>
                </div>
              </div>
            ))}
            {(!metrics?.low_stock_products || metrics.low_stock_products.length === 0) && (
              <div className="text-center py-8 bg-emerald-50/50 rounded-xl">
                <p className="text-[13px] text-emerald-600 font-medium">✅ Tất cả sản phẩm đủ hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
