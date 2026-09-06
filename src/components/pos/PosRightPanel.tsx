'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Trash2, Banknote, QrCode, BookUser, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

export function PosRightPanel() {
  const { cart, removeFromCart, updateCartQty, clearCart, getCartTotal, checkout, customers, addCustomer } = useStore();
  const [paymentMode, setPaymentMode] = useState<'none' | 'cash' | 'promptpay' | 'credit'>('none');
  const [cashReceived, setCashReceived] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');

  const total = getCartTotal();

  const handleCashPayment = () => {
    if (Number(cashReceived) >= total) {
      checkout('cash');
      setPaymentMode('none');
      setCashReceived('');
    } else {
      alert('รับเงินมาไม่พอ!');
    }
  };

  const handleCreditPayment = () => {
    let customerId = selectedCustomer;
    if (isNewCustomer) {
      if (!newCustomerName.trim()) {
        alert('กรุณากรอกชื่อลูกค้าใหม่');
        return;
      }
      customerId = addCustomer(newCustomerName.trim());
    } else if (!customerId) {
      alert('กรุณาเลือกลูกค้า');
      return;
    }
    checkout('credit', customerId);
    setPaymentMode('none');
    setSelectedCustomer('');
    setIsNewCustomer(false);
    setNewCustomerName('');
  };

  const handlePromptPayPayment = () => {
    checkout('promptpay');
    setPaymentMode('none');
  };

  const promptpayPayload = paymentMode === 'promptpay' ? generatePayload('0812345678', { amount: total }) : '';

  return (
    <div className="h-full flex flex-col relative bg-white border-l border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center z-10 bg-white">
        <div className="flex items-center space-x-3 text-2xl font-extrabold text-slate-800">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span>ตะกร้าสินค้า</span>
          <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">{cart.length}</span>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all font-semibold flex items-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>ล้างบิล</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
            <ShoppingCart className="w-24 h-24 opacity-20 mb-4" />
            <p className="text-xl font-semibold text-slate-400">ยังไม่มีสินค้าในตะกร้า</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={item.id || index} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all animate-in slide-in-from-right-4 duration-300">
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                  <div className="text-slate-500 font-medium mt-2 flex items-center space-x-3">
                    <span className="text-lg">฿{item.price} <span className="mx-1 text-slate-300">x</span></span>
                    <button 
                      onClick={() => updateCartQty(item.id, item.qty - 1)} 
                      disabled={item.qty <= 1} 
                      className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-100 active:scale-95 text-2xl font-bold transition-all"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-xl text-slate-800">{item.qty}</span>
                    <button 
                      onClick={() => updateCartQty(item.id, item.qty + 1)} 
                      className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 text-2xl font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-blue-600 w-28 text-right">
                  ฿{item.price * item.qty}
                </div>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="ml-4 p-3 text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 shadow-sm md:shadow-none"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-6 z-20">
        <div className="flex justify-between items-end mb-6">
          <div className="text-slate-500 font-bold text-xl tracking-wider">ยอดรวมทั้งสิ้น</div>
          <div className="text-6xl font-black text-slate-800 tracking-tighter">฿{total.toLocaleString()}</div>
        </div>

        {paymentMode === 'none' ? (
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={cart.length === 0}
              onClick={() => setPaymentMode('cash')}
              className="col-span-2 h-[80px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-2xl font-bold text-2xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-colors shadow-sm"
            >
              <Banknote className="w-8 h-8" />
              <span>รับเงินสด</span>
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => setPaymentMode('promptpay')}
              className="h-[64px] bg-slate-100 hover:bg-blue-600 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 rounded-xl font-bold text-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all border border-slate-200 hover:border-transparent"
            >
              <QrCode className="w-6 h-6" />
              <span>โอนเงิน</span>
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => setPaymentMode('credit')}
              className="h-[64px] bg-slate-100 hover:bg-slate-800 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 rounded-xl font-bold text-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all border border-slate-200 hover:border-transparent"
            >
              <BookUser className="w-6 h-6" />
              <span>แปะโป้ง</span>
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-2xl flex items-center space-x-3 text-slate-800">
                {paymentMode === 'cash' && <><Banknote className="w-8 h-8 text-emerald-600"/><span>รับเงินสด</span></>}
                {paymentMode === 'promptpay' && <><QrCode className="w-8 h-8 text-blue-600"/><span>สแกนจ่าย PromptPay</span></>}
                {paymentMode === 'credit' && <><BookUser className="w-8 h-8 text-slate-700"/><span>แปะโป้งลงบัญชี</span></>}
              </h3>
              <button onClick={() => setPaymentMode('none')} className="bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 p-2.5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {paymentMode === 'cash' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => setCashReceived(amt.toString())}
                      className="py-3 bg-white text-slate-700 font-bold rounded-lg border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
                    >
                      +{amt}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCashReceived(total.toString())}
                    className="py-3 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 hover:border-blue-400 active:bg-blue-100 transition-colors"
                  >
                    พอดี
                  </button>
                </div>
                <input 
                  type="number"
                  placeholder="จำนวนเงินที่รับมา"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full p-4 text-3xl font-black text-right bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300"
                  autoFocus
                />
                {Number(cashReceived) >= total && (
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200 animate-in zoom-in-95">
                    <span className="font-extrabold text-lg">เงินทอน</span>
                    <span className="font-black text-3xl">฿{(Number(cashReceived) - total).toLocaleString()}</span>
                  </div>
                )}
                <button 
                  onClick={handleCashPayment}
                  disabled={Number(cashReceived) < total}
                  className="w-full py-4 bg-emerald-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-bold text-2xl active:scale-[0.98] transition-colors flex items-center justify-center space-x-2"
                >
                  <span>จบการขาย</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}

            {paymentMode === 'promptpay' && (
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <QRCodeSVG value={promptpayPayload} size={240} />
                </div>
                <div className="text-3xl font-black text-blue-700">ยอดชำระ: ฿{total.toLocaleString()}</div>
                <button 
                  onClick={handlePromptPayPayment}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl active:scale-[0.98] transition-colors"
                >
                  ตรวจสอบยอดแล้ว จบการขาย
                </button>
              </div>
            )}

            {paymentMode === 'credit' && (
              <div className="space-y-5">
                {!isNewCustomer ? (
                  <select 
                    value={selectedCustomer} 
                    onChange={(e) => {
                      if (e.target.value === 'NEW') setIsNewCustomer(true);
                      else setSelectedCustomer(e.target.value);
                    }}
                    className="w-full p-4 text-lg font-medium bg-white border border-slate-300 rounded-lg focus:border-slate-500 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- เลือกลูกค้าขาประจำ --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (ค้างเดิม: ฿{c.debt.toLocaleString()})</option>
                    ))}
                    <option value="NEW" className="text-slate-800 font-bold">+ เพิ่มลูกค้าใหม่</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="กรอกชื่อลูกค้าใหม่..."
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full p-4 text-lg font-medium bg-white border border-slate-300 rounded-lg focus:border-slate-500 focus:outline-none transition-all"
                      autoFocus
                    />
                    <button 
                      onClick={() => setIsNewCustomer(false)}
                      className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors border border-slate-200"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={handleCreditPayment}
                  disabled={!isNewCustomer && !selectedCustomer}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-bold text-xl active:scale-[0.98] transition-colors"
                >
                  ลงบัญชี และจบการขาย
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
