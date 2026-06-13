const StatusBadge = ({ status, size = 'sm' }) => {
  const config = {
    // Order statuses
    TEMPORARY: { label: 'Tạm tính', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    PAID: { label: 'Đã thanh toán', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    CANCELLED: { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    REFUNDED: { label: 'Hoàn tiền', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    
    // Product statuses
    ACTIVE: { label: 'Hoạt động', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    INACTIVE: { label: 'Ngừng KD', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    OUT_OF_STOCK: { label: 'Hết hàng', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    
    // Appointment statuses
    PENDING: { label: 'Đang chờ', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    IN_PROGRESS: { label: 'Đang thực hiện', bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
    COMPLETED: { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    
    // Stock levels
    NORMAL: { label: 'Bình thường', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    LOW: { label: 'Tồn thấp', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    CRITICAL: { label: 'Nguy cấp', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    EMPTY: { label: 'Hết hàng', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },

    // Payment methods
    CASH: { label: 'Tiền mặt', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    BANK_TRANSFER: { label: 'Chuyển khoản', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    QR_PAYMENT: { label: 'QR Code', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    CARD: { label: 'Thẻ', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  };

  const s = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-[12px] px-3 py-1.5';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-full font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
};

export default StatusBadge;
