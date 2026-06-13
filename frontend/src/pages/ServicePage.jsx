import { useState, useEffect } from 'react';
import { Scissors, Clock, Star, DollarSign, Plus, Search, MoreVertical } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';

const ServicePage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: fetch from API /api/services
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý dịch vụ chăm sóc thú cưng</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={18} />
          Thêm dịch vụ
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Tổng dịch vụ" value="0" icon={Scissors} color="emerald" />
        <StatCard title="Dịch vụ phổ biến" value="—" icon={Star} color="amber" />
        <StatCard title="Gói dịch vụ" value="0" icon={Clock} color="blue" />
        <StatCard title="Doanh thu tháng" value="0đ" icon={DollarSign} color="purple" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-800 mb-1">Chưa có dịch vụ nào</h3>
          <p className="text-[13px] text-gray-400 mb-5">Bắt đầu thêm dịch vụ chăm sóc thú cưng để quản lý</p>
          <button className="text-emerald-600 font-semibold text-[13px] hover:underline">
            + Thêm dịch vụ đầu tiên
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
