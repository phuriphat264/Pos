'use client';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { Settings, Save, Store, MapPin, Percent, Banknote } from 'lucide-react';

export default function SettingsPage() {
  const { storeSettings, updateSettings } = useStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cashFloat, setCashFloat] = useState('');

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

          <div className="pt-6 flex justify-end">
            <button 
              type="submit"
              className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors active:scale-95 shadow-sm"
            >
              <Save className="w-6 h-6 mr-3" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
