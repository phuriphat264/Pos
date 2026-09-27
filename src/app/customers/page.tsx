'use client';
import { useState } from 'react';
import { useStore, CustomerTransaction } from '@/store/useStore';
import { Search, Plus, BookUser, Banknote, History, WalletCards, Edit2, Trash2, FileText, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const { customers, customerTransactions, payDebt, addCustomer, editCustomer, deleteCustomer, addManualDebt } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{id: string, name: string, debt: number} | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');

  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
  const [addDebtAmount, setAddDebtAmount] = useState('');
  const [addDebtNote, setAddDebtNote] = useState('');

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

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && editCustomerName.trim()) {
      editCustomer(selectedCustomer.id, editCustomerName.trim());
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('คุณต้องการลบลูกค้ารายนี้ใช่หรือไม่? ประวัติการเซ็นทั้งหมดจะถูกลบด้วย')) {
      deleteCustomer(id);
    }
  };

  const handleAddManualDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && Number(addDebtAmount) > 0) {
      addManualDebt(selectedCustomer.id, Number(addDebtAmount), addDebtNote || 'เซ็นเพิ่ม (ใส่ยอดเอง)');
      setAddDebtAmount('');
      setAddDebtNote('');
      setIsAddDebtModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  const getCustomerHistory = (id: string) => {
    return customerTransactions
      .filter(tx => tx.customerId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="p-4 pl-6 w-32">รหัสลูกค้า</th>
                <th className="p-4 w-1/4">ชื่อลูกค้า</th>
                <th className="p-4 text-right w-1/4">ยอดหนี้ค้างชำระ</th>
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
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsHistoryModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger"
                          title="ดูประวัติการเซ็น"
                        >
                          <History className="w-5 h-5" />
                        </button>
                        
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setAddDebtAmount('');
                            setAddDebtNote('');
                            setIsAddDebtModalOpen(true);
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="เพิ่มยอดหนี้ (เซ็นเพิ่ม)"
                        >
                          <Plus className="w-5 h-5" />
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setPayAmount(customer.debt.toString());
                            setIsPayModalOpen(true);
                          }}
                          disabled={customer.debt === 0}
                          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-100 rounded-lg font-bold transition-colors inline-flex items-center space-x-1"
                        >
                          <Banknote className="w-4 h-4" />
                          <span>ชำระเงิน</span>
                        </button>

                        <div className="w-px h-6 bg-slate-200 mx-2"></div>

                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setEditCustomerName(customer.name);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="แก้ไขชื่อ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบลูกค้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleEditCustomer} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Edit2 className="w-6 h-6 mr-2 text-slate-600" />
              แก้ไขข้อมูลลูกค้า
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ-นามสกุล / ชื่อร้าน</label>
                <input 
                  type="text" 
                  required
                  value={editCustomerName}
                  onChange={e => setEditCustomerName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCustomer(null);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Manual Debt Modal */}
      {isAddDebtModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleAddManualDebt} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-rose-600" />
              เซ็นเพิ่ม (ใส่ยอดเอง)
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
              <div className="text-sm text-slate-500 mb-1">ชื่อลูกค้า</div>
              <div className="font-bold text-lg text-slate-800 mb-3">{selectedCustomer.name}</div>
              <div className="text-sm text-slate-500 mb-1">ยอดหนี้ค้างชำระเดิม</div>
              <div className="font-bold text-xl text-rose-600">฿{selectedCustomer.debt.toLocaleString()}</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ยอดเงินที่เซ็นเพิ่ม (บาท)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={addDebtAmount}
                  onChange={e => setAddDebtAmount(e.target.value)}
                  className="w-full p-4 text-2xl font-black text-right text-rose-700 border border-slate-300 rounded-xl focus:border-rose-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">หมายเหตุ (ตัวเลือก)</label>
                <input 
                  type="text" 
                  value={addDebtNote}
                  onChange={e => setAddDebtNote(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-rose-500 focus:outline-none"
                  placeholder="เช่น ค่าน้ำแข็ง, ค่าของชำ ฯลฯ"
                />
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button 
                type="button" 
                onClick={() => {
                  setIsAddDebtModalOpen(false);
                  setSelectedCustomer(null);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
              >
                บันทึกยอดหนี้
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
                onClick={() => {
                  setIsPayModalOpen(false);
                  setSelectedCustomer(null);
                }}
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

      {/* History Modal */}
      {isHistoryModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <History className="w-5 h-5 mr-2 text-blue-600" />
                  ประวัติการเซ็น: {selectedCustomer.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  ยอดคงค้างปัจจุบัน: <strong className="text-rose-600">฿{selectedCustomer.debt.toLocaleString()}</strong>
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setSelectedCustomer(null);
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {getCustomerHistory(selectedCustomer.id).length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    ยังไม่มีประวัติ
                  </div>
                ) : (
                  getCustomerHistory(selectedCustomer.id).map(tx => (
                    <div key={tx.id} className="flex items-start p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <div className={cn(
                        "p-3 rounded-xl mr-4",
                        tx.type === 'pay_debt' ? "bg-emerald-100 text-emerald-600" :
                        tx.type === 'void_credit' ? "bg-slate-100 text-slate-500" :
                        "bg-rose-100 text-rose-600"
                      )}>
                        {tx.type === 'pay_debt' ? <ArrowDownToLine className="w-5 h-5" /> :
                         tx.type === 'void_credit' ? <History className="w-5 h-5" /> :
                         <ArrowUpFromLine className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-800">
                              {tx.type === 'pay_debt' ? 'ชำระหนี้' :
                               tx.type === 'sale_credit' ? 'ซื้อเชื่อ (ขายหน้าร้าน)' :
                               tx.type === 'add_debt' ? 'เพิ่มยอดหนี้ (เซ็นเพิ่ม)' :
                               'ยกเลิกบิล'}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">{tx.note}</div>
                          </div>
                          <div className={cn(
                            "font-black text-lg",
                            tx.type === 'pay_debt' || tx.type === 'void_credit' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {tx.type === 'pay_debt' || tx.type === 'void_credit' ? '-' : '+'}฿{tx.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                          {new Date(tx.date).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
