'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Cctv, Plus, Trash2, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CctvPage() {
  const { cameras, addCamera, deleteCamera } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [camName, setCamName] = useState('');
  const [camUrl, setCamUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (camName.trim() && camUrl.trim()) {
      addCamera(camName.trim(), camUrl.trim());
      setCamName('');
      setCamUrl('');
      setIsModalOpen(false);
    }
  };

  // Auto-calculate grid columns based on number of cameras
  const gridCols = cameras.length === 1 ? 'grid-cols-1' : 
                   cameras.length <= 4 ? 'grid-cols-1 md:grid-cols-2' : 
                   'grid-cols-2 md:grid-cols-3';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center space-x-3">
            <Cctv className="w-8 h-8 text-indigo-600" />
            <span>กล้องวงจรปิด (CCTV)</span>
          </h1>
          <p className="text-slate-500 mt-2">ดูกล้องวงจรปิดภายในร้านผ่าน IP Camera (รองรับ MJPEG Stream URL หรือ Iframe)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มกล้องใหม่</span>
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto grid ${gridCols} gap-6 content-start pb-10`}>
        {cameras.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Video className="w-16 h-16 mb-4 opacity-30 text-indigo-600" />
            <div className="text-xl font-bold text-slate-600 mb-2">ยังไม่ได้เชื่อมต่อกล้องวงจรปิด</div>
            <div className="text-slate-400 mb-6 text-center max-w-md">คุณสามารถเพิ่มกล้องวงจรปิด IP Camera ของที่ร้านมาโชว์บนหน้าจอนี้ได้ เพื่อให้ดูร้านและคิดเงินได้ในจอเดียว</div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-6 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-lg transition-colors"
            >
              เพิ่มกล้องตัวแรก
            </button>
          </div>
        ) : (
          cameras.map((cam) => (
            <div key={cam.id} className="bg-black rounded-2xl overflow-hidden shadow-md flex flex-col group relative aspect-video border border-slate-800">
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white font-bold text-sm flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse mr-2 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                  {cam.name}
                </div>
                <button 
                  onClick={() => deleteCamera(cam.id)}
                  className="p-2 bg-black/50 hover:bg-rose-500 text-white rounded-lg transition-colors backdrop-blur-sm"
                  title="ลบกล้องนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Camera viewer - we use iframe to support both MJPEG directly or web viewers */}
              <iframe 
                src={cam.url} 
                className="w-full h-full border-0 bg-slate-900 absolute inset-0 z-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-same-origin allow-scripts"
                title={cam.name}
              />
              
              {/* Fallback overlay in case URL fails or takes long to load */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 bg-slate-900">
                <Video className="w-12 h-12 text-slate-700 animate-pulse" />
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleAdd} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                <Cctv className="w-6 h-6 mr-2 text-indigo-600" />
                เพิ่มกล้องวงจรปิด
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อจุดติดตั้ง (Camera Name)</label>
                <input 
                  type="text" 
                  required
                  value={camName}
                  onChange={e => setCamName(e.target.value)}
                  className="w-full p-4 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all font-medium"
                  placeholder="เช่น กล้องหน้าร้าน, กล้องแคชเชียร์"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">URL ของกล้อง (Video Stream URL)</label>
                <input 
                  type="url" 
                  required
                  value={camUrl}
                  onChange={e => setCamUrl(e.target.value)}
                  className="w-full p-4 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all font-mono text-sm"
                  placeholder="http://192.168.1.100/video"
                />
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-800 font-medium mb-1">ตัวอย่างลิงก์ที่รองรับ:</p>
                  <ul className="text-xs text-indigo-600/80 space-y-1 list-disc list-inside">
                    <li>URL จากแอป IP Webcam: <span className="font-mono">http://[IP]:8080/video</span></li>
                    <li>MJPEG Stream จาก NVR/DVR</li>
                    <li>ลิงก์สำหรับฝังเว็บไซต์ (Embed Iframe)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                บันทึกกล้อง
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
