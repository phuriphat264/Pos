'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Plus, BookUser, Banknote, History, WalletCards } from 'lucide-react';

export default function CustomersPage() {
  const { customers, payDebt, addCustomer } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{id: string, name: string, debt: number} | null>(null);

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName.trim()) {
      addCustomer(newCustomerName.trim());
      setNewCustomerName('');
      setIsAddModalOpen(false);
    }
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && Number(payAmount) > 0) {
      payDebt(selectedCustomer.id, Number(payAmount));
      setPayAmount('');
      setSelectedCustomer(null);
      setIsPayModalOpen(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center space-x-3">
            <BookUser className="w-8 h-8 text-blue-600" />
            <span>ระบบลูกหนี้ / สมาชิก</span>
          </h1>
          <p className="text-slate-500 mt-2">จัดการรายชื่อลูกค้าและรับชำระหนี้ (ยอดหนี้รวม: ฿{totalDebt.toLocaleString()})</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อลูกค้า..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มลูกค้าใหม่</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="p-4 pl-6">รหัสลูกค้า</th>
                <th className="p-4">ชื่อลูกค้า</th>
                <th className="p-4 text-right">ยอดหนี้ค้างชำระ</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    <BookUser className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    ไม่พบรายชื่อลูกค้า
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 text-slate-500 font-mono text-sm">{customer.id}</td>
                    <td className="p-4 font-bold text-slate-800">{customer.name}</td>
                    <td className="p-4 text-right">
                      {customer.debt > 0 ? (
                        <span className="font-extrabold text-rose-600 text-lg">฿{customer.debt.toLocaleString()}</span>
                      ) : (
                        <span className="font-medium text-slate-400">฿0</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setPayAmount(customer.debt.toString());
                          setIsPayModalOpen(true);
                        }}
                        disabled={customer.debt === 0}
                        className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-100 rounded-lg font-bold transition-colors inline-flex items-center space-x-2"
                      >
                        <Banknote className="w-4 h-4" />
                        <span>ชำระเงิน</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleAddCustomer} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              เพิ่มลูกค้าใหม่
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ-นามสกุล / ชื่อร้าน</label>
                <input 
                  type="text" 
                  required
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="เช่น พี่สมชาย ซอย 4"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pay Debt Modal */}
      {isPayModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handlePayDebt} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <WalletCards className="w-6 h-6 mr-2 text-emerald-600" />
              รับชำระหนี้
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
              <div className="text-sm text-slate-500 mb-1">ชื่อลูกค้า</div>
              <div className="font-bold text-lg text-slate-800 mb-3">{selectedCustomer.name}</div>
              
              <div className="text-sm text-slate-500 mb-1">ยอดหนี้ค้างชำระทั้งหมด</div>
              <div className="font-black text-3xl text-rose-600">฿{selectedCustomer.debt.toLocaleString()}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">จำนวนเงินที่รับชำระ (บาท)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={selectedCustomer.debt}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full p-4 text-2xl font-black text-right text-emerald-700 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button 
                type="button" 
                onClick={() => setIsPayModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                รับชำระเงิน
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
