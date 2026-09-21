'use client';
import { useStore } from '@/store/useStore';
import { useMemo, useState } from 'react';
import { Banknote, CreditCard, Wallet, Users, Receipt, TrendingUp, X, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { sales, customers, cashTransactions, payDebt, getCashInDrawer, addCashTransaction, storeSettings } = useStore();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [actualCash, setActualCash] = useState('');

  const totalSales = useMemo(() => sales.filter(s => !s.isVoided).reduce((acc, sale) => acc + sale.total, 0), [sales]);
  const totalCost = useMemo(() => sales.filter(s => !s.isVoided).reduce((acc, sale) => {
    return acc + sale.items.reduce((itemAcc, item) => itemAcc + ((item.cost || 0) * item.qty), 0);
  }, 0), [sales]);
  const totalProfit = totalSales - totalCost;

  const cashSales = useMemo(() => sales.filter(s => s.type === 'cash' && !s.isVoided).reduce((acc, sale) => acc + sale.total, 0), [sales]);
  const promptpaySales = useMemo(() => sales.filter(s => s.type === 'promptpay' && !s.isVoided).reduce((acc, sale) => acc + sale.total, 0), [sales]);
  const creditSales = useMemo(() => sales.filter(s => s.type === 'credit' && !s.isVoided).reduce((acc, sale) => acc + sale.total, 0), [sales]);
  
  const debtors = useMemo(() => customers.filter(c => c.debt > 0), [customers]);
  const totalDebt = useMemo(() => debtors.reduce((acc, c) => acc + c.debt, 0), [debtors]);

  const expectedCashInDrawer = getCashInDrawer();

  const handleShiftClose = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = Number(actualCash);
    const diff = actual - expectedCashInDrawer;
    
    // บันทึกเงินออกเพื่อปิดกะ (นำเงินในเก๊ะออกทั้งหมด ให้เหลือเท่ากับ cashFloat ของพรุ่งนี้)
    const amountToWithdraw = actual - storeSettings.cashFloat;
    if (amountToWithdraw !== 0) {
      addCashTransaction('out', amountToWithdraw, `นำเงินออกเพื่อปิดกะ (เงินส่วนต่าง: ${diff >= 0 ? '+' : ''}${diff})`);
    }
    
    setIsShiftModalOpen(false);
    setActualCash('');
  };

  // Mock data for 7-day sales chart
  const last7Days = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString('th-TH', { weekday: 'short' }),
        // For today (last item), use real totalSales, otherwise use random mock data
        value: i === 6 ? totalSales : Math.floor(Math.random() * 5000) + 1000
      };
    });
  }, [totalSales]);
  const maxChartValue = Math.max(...last7Days.map(d => d.value), 100);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto animate-in fade-in duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">สรุปผลประกอบการ</h1>
          <p className="text-slate-500 font-medium mt-1">ภาพรวมยอดขายและการเงินประจำวัน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-slate-500 font-bold mb-2 flex items-center space-x-2"><Receipt className="w-5 h-5 text-blue-600"/><span>ยอดขายรวม</span></div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">฿{totalSales.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-200 flex flex-col justify-center relative overflow-hidden">
          <div className="text-emerald-700 font-bold mb-2 flex items-center space-x-2 relative z-10"><TrendingUp className="w-5 h-5 text-emerald-600"/><span>กำไรสุทธิ</span></div>
          <div className="text-4xl font-black text-emerald-600 tracking-tight relative z-10">฿{totalProfit.toLocaleString()}</div>
          <div className="absolute -right-4 -bottom-4 text-emerald-100 opacity-50"><TrendingUp className="w-24 h-24" /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-slate-500 font-bold mb-2 flex items-center space-x-2"><Banknote className="w-5 h-5 text-emerald-600"/><span>ยอดขายเงินสด</span></div>
          <div className="text-4xl font-black text-emerald-600 tracking-tight">฿{cashSales.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-slate-500 font-bold mb-2 flex items-center space-x-2"><CreditCard className="w-5 h-5 text-blue-600"/><span>ยอดขายโอนเงิน</span></div>
          <div className="text-4xl font-black text-blue-600 tracking-tight">฿{promptpaySales.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-slate-500 font-bold mb-2 flex items-center space-x-2"><Users className="w-5 h-5 text-slate-600"/><span>ยอดขายแปะโป้ง</span></div>
          <div className="text-4xl font-black text-slate-700 tracking-tight">฿{creditSales.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Register Closing */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet className="w-6 h-6" /></div>
              <span>ปิดยอดลิ้นชักเงินสด</span>
            </h2>
            <button 
              onClick={() => setIsShiftModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors text-sm"
            >
              ปิดกะประจำวัน
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold">เงินสดรับเข้า (รวมยอดขายเงินสด)</span>
              <span className="font-bold text-emerald-600 text-lg">+ ฿{cashTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold">เงินนำออก (ทอน/ใช้จ่าย)</span>
              <span className="font-bold text-rose-500 text-lg">- ฿{cashTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center pt-2">
              <span className="font-extrabold text-slate-800 text-xl">เงินสดที่ต้องมีในลิ้นชัก</span>
              <span className="font-black text-4xl text-slate-900 tracking-tight">฿{expectedCashInDrawer.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <h3 className="font-bold text-slate-600 mb-4 uppercase tracking-wider text-sm">ประวัติการขยับเงินลิ้นชัก (5 รายการล่าสุด)</h3>
            <div className="space-y-3 flex-1">
              {cashTransactions.slice(-5).reverse().map(t => (
                <div key={t.id} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-slate-700 font-medium flex items-center">
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg mr-3">
                      {new Date(t.date).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {t.note}
                  </div>
                  <div className={cn("font-extrabold text-lg", t.type === 'in' ? "text-emerald-500" : "text-rose-500")}>
                    {t.type === 'in' ? '+' : '-'} ฿{t.amount}
                  </div>
                </div>
              ))}
              {cashTransactions.length === 0 && (
                <div className="text-slate-400 text-center py-6 font-medium">ไม่มีรายการความเคลื่อนไหว</div>
              )}
            </div>
          </div>
        </div>

        {/* Debtors */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Users className="w-6 h-6" /></div>
              <span>ลูกหนี้แปะโป้ง</span>
            </h2>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">ยอดหนี้รวม</div>
              <div className="text-3xl font-black text-slate-700">฿{totalDebt.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {debtors.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <Users className="w-20 h-20 mb-4 opacity-20" />
                <div className="text-xl font-bold text-slate-400">ไม่มีลูกหนี้ค้างชำระ 🎉</div>
              </div>
            ) : (
              debtors.map(debtor => (
                <div key={debtor.id} className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-slate-300 transition-all">
                  <div className="font-bold text-slate-800 text-xl">{debtor.name}</div>
                  <div className="flex items-center space-x-6">
                    <span className="font-black text-slate-700 text-2xl tracking-tight">฿{debtor.debt.toLocaleString()}</span>
                    <button 
                      onClick={() => payDebt(debtor.id, debtor.debt)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white font-bold rounded-lg transition-colors border border-slate-200 hover:border-emerald-600"
                    >
                      เคลียร์ยอด
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><BarChart3 className="w-6 h-6" /></div>
          <span>แนวโน้มยอดขาย 7 วันล่าสุด</span>
        </h2>
        <div className="h-64 flex items-end space-x-2 md:space-x-6">
          {last7Days.map((day, i) => {
            const heightPercent = Math.max((day.value / maxChartValue) * 100, 2); // At least 2% to show a small bar
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-800 text-white text-sm font-bold py-1 px-3 rounded-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                  ฿{day.value.toLocaleString()}
                </div>
                {/* Bar */}
                <div className="w-full flex-1 flex items-end bg-slate-50 rounded-t-lg overflow-hidden relative">
                  <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-700 ease-out", 
                      i === 6 ? "bg-blue-500 group-hover:bg-blue-600" : "bg-slate-300 group-hover:bg-slate-400"
                    )}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <div className={cn("mt-4 text-sm font-bold", i === 6 ? "text-blue-600" : "text-slate-500")}>
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Close Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleShiftClose} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                <Wallet className="w-6 h-6 mr-2 text-emerald-600" />
                ปิดกะประจำวัน
              </h3>
              <button type="button" onClick={() => setIsShiftModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
              <div className="text-sm text-slate-500 mb-1">ยอดเงินในลิ้นชักตามระบบ</div>
              <div className="font-black text-4xl text-slate-800">฿{expectedCashInDrawer.toLocaleString()}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนเงินสดที่นับได้จริง (บาท)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={actualCash}
                  onChange={e => setActualCash(e.target.value)}
                  className="w-full p-4 text-3xl font-black text-right text-emerald-700 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  autoFocus
                  placeholder="0"
                />
              </div>
              
              {actualCash !== '' && (
                <div className={cn(
                  "p-4 rounded-xl border flex justify-between items-center",
                  Number(actualCash) === expectedCashInDrawer ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                  Number(actualCash) > expectedCashInDrawer ? "bg-blue-50 border-blue-200 text-blue-700" :
                  "bg-rose-50 border-rose-200 text-rose-700"
                )}>
                  <span className="font-bold">
                    {Number(actualCash) === expectedCashInDrawer ? "ยอดเงินพอดีเป๊ะ!" :
                     Number(actualCash) > expectedCashInDrawer ? "เงินเกิน (Over)" : "เงินขาด (Short)"}
                  </span>
                  <span className="font-black text-2xl">
                    {Number(actualCash) !== expectedCashInDrawer && (
                      Number(actualCash) > expectedCashInDrawer ? '+' : ''
                    )}
                    {(Number(actualCash) - expectedCashInDrawer).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex space-x-3">
              <button 
                type="button" 
                onClick={() => setIsShiftModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                disabled={actualCash === ''}
                className="flex-1 py-3 bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
              >
                ยืนยันปิดกะ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
