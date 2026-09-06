'use client';
import { useStore } from '@/store/useStore';
import { ReceiptText, Trash2, Search, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { sales, voidSale } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const sortedSales = [...sales].reverse();
  const filteredSales = sortedSales.filter(sale => 
    sale.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVoid = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกบิลนี้? ข้อมูลสต็อกและยอดเงินจะถูกคืนค่าทั้งหมด')) {
      voidSale(id);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-200">
            <ReceiptText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ประวัติการขายรายบิล</h1>
            <p className="text-slate-500 font-medium mt-1">ดูประวัติบิลย้อนหลัง และยกเลิกบิล (Void)</p>
          </div>
        </div>
        
        <div className="relative w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาเลขที่บิล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-600 text-sm tracking-wide">
          <div className="col-span-2">เวลา</div>
          <div className="col-span-2">เลขที่บิล</div>
          <div className="col-span-3">รายการสินค้า</div>
          <div className="col-span-2">ประเภทการจ่าย</div>
          <div className="col-span-2 text-right">ยอดรวม</div>
          <div className="col-span-1 text-center">จัดการ</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredSales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <ReceiptText className="w-20 h-20 mb-4 opacity-20" />
              <div className="text-xl font-bold">ไม่พบบิลการขาย</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSales.map(sale => (
                <div 
                  key={sale.id} 
                  className={cn(
                    "grid grid-cols-12 gap-4 p-4 rounded-lg items-center border transition-all",
                    sale.isVoided 
                      ? "bg-slate-50 border-slate-200 opacity-60 grayscale"
                      : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                  )}
                >
                  <div className="col-span-2 font-medium text-slate-600">
                    {new Date(sale.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="col-span-2 font-mono text-sm text-slate-500">
                    {sale.id}
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {sale.items?.length > 0 ? sale.items.map(i => i.name).join(', ') : 'ไม่มีรายการ'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{sale.items?.length || 0} รายการ</div>
                  </div>
                  <div className="col-span-2">
                    {sale.type === 'cash' && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">เงินสด</span>}
                    {sale.type === 'promptpay' && <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">โอนเงิน</span>}
                    {sale.type === 'credit' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">แปะโป้ง</span>}
                    {sale.isVoided && <span className="ml-2 px-2.5 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold">ยกเลิกแล้ว</span>}
                  </div>
                  <div className="col-span-2 text-right font-black text-slate-800 text-lg">
                    {sale.isVoided ? <s className="text-slate-400">฿{sale.total.toLocaleString()}</s> : `฿${sale.total.toLocaleString()}`}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {!sale.isVoided && (
                      <button 
                        onClick={() => handleVoid(sale.id)}
                        title="ยกเลิกบิลนี้ (Void)"
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
