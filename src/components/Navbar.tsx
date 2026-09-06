'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store, PackageSearch, LayoutDashboard, WalletCards, ReceiptText, Settings } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';

export function Navbar() {
  const pathname = usePathname();
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashNote, setCashNote] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashType, setCashType] = useState<'in' | 'out'>('out');
  const { addCashTransaction, storeSettings } = useStore();

  const navs = [
    { name: 'POS', path: '/', icon: Store },
    { name: 'บิลย้อนหลัง', path: '/history', icon: ReceiptText },
    { name: 'คลังสินค้า', path: '/inventory', icon: PackageSearch },
    { name: 'แดชบอร์ด', path: '/dashboard', icon: LayoutDashboard },
    { name: 'ตั้งค่า', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center space-x-8">
          <div className="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <span className="truncate max-w-[150px]">{storeSettings.name}</span>
          </div>
          <div className="flex h-16">
            {navs.map((nav) => {
              const Icon = nav.icon;
              const isActive = pathname === nav.path;
              return (
                <Link key={nav.path} href={nav.path}>
                  <div className={cn(
                    "flex items-center space-x-2 px-5 h-full font-medium transition-colors border-b-2 cursor-pointer",
                    isActive 
                      ? "border-blue-600 text-blue-600 bg-blue-50/50" 
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}>
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{nav.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <button 
            onClick={() => setIsCashModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-colors border border-slate-200"
          >
            <WalletCards className="w-4 h-4" />
            <span className="hidden md:inline">ลิ้นชักเงินสด</span>
          </button>
        </div>
      </nav>

      {isCashModalOpen && (
        <CashDrawerModal onClose={() => setIsCashModalOpen(false)} />
      )}
    </>
  );
}

function CashDrawerModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'in' | 'out'>('out');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { addCashTransaction, getCashInDrawer } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    addCashTransaction(type, Number(amount), note || (type === 'in' ? 'นำเงินเข้า' : 'นำเงินออก'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">จัดการลิ้นชักเงินสด</h2>
        <div className="text-gray-500 mb-8 font-medium">ยอดเงินในเก๊ะปัจจุบัน: <span className="text-gray-900 font-extrabold text-2xl ml-2">฿{getCashInDrawer().toLocaleString()}</span></div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('in')}
              className={cn("flex-1 py-3.5 rounded-2xl font-bold border-2 transition-all duration-200", type === 'in' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50')}
            >
              นำเงินเข้า (In)
            </button>
            <button
              type="button"
              onClick={() => setType('out')}
              className={cn("flex-1 py-3.5 rounded-2xl font-bold border-2 transition-all duration-200", type === 'out' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50')}
            >
              นำเงินออก (Out)
            </button>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2 text-sm">จำนวนเงิน</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold text-gray-800 p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all duration-200"
              placeholder="0.00"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2 text-sm">หมายเหตุ (เช่น ทอนแลกแบงก์, จ่ายค่าน้ำแข็ง)</label>
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all duration-200"
              placeholder="กรอกหมายเหตุ..."
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-lg transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-colors">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}
