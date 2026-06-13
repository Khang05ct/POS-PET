import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import StatCard from '../components/ui/StatCard';

const AppointmentPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'week' | 'day'
  const [appointments, setAppointments] = useState([]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 - 18:00
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const getWeekDates = () => {
    const start = new Date(currentDate);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  const goToPrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goToNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý lịch hẹn dịch vụ chăm sóc thú cưng</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={18} />
          Tạo lịch hẹn
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Lịch hẹn hôm nay" value="0" icon={CalendarDays} color="emerald" />
        <StatCard title="Đang chờ" value="0" icon={Clock} color="amber" />
        <StatCard title="Hoàn thành" value="0" icon={CheckCircle2} color="blue" />
        <StatCard title="Đã hủy" value="0" icon={XCircle} color="red" />
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={goToPrevWeek} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <h3 className="text-[15px] font-bold text-gray-900">
              Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </h3>
            <button onClick={goToNextWeek} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button 
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => setView('day')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${view === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Ngày
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-3 text-center text-[11px] font-medium text-gray-400 border-r border-gray-100">GIỜ</div>
              {weekDates.map((date, i) => (
                <div key={i} className={`p-3 text-center border-r border-gray-50 ${isToday(date) ? 'bg-emerald-50' : ''}`}>
                  <p className="text-[11px] font-medium text-gray-400">{days[i]}</p>
                  <p className={`text-[18px] font-bold mt-0.5 ${isToday(date) ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[60px]">
                <div className="p-2 text-center text-[12px] text-gray-400 font-medium border-r border-gray-100 flex items-start justify-center pt-1">
                  {hour}:00
                </div>
                {weekDates.map((_, i) => (
                  <div key={i} className="border-r border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer relative"></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Empty State Overlay */}
        {appointments.length === 0 && (
          <div className="text-center py-8 border-t border-gray-100">
            <p className="text-[13px] text-gray-400">Chưa có lịch hẹn nào trong tuần này. Nhấn <strong className="text-emerald-600">Tạo lịch hẹn</strong> để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentPage;
