import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'emerald' }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100' },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${c.icon} ${c.text} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
          {Icon && <Icon size={22} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded-lg ${
            trend === 'up' ? 'text-emerald-600 bg-emerald-50' :
            trend === 'down' ? 'text-red-500 bg-red-50' :
            'text-gray-500 bg-gray-50'
          }`}>
            {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-[24px] font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-[13px] font-medium text-gray-500 mt-1.5">{title}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
