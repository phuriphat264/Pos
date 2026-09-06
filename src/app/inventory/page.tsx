'use client';
import { useStore, Product } from '@/store/useStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, AlertCircle, Plus, Minus, PackageSearch, PackagePlus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { inventory, updateStock, updateMinStock, deleteProduct } = useStore();
  const [search, setSearch] = useState('');

  const filteredInventory = inventory.filter(p => p.name.includes(search));

  const handleAdjustStock = (id: string, currentStock: number, adjustment: number) => {
    updateStock(id, currentStock + adjustment);
  };

  const handleDelete = (id: string) => {
    if (confirm('ยืนยันการลบสินค้านี้?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <PackageSearch className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">จัดการคลังสินค้า</h1>
            <p className="text-slate-500 font-medium mt-1">อัปเดตสต็อก เพิ่มสินค้าใหม่ และตั้งค่าการแจ้งเตือน</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-full transition-all shadow-sm font-medium"
            />
          </div>
          <Link href="/inventory/add">
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap">
              <PackagePlus className="w-5 h-5" />
              <span className="hidden sm:inline">เพิ่มสินค้า</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-gray-100 flex-1 overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50/90 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-5 font-bold text-slate-500 tracking-wider w-1/3">สินค้า</th>
                <th className="p-5 font-bold text-slate-500 tracking-wider text-center w-32">ราคา (฿)</th>
                <th className="p-5 font-bold text-slate-500 tracking-wider text-center w-40">สต็อกปัจจุบัน</th>
                <th className="p-5 font-bold text-slate-500 tracking-wider text-center w-48">ดึงเข้า/ออกด่วน</th>
                <th className="p-5 font-bold text-slate-500 tracking-wider text-center w-32">จุดเตือน</th>
                <th className="p-5 font-bold text-slate-500 tracking-wider w-32">สถานะ</th>
                <th className="p-5 font-bold text-slate-500 tracking-wider text-right w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className={cn("w-14 h-14 rounded-2xl shrink-0 shadow-sm flex items-center justify-center text-white font-bold text-xl overflow-hidden", !product.imageUrl && product.imageColor)}>
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          product.name.charAt(0)
                        )}
                      </div>
                      <span className="font-extrabold text-slate-800 text-lg">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center font-bold text-blue-600 text-xl">
                    {product.price}
                  </td>
                  <td className="p-5 text-center">
                    <span className={cn(
                      "font-black text-2xl",
                      product.stock <= 0 ? "text-rose-500" : (product.stock <= product.minStock ? "text-amber-500" : "text-slate-700")
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-gray-100 w-max mx-auto">
                      <button 
                        onClick={() => handleAdjustStock(product.id, product.stock, -1)}
                        className="p-2.5 bg-white hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input 
                        type="number" 
                        value={product.stock}
                        onChange={(e) => updateStock(product.id, Number(e.target.value))}
                        className="w-16 text-center text-xl font-bold bg-transparent focus:outline-none focus:text-blue-600 transition-colors"
                      />
                      <button 
                        onClick={() => handleAdjustStock(product.id, product.stock, 1)}
                        className="p-2.5 bg-white hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <input 
                      type="number" 
                      value={product.minStock}
                      onChange={(e) => updateMinStock(product.id, Number(e.target.value))}
                      className="w-16 text-center text-lg font-bold border-2 border-gray-200 rounded-xl p-2 focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-all hover:border-blue-300"
                    />
                  </td>
                  <td className="p-5">
                    {product.stock <= 0 ? (
                      <span className="inline-flex items-center space-x-1.5 text-rose-700 bg-rose-100 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        <AlertCircle className="w-4 h-4" /> <span>หมด!</span>
                      </span>
                    ) : product.stock <= product.minStock ? (
                      <span className="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        <AlertCircle className="w-4 h-4" /> <span>ใกล้หมด</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        ปกติ
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/inventory/edit/${product.id}`}>
                        <button className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <PackageSearch className="w-16 h-16 mb-4 opacity-20" />
               <div className="font-semibold text-xl">ไม่พบข้อมูลสินค้า</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
