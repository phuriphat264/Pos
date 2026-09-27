'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store, PackageSearch, LayoutDashboard, WalletCards, ReceiptText, Settings, BookUser, Cctv, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getStoreData, updateStoreData } from '@/lib/api';
import { User } from 'lucide-react';
// removed firebase user type

export function Navbar() {
  const pathname = usePathname();
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{email: string} | null>(null);
  const [cashNote, setCashNote] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashType, setCashType] = useState<'in' | 'out'>('out');
  const { addCashTransaction, storeSettings } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('pos_token');
      if (token) {
        try {
          const res = await fetch(`http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser({ email: data.email });
          }
        } catch (err) { }
      }
    };
    checkAuth();
  }, []);

  const navs = [
    { name: 'POS', path: '/', icon: Store },
    { name: 'บิลย้อนหลัง', path: '/history', icon: ReceiptText },
    { name: 'ลูกหนี้', path: '/customers', icon: BookUser },
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
        <div className="flex items-center space-x-2 md:space-x-3">
          {currentUser && (
            <div className="flex items-center bg-blue-50 px-2 py-1.5 md:px-3 rounded-lg border border-blue-100">
              <div className="hidden md:flex flex-col items-end mr-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">เข้าสู่ระบบโดย</span>
                <span className="text-sm font-semibold text-blue-700">{currentUser.email}</span>
              </div>
              <span className="md:hidden text-xs font-semibold text-blue-700 mr-2 max-w-[80px] truncate">{currentUser.email?.split('@')[0]}</span>
              <button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('pos_token');
                    if (!token) return;
                    const res = await getStoreData(token);
                    if (res.data) {
                      useStore.getState().setStoreFromFirebase(res.data);
                      alert('ซิงค์ข้อมูลจากคลาวด์สำเร็จ!');
                    }
                  } catch (e) {
                    alert('ไม่สามารถดึงข้อมูลได้');
                  }
                }}
                className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors mr-1"
                title="ดึงข้อมูลล่าสุดจากคลาวด์"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('pos_token');
                    if (!token) return;
                    const state = useStore.getState();
                    const dataToSave = {
                      inventory: state.inventory,
                      cart: state.cart,
                      sales: state.sales,
                      cashTransactions: state.cashTransactions,
                      heldBills: state.heldBills,
                      customers: state.customers,
                      customerTransactions: state.customerTransactions || [],
                      storeSettings: state.storeSettings,
                      lastUpdatedLocal: Date.now()
                    };
                    await updateStoreData(token, dataToSave);
                    alert('ส่งข้อมูลขึ้นคลาวด์สำเร็จ!');
                  } catch (e) {
                    alert('ไม่สามารถส่งข้อมูลขึ้นคลาวด์ได้');
                  }
                }}
                className="p-1.5 text-blue-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors mr-1"
                title="บังคับส่งข้อมูลขึ้นคลาวด์"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <button 
                onClick={async () => {
                  if(window.confirm('ออกจากระบบ?')) {
                    const token = localStorage.getItem('pos_token');
                    const state = useStore.getState();
                    const dataToSave = {
                      inventory: state.inventory,
                      cart: state.cart,
                      sales: state.sales,
                      cashTransactions: state.cashTransactions,
                      heldBills: state.heldBills,
                      customers: state.customers,
                      customerTransactions: state.customerTransactions || [],
                      storeSettings: state.storeSettings,
                      lastUpdatedLocal: state.lastUpdatedLocal
                    };
                    if (token && (dataToSave.lastUpdatedLocal || 0) > 0) {
                      await updateStoreData(token, dataToSave).catch(console.error);
                    }
                    localStorage.removeItem('pos_token');
                    window.location.reload();
                  }
                }}
                className="p-1.5 text-blue-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsCashModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-colors border border-slate-200"
          >
            <WalletCards className="w-4 h-4" />
            <span className="hidden md:inline">ลิ้นชัก</span>
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
