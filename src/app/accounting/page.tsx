'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'partners'>('expenses');
  const { 
    expenses, addExpense, deleteExpense, 
    partners, addPartner, addPartnerTransaction, deletePartnerTransaction, partnerTransactions
  } = useStore();

  // Expense form state
  const [expCategory, setExpCategory] = useState<'restock'|'bill'|'other'>('restock');
  const [expAmount, setExpAmount] = useState('');
  const [expNote, setExpNote] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('cash_drawer');

  // Partner form state
  const [newPartnerName, setNewPartnerName] = useState('');
  const [partnerAmount, setPartnerAmount] = useState('');
  const [partnerNote, setPartnerNote] = useState('');
  const [partnerType, setPartnerType] = useState<'invest'|'withdraw'>('invest');
  const [selectedPartner, setSelectedPartner] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || isNaN(Number(expAmount))) return;
    addExpense(expCategory, Number(expAmount), expNote, expPaidBy);
    setExpAmount('');
    setExpNote('');
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;
    addPartner(newPartnerName);
    setNewPartnerName('');
  };

  const handleAddPartnerTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !partnerAmount || isNaN(Number(partnerAmount))) return;
    addPartnerTransaction(selectedPartner, partnerType, Number(partnerAmount), partnerNote);
    setPartnerAmount('');
    setPartnerNote('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">จัดการต้นทุน & เงินทุน</h1>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-3 rounded-lg font-bold text-lg transition-colors ${activeTab === 'expenses' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          รายจ่าย / ซื้อของ
        </button>
        <button 
          onClick={() => setActiveTab('partners')}
          className={`flex-1 py-3 rounded-lg font-bold text-lg transition-colors ${activeTab === 'partners' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          หุ้นส่วน / เงินทุน
        </button>
      </div>

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">บันทึกรายจ่ายใหม่</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                  <select 
                    value={expCategory} 
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="restock">สั่งของเข้าร้าน (สต็อก)</option>
                    <option value="bill">จ่ายบิล (ค่าไฟ, ค่าน้ำ, ค่าเช่า)</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงิน</label>
                  <input 
                    type="number" 
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                  <input 
                    type="text" 
                    value={expNote}
                    onChange={e => setExpNote(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น ซื้อน้ำแข็ง 2 กระสอบ"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">จ่ายโดย</label>
                  <select 
                    value={expPaidBy} 
                    onChange={e => setExpPaidBy(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash_drawer">ลิ้นชักหน้าร้าน (เงินสดร้าน)</option>
                    {(partners || []).map(p => (
                      <option key={p.id} value={p.id}>หุ้นส่วน: {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
                บันทึกรายจ่าย
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">ประวัติรายจ่าย</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3">วันที่</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">รายละเอียด</th>
                    <th className="p-3">จ่ายโดย</th>
                    <th className="p-3 text-right">จำนวนเงิน</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {(expenses || []).slice().reverse().map(exp => (
                    <tr key={exp.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">{new Date(exp.date).toLocaleString('th-TH')}</td>
                      <td className="p-3">
                        {exp.category === 'restock' ? 'สต็อกสินค้า' : exp.category === 'bill' ? 'บิลค่าใช้จ่าย' : 'อื่นๆ'}
                      </td>
                      <td className="p-3">{exp.note}</td>
                      <td className="p-3">
                        {exp.paidBy === 'cash_drawer' ? 'ลิ้นชัก' : (partners.find(p => p.id === exp.paidBy)?.name || 'ไม่ทราบ')}
                      </td>
                      <td className="p-3 text-right font-medium text-red-500">
                        -{exp.amount.toLocaleString()} ฿
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => deleteExpense(exp.id)} className="text-red-500 hover:text-red-700">ลบ</button>
                      </td>
                    </tr>
                  ))}
                  {(expenses || []).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">ไม่มีข้อมูลรายจ่าย</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4">เพิ่มหุ้นส่วนใหม่</h2>
              <form onSubmit={handleAddPartner} className="flex gap-2">
                <input 
                  type="text" 
                  value={newPartnerName}
                  onChange={e => setNewPartnerName(e.target.value)}
                  placeholder="ชื่อหุ้นส่วน (เช่น คุณแม่)"
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg font-bold">เพิ่ม</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4">สถานะเงินทุน</h2>
              <div className="space-y-3">
                {(partners || []).map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-lg">{p.name}</span>
                    <span className={`font-bold text-xl ${p.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {p.balance.toLocaleString()} ฿
                    </span>
                  </div>
                ))}
                {(partners || []).length === 0 && (
                  <div className="text-slate-500">ยังไม่มีหุ้นส่วนในระบบ</div>
                )}
              </div>
            </div>
          </div>

          {(partners || []).length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4">บันทึกเงินทุน เข้า-ออก</h2>
              <form onSubmit={handleAddPartnerTx} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เลือกหุ้นส่วน</label>
                    <select 
                      value={selectedPartner} 
                      onChange={e => setSelectedPartner(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- เลือก --</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
                    <select 
                      value={partnerType} 
                      onChange={e => setPartnerType(e.target.value as any)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="invest">นำเงินเข้าร้าน (เพิ่มทุน)</option>
                      <option value="withdraw">ถอนเงินทุน (คืนทุน)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงิน</label>
                    <input 
                      type="number" 
                      value={partnerAmount}
                      onChange={e => setPartnerAmount(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                    <input 
                      type="text" 
                      value={partnerNote}
                      onChange={e => setPartnerNote(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น แม่ให้เป็นทุนรอบแรก"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
                  บันทึกรายการ
                </button>
              </form>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">ประวัติเงินทุน</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3">วันที่</th>
                    <th className="p-3">หุ้นส่วน</th>
                    <th className="p-3">รายละเอียด</th>
                    <th className="p-3 text-right">จำนวนเงิน</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {(partnerTransactions || []).slice().reverse().map(ptx => {
                    const partner = partners.find(p => p.id === ptx.partnerId);
                    return (
                      <tr key={ptx.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">{new Date(ptx.date).toLocaleString('th-TH')}</td>
                        <td className="p-3 font-medium">{partner?.name || 'ไม่ทราบ'}</td>
                        <td className="p-3 text-sm text-slate-600">
                          {ptx.note}
                          {ptx.expenseId && <span className="ml-2 text-xs bg-slate-200 px-2 py-1 rounded">จากรายจ่าย</span>}
                        </td>
                        <td className={`p-3 text-right font-bold ${ptx.type === 'invest' ? 'text-green-600' : 'text-red-500'}`}>
                          {ptx.type === 'invest' ? '+' : '-'}{ptx.amount.toLocaleString()} ฿
                        </td>
                        <td className="p-3 text-center">
                          {!ptx.expenseId && (
                            <button onClick={() => deletePartnerTransaction(ptx.id)} className="text-red-500 hover:text-red-700">ลบ</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(partnerTransactions || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">ไม่มีข้อมูลรายการ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
