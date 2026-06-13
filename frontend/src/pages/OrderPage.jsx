import { useState, useEffect } from 'react';
import orderApi from '../api/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lịch sử hóa đơn</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500">
              <th className="py-3 px-4">Mã HĐ</th>
              <th className="py-3 px-4">Khách hàng</th>
              <th className="py-3 px-4">Tổng tiền</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Ngày tạo</th>
              <th className="py-3 px-4">Nhân viên</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-emerald-600 font-medium">{o.order_code}</td>
                <td className="py-3 px-4">{o.customer_name || 'Khách lẻ'}</td>
                <td className="py-3 px-4 font-bold">{formatCurrency(o.final_amount)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${o.order_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.order_status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{formatDate(o.created_at)}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{o.user_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderPage;
