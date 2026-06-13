import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import settingApi from '../../api/settingApi';

const Header = () => {
  const socket = useSocket();
  const [storeStatus, setStoreStatus] = useState('OPEN');
  const [storeName, setStoreName] = useState('PetCare Store');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingApi.getSettings();
        setStoreStatus(data.store_status);
        setStoreName(data.store_name);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();

    if (socket) {
      socket.on('store-status:update', (data) => {
        setStoreStatus(data.status);
      });
      
      socket.on('inventory:low-stock', (data) => {
        // Here we could show a toast
        console.warn(`Low stock alert: ${data.product_name} (${data.stock_quantity})`);
      });
    }

    return () => {
      if (socket) {
        socket.off('store-status:update');
        socket.off('inventory:low-stock');
      }
    };
  }, [socket]);

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{storeName}</h2>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            storeStatus === 'OPEN' ? 'bg-green-100 text-green-700' :
            storeStatus === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {storeStatus === 'OPEN' ? 'ĐANG MỞ CỬA' : 
             storeStatus === 'PAUSED' ? 'TẠM NGƯNG' : 'HẾT HÀNG'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
