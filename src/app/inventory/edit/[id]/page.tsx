'use client';
import { useStore, Product } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Edit2, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { inventory, editProduct } = useStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageColor, setImageColor] = useState('bg-blue-300');
  const [imageUrl, setImageUrl] = useState('');

  const colorOptions = ['bg-blue-300', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-slate-700'];

  useEffect(() => {
    const id = params.id as string;
    const p = inventory.find(i => i.id === id);
    if (p) {
      setProduct(p);
      setName(p.name);
      setPrice(String(p.price));
      setStock(String(p.stock));
      setMinStock(String(p.minStock));
      setCategory(p.category || '');
      setImageColor(p.imageColor);
      setImageUrl(p.imageUrl || '');
    } else {
      router.replace('/inventory');
    }
  }, [params.id, inventory, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !product) return;

    editProduct(product.id, {
      name,
      price: Number(price),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      category: category.trim() || undefined,
      imageColor,
      imageUrl
    });
    router.push('/inventory');
  };

  if (!product) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center mb-8 space-x-4">
        <Link href="/inventory" className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">แก้ไขสินค้า</h1>
          <p className="text-slate-500 font-medium mt-1">อัปเดตข้อมูลสินค้า {product.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-gray-100 flex-1 overflow-y-auto">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-slate-700 font-bold mb-2">ชื่อสินค้า <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xl font-medium p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="เช่น โค้กกระป๋อง"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-bold mb-2">ราคาขาย (฿) <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xl font-bold p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="0"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-bold mb-2">หมวดหมู่</label>
              <input 
                type="text" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xl font-medium p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="เช่น เครื่องดื่ม, ของหวาน"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-bold mb-2">อัปโหลดรูปภาพ</label>
              <div className="flex items-center space-x-4">
                {imageUrl ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <X className="text-white w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <label className={cn("w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer shadow-sm border border-gray-200 text-white font-bold text-3xl shrink-0 transition-colors hover:opacity-80", imageColor)}>
                    {name ? name.charAt(0) : '?'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
                <label className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-xl text-center font-medium text-slate-500 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
                  <div className="text-sm">คลิกเพื่อเปลี่ยนรูปภาพ</div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-bold mb-2">หรือเลือกสีป้าย (ถ้าไม่มีรูป)</label>
              <div className="grid grid-cols-4 gap-3 pt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setImageColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-full cursor-pointer transition-transform active:scale-90 shadow-sm", 
                      color,
                      imageColor === color ? "ring-4 ring-offset-2 ring-blue-500 scale-110" : ""
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-bold mb-2">สต็อกปัจจุบัน</label>
              <input 
                type="number" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full text-xl font-semibold p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="0"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-bold mb-2">เตือนเมื่อเหลือน้อยกว่า</label>
              <input 
                type="number" 
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full text-xl font-semibold p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-8 pb-4">
            <Link href="/inventory" className="flex-1">
              <button type="button" className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xl transition-colors">
                ยกเลิก
              </button>
            </Link>
            <button type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 transition-colors flex items-center justify-center space-x-2">
              <Edit2 className="w-6 h-6" />
              <span>บันทึกการแก้ไข</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
