import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import productApi from '../api/productApi';
import customerApi from '../api/customerApi';
import orderApi from '../api/orderApi';
import settingApi from '../api/settingApi';
import { formatCurrency } from '../utils/formatCurrency';
import { Search, Plus, Minus, Trash2, Printer, CreditCard, ScanLine, UserPlus, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { formatDate } from '../utils/formatDate';

const POSPage = () => {
  const socket = useSocket();
  const [products, setProducts] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  const [storeSettings, setStoreSettings] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [printType, setPrintType] = useState('FINAL'); // TEMPORARY or FINAL

  const printRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    
    if (socket) {
      socket.on('product:update', fetchProducts);
      socket.on('inventory:update', fetchProducts);
    }

    return () => {
      if (socket) {
        socket.off('product:update');
        socket.off('inventory:update');
      }
    };
  }, [socket]);

  const fetchProducts = async () => {
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await settingApi.getSettings();
      setStoreSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchCustomerTimeout = useRef(null);
  const handleCustomerSearch = (e) => {
    const val = e.target.value;
    setCustomerSearch(val);
    
    if (searchCustomerTimeout.current) clearTimeout(searchCustomerTimeout.current);
    
    if (val.length >= 2) {
      searchCustomerTimeout.current = setTimeout(async () => {
        try {
          const data = await customerApi.searchCustomers(val);
          setCustomers(data);
        } catch (err) {
          console.error(err);
        }
      }, 500);
    } else {
      setCustomers([]);
    }
  };

  // Cart Functions
  const addToCart = (product) => {
    if (product.status !== 'ACTIVE') return alert('Sản phẩm không có sẵn');
    if (product.stock_quantity <= 0) return alert('Sản phẩm đã hết hàng');

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert('Không đủ số lượng trong kho');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock_quantity) {
          alert('Không đủ số lượng trong kho');
          return item;
        }
        if (newQ <= 0) return null;
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const finalAmount = totalAmount - discount;
  const changeAmount = receivedAmount - finalAmount;

  const handleCheckout = async () => {
    if (storeSettings?.store_status !== 'OPEN') {
      return alert('Cửa hàng đang đóng cửa hoặc tạm ngưng. Không thể thanh toán.');
    }

    if (paymentMethod === 'CASH' && receivedAmount < finalAmount) {
      return alert('Số tiền khách đưa không đủ');
    }

    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        items: cart,
        total_amount: totalAmount,
        discount_amount: discount,
        final_amount: finalAmount,
        payment_method: paymentMethod,
        received_amount: paymentMethod === 'CASH' ? receivedAmount : finalAmount,
        note: ''
      };

      const order = await orderApi.checkout(payload);
      setCompletedOrder(order);
      setPrintType('FINAL');
      
      // Reset POS state
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setDiscount(0);
      setReceivedAmount(0);
      setPaymentModalOpen(false);

      // Trigger print after a short delay to render
      setTimeout(() => handlePrint(), 500);

    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thanh toán');
    }
  };

  const handleTemporaryPrint = async () => {
    if (cart.length === 0) return alert('Giỏ hàng trống');
    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        items: cart,
        total_amount: totalAmount,
        discount_amount: discount,
        final_amount: finalAmount,
      };
      const order = await orderApi.createTemporary(payload);
      setCompletedOrder({
        ...order,
        order_status: 'TEMPORARY',
        items: cart,
        customer_name: selectedCustomer?.full_name,
        total_amount: totalAmount,
        discount_amount: discount,
        final_amount: finalAmount,
        created_at: new Date().toISOString()
      });
      setPrintType('TEMPORARY');
      setTimeout(() => handlePrint(), 500);
    } catch (err) {
      alert('Lỗi tạo hóa đơn tạm');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchKey.toLowerCase()) || 
    p.product_code.toLowerCase().includes(searchKey.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchKey))
  );

  return (
    <div className="flex h-full gap-6">
      {/* Left Column: Products */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, mã hoặc barcode..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  product.stock_quantity <= 0 ? 'opacity-50 grayscale bg-gray-50' : 'hover:border-emerald-500 bg-white'
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-gray-400" size={40} />
                  )}
                </div>
                <div className="text-sm font-medium text-gray-800 line-clamp-2 h-10">{product.name}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold text-emerald-600">{formatCurrency(product.selling_price)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${product.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Kho: {product.stock_quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Cart & Checkout */}
      <div className="w-[400px] flex-shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Customer Select */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Tìm khách hàng (SĐT, Tên)..." 
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedCustomer ? selectedCustomer.full_name : customerSearch}
              onChange={handleCustomerSearch}
              disabled={!!selectedCustomer}
            />
            {selectedCustomer && (
              <button 
                onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            )}
            
            {/* Dropdown kết quả search */}
            {customers.length > 0 && !selectedCustomer && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border shadow-lg rounded-lg max-h-48 overflow-y-auto z-10">
                {customers.map(c => (
                  <div 
                    key={c.id} 
                    className="p-2 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedCustomer(c); setCustomers([]); }}
                  >
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ScanLine size={48} />
              <p>Chưa có sản phẩm nào</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 border-b pb-3">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{item.name}</div>
                  <div className="text-emerald-600 font-medium mt-1">{formatCurrency(item.selling_price)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded text-gray-600">
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded text-gray-600">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Actions */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng tiền hàng:</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-600">Giảm giá:</span>
            <input 
              type="number" 
              className="w-24 text-right px-2 py-1 border rounded text-sm"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Khách cần trả:</span>
            <span className="text-emerald-600">{formatCurrency(finalAmount)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={handleTemporaryPrint}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Printer size={18} />
              In tạm tính
            </button>
            <button 
              onClick={() => {
                if(cart.length === 0) return alert('Giỏ hàng trống');
                setReceivedAmount(finalAmount);
                setPaymentModalOpen(true);
              }}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
            >
              <CreditCard size={18} />
              Thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Thanh toán hóa đơn</h3>
              <button onClick={() => setPaymentModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-xl font-bold bg-gray-50 p-4 rounded-lg">
                <span>Cần thanh toán:</span>
                <span className="text-emerald-600">{formatCurrency(finalAmount)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CASH', 'BANK_TRANSFER', 'QR_PAYMENT'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${
                        paymentMethod === method ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      {method === 'CASH' ? 'Tiền mặt' : method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Quét QR'}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Khách đưa:</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg text-lg font-bold"
                      value={receivedAmount}
                      onChange={e => setReceivedAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Tiền thối lại:</span>
                    <span className={`font-bold text-lg ${changeAmount < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                      {formatCurrency(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'QR_PAYMENT' && storeSettings?.bank_account && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-3 text-center">Quét mã để thanh toán</p>
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <QRCodeSVG 
                      value={`https://img.vietqr.io/image/${storeSettings.bank_name}-${storeSettings.bank_account}-compact2.png?amount=${finalAmount}&addInfo=PETCARE&accountName=${storeSettings.bank_owner}`}
                      size={200}
                    />
                  </div>
                  <p className="mt-3 font-bold text-emerald-600">{formatCurrency(finalAmount)}</p>
                </div>
              )}

              <button 
                onClick={handleCheckout}
                disabled={paymentMethod === 'CASH' && receivedAmount < finalAmount}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 mt-4 disabled:opacity-50"
              >
                Hoàn tất thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Content */}
      <div className="hidden">
        <div ref={printRef} className="p-8 w-[80mm] text-black text-sm" style={{ fontFamily: 'monospace' }}>
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">{storeSettings?.store_name}</h2>
            <p className="text-xs">{storeSettings?.address}</p>
            <p className="text-xs">ĐT: {storeSettings?.phone}</p>
            <p className="text-xs">{storeSettings?.email}</p>
          </div>
          
          <div className="text-center mb-4 border-b border-t py-2 border-dashed border-gray-400">
            <h3 className="text-lg font-bold">
              {printType === 'TEMPORARY' ? 'PHIẾU TẠM TÍNH' : 'HÓA ĐƠN THANH TOÁN'}
            </h3>
            <p className="text-xs mt-1">Mã: {completedOrder?.order_code}</p>
            <p className="text-xs">Ngày: {formatDate(completedOrder?.created_at)}</p>
            {completedOrder?.customer_name && <p className="text-xs">Khách: {completedOrder.customer_name}</p>}
          </div>

          <table className="w-full mb-4 text-xs">
            <thead>
              <tr className="border-b border-gray-400 border-dashed">
                <th className="text-left py-1">Tên</th>
                <th className="text-right py-1">SL</th>
                <th className="text-right py-1">TT</th>
              </tr>
            </thead>
            <tbody>
              {completedOrder?.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 pr-1">{item.name || item.product_name} <br/> <span className="text-[10px] text-gray-500">{formatCurrency(item.unit_price || item.selling_price)}</span></td>
                  <td className="text-right py-1 align-top">{item.quantity}</td>
                  <td className="text-right py-1 align-top">{formatCurrency((item.unit_price || item.selling_price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Tổng tiền:</span>
              <span>{formatCurrency(completedOrder?.total_amount)}</span>
            </div>
            {completedOrder?.discount_amount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(completedOrder.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm mt-2">
              <span>THANH TOÁN:</span>
              <span>{formatCurrency(completedOrder?.final_amount)}</span>
            </div>
          </div>
          
          {printType === 'FINAL' && (
            <div className="border-t border-dashed border-gray-400 pt-2 mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>PTTT:</span>
                <span>{completedOrder?.payment_method}</span>
              </div>
              {completedOrder?.payment_method === 'CASH' && completedOrder?.payments?.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Khách đưa:</span>
                    <span>{formatCurrency(completedOrder.payments[0].received_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiền thối:</span>
                    <span>{formatCurrency(completedOrder.payments[0].change_amount)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400">
            <p className="text-xs italic">{storeSettings?.invoice_footer}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default POSPage;
