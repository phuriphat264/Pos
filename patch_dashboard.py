import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Replace hook destructuring to include expenses
content = content.replace("const { sales, inventory, customers, getCashInDrawer, addCashTransaction, payDebt } = useStore();", 
                          "const { sales, inventory, customers, expenses, getCashInDrawer, addCashTransaction, payDebt } = useStore();")

# Add calculation for expenses and profit
calcs_insert = """
  // P&L
  const totalRevenue = sales.filter(s => !s.isVoided).reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
"""
content = content.replace("const totalDebt = debtors.reduce((sum, d) => sum + d.debt, 0);", 
                          "const totalDebt = debtors.reduce((sum, d) => sum + d.debt, 0);\n" + calcs_insert)

# Add P&L Card in the stats grid
# The original grid is <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
grid_replace = """
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
            <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">รวมทั้งหมด</div>
          </div>
          <div className="mt-4">
            <div className="text-slate-500 font-bold mb-1">ยอดขายรวม</div>
            <div className="text-3xl font-black text-slate-800">฿{totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl"><TrendingDown className="w-6 h-6" /></div>
            <div className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">รวมทั้งหมด</div>
          </div>
          <div className="mt-4">
            <div className="text-slate-500 font-bold mb-1">ต้นทุน/รายจ่าย</div>
            <div className="text-3xl font-black text-slate-800">฿{totalExpenses.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><DollarSign className="w-6 h-6" /></div>
            <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">สุทธิ</div>
          </div>
          <div className="mt-4">
            <div className="text-slate-400 font-bold mb-1">กำไรสุทธิ</div>
            <div className={`text-3xl font-black ${netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>฿{netProfit.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl"><Package className="w-6 h-6" /></div>
            <div className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">ต้องสั่งเพิ่ม</div>
          </div>
          <div className="mt-4">
            <div className="text-slate-500 font-bold mb-1">สินค้าใกล้หมด</div>
            <div className="text-3xl font-black text-slate-800 flex items-baseline space-x-2">
              <span>{lowStockProducts.length}</span>
              <span className="text-lg font-bold text-slate-400">รายการ</span>
            </div>
          </div>
        </div>
"""

# Find the old grid and replace it
# We will use regex to find the old <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ... </div> up to the end of that block.
old_grid_pattern = r'\{\/\* KPI Cards \*\/\}.*?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">.*?<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">.*?รายการ<\/span>.*?<\/div>.*?<\/div>.*?<\/div>'

content = re.sub(r'\{\/\* KPI Cards \*\/\}[\s\S]*?(?=\{\/\* Main Panels \*\/})', grid_replace + '\n      ', content)

# I should also add TrendingDown to the lucide-react imports
content = content.replace("import { TrendingUp, Package, Users, AlertTriangle, DollarSign, Wallet, X, Clock, BarChart3 } from 'lucide-react';", 
                          "import { TrendingUp, TrendingDown, Package, Users, AlertTriangle, DollarSign, Wallet, X, Clock, BarChart3 } from 'lucide-react';")

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
