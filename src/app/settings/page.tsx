'use client';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { Settings, Save, Store, MapPin, Banknote, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { storeSettings, updateSettings } = useStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cashFloat, setCashFloat] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    setName(storeSettings.name);
    setAddress(storeSettings.address);
    setCashFloat(String(storeSettings.cashFloat));
  }, [storeSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name,
      address,
      cashFloat: Number(cashFloat) || 0
    });
    alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const handleClearAllData = async () => {
    const confirm1 = window.confirm('⚠️ คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?\n\nสินค้า, บิลขาย, ลูกหนี้, เงินสด ทุกอย่างจะถูกลบหมดเลย!');
    if (!confirm1) return;
    
    const confirm2 = window.confirm('🚨 ยืนยันอีกครั้ง: ข้อมูลจะหายถาวร ไม่สามารถกู้คืนได้!\n\nกด OK เพื่อลบทั้งหมด');
    if (!confirm2) return;

    setIsClearing(true);
    try {
      const { db, doc } = await import('@/lib/firebase');
      const { deleteDoc, setDoc } = await import('firebase/firestore');
      
      // 1. Delete the Firebase document completely
      await deleteDoc(doc(db, 'pos_data', 'main_store'));
      
      // 2. Clear localStorage
      localStorage.removeItem('pos-storage');
      
      // 3. Reset local state
      useStore.getState().resetStore();
      
      // 4. Push empty state to Firebase
      const { isRemoteUpdate, setStoreFromFirebase, resetStore, ...freshData } = useStore.getState();
      await setDoc(doc(db, 'pos_data', 'main_store'), { ...freshData, lastUpdatedLocal: Date.now() });
      
      alert('✅ ลบข้อมูลทั้งหมดเรียบร้อยแล้ว! ระบบพร้อมใช้งานใหม่');
      window.location.reload();
    } catch (err) {
      console.error('Clear data failed:', err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-slate-100 text-slate-700 rounded-xl shadow-sm border border-slate-200">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ตั้งค่าร้านค้า</h1>
          <p className="text-slate-500 font-medium mt-1">จัดการข้อมูลร้านและตั้งค่าระบบ</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-y-auto">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">ข้อมูลทั่วไป</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-slate-700 font-bold mb-2">
                  <Store className="w-5 h-5 mr-2 text-slate-400" />
                  ชื่อร้านค้า
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-lg font-medium p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-slate-700 font-bold mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-slate-400" />
                  ที่อยู่ร้าน / หัวใบเสร็จ
                </label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-lg font-medium p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-32 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">ระบบการเงิน</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-slate-700 font-bold mb-2">
                  <Banknote className="w-5 h-5 mr-2 text-slate-400" />
                  เงินทอนตั้งต้น (เริ่มต้นวัน)
                </label>
                <input 
                  type="number" 
                  value={cashFloat}
                  onChange={(e) => setCashFloat(e.target.value)}
                  className="w-full text-lg font-medium p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={async () => {
                if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
                  const { db, auth, doc, setDoc } = await import('@/lib/firebase');
                  const { useStore } = await import('@/store/useStore');
                  const { isRemoteUpdate, setStoreFromFirebase, resetStore, ...dataToSave } = useStore.getState();
                  if ((dataToSave.lastUpdatedLocal || 0) > 0) {
                    await setDoc(doc(db, 'pos_data', 'main_store'), dataToSave).catch(console.error);
                  }
                  auth.signOut();
                }
              }}
              className="px-8 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl transition-colors flex items-center justify-center shadow-sm whitespace-nowrap"
            >
              ออกจากระบบ
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-colors flex items-center justify-center text-xl shadow-md"
            >
              <Save className="w-6 h-6 mr-3" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="p-8 border-t-2 border-rose-200 bg-rose-50/30">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-rose-700">โซนอันตราย</h2>
          </div>
          <p className="text-slate-600 mb-4">ลบข้อมูลทั้งหมดในระบบ (สินค้า, บิลขาย, ลูกหนี้, เงินสด) เพื่อเริ่มต้นใหม่ตั้งแต่ศูนย์</p>
          <button
            type="button"
            onClick={handleClearAllData}
            disabled={isClearing}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Trash2 className="w-5 h-5" />
            <span>{isClearing ? 'กำลังลบข้อมูล...' : 'ล้างข้อมูลทั้งหมด'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
