'use client';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { Banknote, CreditCard, Wallet, Users, Receipt, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { sales, customers, cashTransactions, payDebt, getCashInDrawer } = useStore();

  const totalSales = useMemo(() => sales.reduce((acc, sale) => acc + sale.total, 0), [sales]);
  const cashSales = useMemo(() => sales.filter(s => s.type === 'cash').reduce((acc, sale) => acc + sale.total, 0), [sales]);
  const promptpaySales = useMemo(() => sales.filter(s => s.type === 'promptpay').reduce((acc, sale) => acc + sale.total, 0), [sales]);
  const creditSales = useMemo(() => sales.filter(s => s.type === 'credit').reduce((acc, sale) => acc + sale.total, 0), [sales]);
  
  const debtors = useMemo(() => customers.filter(c => c.debt > 0), [customers]);
  const totalDebt = useMemo(() => debtors.reduce((acc, c) => acc + c.debt, 0), [debtors]);

  const expectedCashInDrawer = getCashInDrawer();

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-slate-500 font-bold mb-2 flex items-center space-x-2"><Receipt className="w-5 h-5 text-blue-600"/><span>ยอดขายรวม</span></div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">฿{totalSales.toLocaleString()}</div>
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
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet className="w-6 h-6" /></div>
            <span>สรุปปิดยอดลิ้นชักเงินสด</span>
          </h2>
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
    </div>
  );
}
