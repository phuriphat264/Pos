'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calculator, Grid2X2, Delete, LayoutGrid } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function PosLeftPanel() {
  const [activeTab, setActiveTab] = useState<'calc' | 'catalog'>('calc');
  const [calcInput, setCalcInput] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  
  const { addToCart, inventory } = useStore();

  const categories = ['ทั้งหมด', ...Array.from(new Set(inventory.map(p => p.category).filter(Boolean)))];

  const filteredCatalog = inventory.filter(p => {
    const matchesSearch = p.name.includes(searchQuery);
    const matchesCategory = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    let barcode = '';
    let lastTime = 0;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'Enter') {
        if (barcode.length > 3) {
          const product = inventory.find(p => p.id === barcode || p.name.includes(barcode));
          if (product) {
            addToCart({ productId: product.id, name: product.name, price: product.price, qty: 1 });
          } else {
             if(!isNaN(Number(barcode))) {
                addToCart({ name: `สินค้า (Barcode: ${barcode})`, price: Number(barcode), qty: 1 });
             }
          }
        }
        barcode = '';
      } else {
        const now = Date.now();
        if (now - lastTime > 50) {
          barcode = '';
        }
        barcode += e.key;
        lastTime = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inventory, addToCart]);

  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
      return;
    }

    if (val === 'DEL') {
      setCalcInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }

    // Handle operators to prevent duplicates like "++" or "*/"
    const isOperator = ['+', '-', '*', '/'].includes(val);
    if (isOperator) {
      setCalcInput(prev => {
        const lastChar = prev.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
          return prev.slice(0, -1) + val;
        }
        return prev + val;
      });
      return;
    }

    // Entering numbers
    setCalcInput(prev => prev === '0' && val !== '.' ? val : prev + val);
  };

  const handleAddToBill = () => {
    try {
      // Safe evaluation of the math string
      const sanitized = calcInput.replace(/[^-()\d/*+.]/g, '');
      if (!sanitized) return;
      
      // eslint-disable-next-line no-new-func
      const finalAmount = new Function(`return ${sanitized}`)();

      if (finalAmount > 0) {
        // If it was a math equation, show it in the bill name
        const isEquation = /[\+\-\*\/]/.test(calcInput) && !calcInput.startsWith('-');
        const name = isEquation ? `สินค้าจุกจิก (${calcInput.replace(/\*/g, 'x').replace(/\//g, '÷')})` : 'สินค้าจุกจิก';
        addToCart({ name, price: finalAmount, qty: 1 });
        setCalcInput('0');
      } else if (finalAmount < 0) {
        // Negative amount = Discount
        addToCart({ name: 'ส่วนลด', price: finalAmount, qty: 1 });
        setCalcInput('0');
      }
    } catch {
      // Invalid math expression
      setCalcInput('Error');
      setTimeout(() => setCalcInput('0'), 1000);
    }
  };

  const displayInput = calcInput.replace(/\*/g, '×').replace(/\//g, '÷');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex bg-white p-4 gap-4 border-b border-gray-200 z-10 shadow-sm">
        <button
          onClick={() => setActiveTab('calc')}
          className={cn(
            "flex-1 py-3.5 flex items-center justify-center space-x-2 rounded-lg font-bold text-lg transition-all",
            activeTab === 'calc' ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Calculator className={cn("w-6 h-6", activeTab === 'calc' ? "text-blue-400" : "text-slate-400")} />
          <span>เครื่องคิดเลขด่วน</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={cn(
            "flex-1 py-3.5 flex items-center justify-center space-x-2 rounded-lg font-bold text-lg transition-all",
            activeTab === 'catalog' ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <LayoutGrid className={cn("w-6 h-6", activeTab === 'catalog' ? "text-blue-400" : "text-slate-400")} />
          <span>แคตตาล็อกสินค้า</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center items-start">
        {activeTab === 'calc' ? (
          <div className="max-w-md w-full flex-1 flex flex-col justify-center">
            {/* Screen */}
            <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 shadow-inner mb-6 relative overflow-hidden flex flex-col justify-end min-h-[140px]">
              <div className="text-right text-5xl font-mono tracking-tighter font-semibold text-slate-800 break-all flex items-center justify-end">
                {displayInput}
              </div>
            </div>
            
            {/* Keypad */}
            <div className="grid grid-cols-4 gap-4 flex-1 content-start">
              {/* Row 1 */}
              <button onClick={() => handleCalcPress('C')} className="h-24 text-3xl font-bold rounded-xl shadow-sm border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:bg-rose-200 transition-colors">C</button>
              <button onClick={() => handleCalcPress('DEL')} className="h-24 flex items-center justify-center font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"><Delete className="w-9 h-9" /></button>
              <button onClick={() => handleCalcPress('/')} className="h-24 text-4xl font-medium rounded-xl shadow-sm border border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 transition-colors">÷</button>
              <button onClick={() => handleCalcPress('*')} className="h-24 text-4xl font-medium rounded-xl shadow-sm border border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 transition-colors">×</button>

              {/* Row 2 */}
              <button onClick={() => handleCalcPress('7')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">7</button>
              <button onClick={() => handleCalcPress('8')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">8</button>
              <button onClick={() => handleCalcPress('9')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">9</button>
              <button onClick={() => handleCalcPress('-')} className="h-24 text-5xl font-medium rounded-xl shadow-sm border border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 transition-colors">-</button>

              {/* Row 3 */}
              <button onClick={() => handleCalcPress('4')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">4</button>
              <button onClick={() => handleCalcPress('5')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">5</button>
              <button onClick={() => handleCalcPress('6')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">6</button>
              <button onClick={() => handleCalcPress('+')} className="h-24 text-5xl font-medium rounded-xl shadow-sm border border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 transition-colors">+</button>

              {/* Row 4 */}
              <button onClick={() => handleCalcPress('1')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">1</button>
              <button onClick={() => handleCalcPress('2')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">2</button>
              <button onClick={() => handleCalcPress('3')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">3</button>
              <button onClick={handleAddToBill} className="col-span-1 row-span-2 h-full bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center">
                <span>ลงบิล</span>
              </button>

              {/* Row 5 */}
              <button onClick={() => handleCalcPress('0')} className="col-span-2 h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">0</button>
              <button onClick={() => handleCalcPress('.')} className="h-24 text-4xl font-bold rounded-xl shadow-sm border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors">.</button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col animate-in fade-in duration-300">
            <div className="mb-4 relative w-full max-w-xl mx-auto flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="ค้นหาสินค้าในแคตตาล็อก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium shadow-sm"
                />
              </div>

              {/* Categories */}
              {categories.length > 1 && (
                <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2">
                  {categories.map(category => (
                    <button
                      key={category as string}
                      onClick={() => setSelectedCategory(category as string)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-lg font-bold text-sm transition-colors border",
                        selectedCategory === category 
                          ? "bg-slate-800 text-white border-slate-800" 
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {category as string}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max overflow-y-auto pb-8">
              {filteredCatalog.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price, qty: 1 })}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md active:bg-slate-50 transition-all flex flex-col relative h-auto"
                >
                  <div className={cn("aspect-square w-full flex items-center justify-center overflow-hidden border-b border-slate-100", product.imageUrl ? "bg-white" : product.imageColor)}>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-white text-4xl font-bold">{product.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between bg-white relative z-10">
                    <div className="font-extrabold text-slate-800 line-clamp-2 text-xl leading-tight text-left mb-2">{product.name}</div>
                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-blue-700 font-black text-2xl">฿{product.price}</span>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", product.stock <= product.minStock ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600")}>
                        {product.stock}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                  ไม่พบสินค้าที่ค้นหา
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
