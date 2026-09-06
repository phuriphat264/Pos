import { create } from 'zustand';

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category?: string;
  imageColor: string; // for mock UI
  imageUrl?: string;
};

export type CartItem = {
  id: string; // can be productId or a random id for custom price items
  productId?: string;
  name: string;
  price: number;
  qty: number;
};

export type Customer = {
  id: string;
  name: string;
  debt: number;
};

export type Sale = {
  id: string;
  total: number;
  type: 'cash' | 'promptpay' | 'credit';
  date: string;
  customerId?: string;
  items: CartItem[];
  isVoided?: boolean;
};

export type CashTransaction = {
  id: string;
  type: 'in' | 'out';
  amount: number;
  note: string;
  date: string;
};

interface AppState {
  // Inventory
  inventory: Product[];
  updateStock: (id: string, newStock: number) => void;
  updateMinStock: (id: string, minStock: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: { productId?: string; name: string; price: number; qty: number }) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  // Customers
  customers: Customer[];
  payDebt: (id: string, amount: number) => void;
  addCustomer: (name: string) => string;

  // Sales
  sales: Sale[];
  checkout: (type: 'cash' | 'promptpay' | 'credit', customerId?: string) => void;
  voidSale: (id: string) => void;

  // Cash Drawer
  cashTransactions: CashTransaction[];
  addCashTransaction: (type: 'in' | 'out', amount: number, note: string) => void;
  getCashInDrawer: () => number;

  // Settings
  storeSettings: {
    name: string;
    address: string;
    cashFloat: number;
  };
  updateSettings: (settings: Partial<AppState['storeSettings']>) => void;
}

const mockProducts: Product[] = [
  { id: '1', name: 'น้ำเปล่า', price: 10, stock: 50, minStock: 20, category: 'เครื่องดื่ม', imageColor: 'bg-blue-300' },
  { id: '2', name: 'โค้กกระป๋อง', price: 15, stock: 30, minStock: 15, category: 'เครื่องดื่ม', imageColor: 'bg-red-500' },
  { id: '3', name: 'มาม่าหมูสับ', price: 7, stock: 10, minStock: 20, category: 'อาหารแห้ง', imageColor: 'bg-yellow-400' },
  { id: '4', name: 'เลย์ออริจินัล', price: 20, stock: 15, minStock: 10, category: 'ขนม', imageColor: 'bg-yellow-200' },
  { id: '5', name: 'ข้าวเกรียบ', price: 12, stock: -2, minStock: 10, category: 'ขนม', imageColor: 'bg-orange-300' },
  { id: '6', name: 'น้ำแข็งแก้ว', price: 5, stock: 100, minStock: 50, category: 'เครื่องดื่ม', imageColor: 'bg-cyan-200' },
];

const mockCustomers: Customer[] = [
  { id: 'c1', name: 'ป้าศรี', debt: 150 },
  { id: 'c2', name: 'ลุงชัย', debt: 45 },
  { id: 'c3', name: 'พี่สมชาย', debt: 0 },
];

export const useStore = create<AppState>((set, get) => ({
  inventory: mockProducts,
  updateStock: (id, newStock) => set((state) => ({
    inventory: state.inventory.map(p => p.id === id ? { ...p, stock: newStock } : p)
  })),
  updateMinStock: (id, minStock) => set((state) => ({
    inventory: state.inventory.map(p => p.id === id ? { ...p, minStock } : p)
  })),
  addProduct: (product) => set((state) => ({
    inventory: [...state.inventory, { id: 'p' + Date.now(), ...product }]
  })),
  editProduct: (id, updatedFields) => set((state) => ({
    inventory: state.inventory.map(p => p.id === id ? { ...p, ...updatedFields } : p)
  })),
  deleteProduct: (id) => set((state) => ({
    inventory: state.inventory.filter(p => p.id !== id)
  })),

  cart: [],
  addToCart: (item) => set((state) => {
    // If it's a specific product, try to group it
    if (item.productId) {
      const existingIndex = state.cart.findIndex(c => c.productId === item.productId && c.price === item.price);
      if (existingIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingIndex].qty += item.qty;
        return { cart: newCart };
      }
    }
    return { cart: [...state.cart, { id: Date.now().toString() + Math.random(), ...item }] };
  }),
  updateCartQty: (id, qty) => set((state) => ({
    cart: state.cart.map(c => c.id === id ? { ...c, qty: Math.max(1, qty) } : c)
  })),
  removeFromCart: (index) => set((state) => ({
    cart: state.cart.filter((_, i) => i !== index)
  })),
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => get().cart.reduce((total, item) => total + (item.price * item.qty), 0),

  customers: mockCustomers,
  payDebt: (id, amount) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, debt: Math.max(0, c.debt - amount) } : c)
  })),
  addCustomer: (name) => {
    const newId = 'c' + Date.now();
    set((state) => ({
      customers: [...state.customers, { id: newId, name, debt: 0 }]
    }));
    return newId;
  },

  sales: [],
  checkout: (type, customerId) => {
    const { cart, getCartTotal, inventory } = get();
    const total = getCartTotal();
    if (total === 0) return;

    set((state) => {
      // 1. Record Sale
      const newSale: Sale = {
        id: 's' + Date.now(),
        total,
        type,
        date: new Date().toISOString(),
        customerId,
        items: cart
      };

      // 2. Deduct Stock (only for items with productId)
      let newInventory = [...state.inventory];
      cart.forEach(item => {
        if (item.productId) {
          const productIndex = newInventory.findIndex(p => p.id === item.productId);
          if (productIndex >= 0) {
            newInventory[productIndex] = {
              ...newInventory[productIndex],
              stock: newInventory[productIndex].stock - item.qty
            };
          }
        }
      });

      // 3. Update Customer Debt if Credit
      let newCustomers = [...state.customers];
      if (type === 'credit' && customerId) {
        newCustomers = newCustomers.map(c => 
          c.id === customerId ? { ...c, debt: c.debt + total } : c
        );
      }

      // 4. Update Cash Register if Cash
      let newCashTransactions = [...state.cashTransactions];
      if (type === 'cash') {
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: 'in',
          amount: total,
          note: 'ขายหน้าร้าน (เงินสด)',
          date: new Date().toISOString()
        });
      }

      return {
        sales: [...state.sales, newSale],
        inventory: newInventory,
        customers: newCustomers,
        cashTransactions: newCashTransactions,
        cart: [] // Clear cart after checkout
      };
    });
  },

  voidSale: (id: string) => set((state) => {
    const sale = state.sales.find(s => s.id === id);
    if (!sale || sale.isVoided) return state;

    // 1. Revert Stock
    let newInventory = [...state.inventory];
    sale.items.forEach(item => {
      if (item.productId) {
        const productIndex = newInventory.findIndex(p => p.id === item.productId);
        if (productIndex >= 0) {
          newInventory[productIndex] = {
            ...newInventory[productIndex],
            stock: newInventory[productIndex].stock + item.qty
          };
        }
      }
    });

    // 2. Revert Customer Debt
    let newCustomers = [...state.customers];
    if (sale.type === 'credit' && sale.customerId) {
      newCustomers = newCustomers.map(c => 
        c.id === sale.customerId ? { ...c, debt: Math.max(0, c.debt - sale.total) } : c
      );
    }

    // 3. Revert Cash Register if it was cash
    let newCashTransactions = [...state.cashTransactions];
    if (sale.type === 'cash') {
      newCashTransactions.push({
        id: 'ct_void_' + Date.now(),
        type: 'out',
        amount: sale.total,
        note: `ยกเลิกบิล ${sale.id}`,
        date: new Date().toISOString()
      });
    }

    return {
      sales: state.sales.map(s => s.id === id ? { ...s, isVoided: true } : s),
      inventory: newInventory,
      customers: newCustomers,
      cashTransactions: newCashTransactions
    };
  }),

  cashTransactions: [
    { id: 'ct1', type: 'in', amount: 1000, note: 'เงินทอนตั้งต้น', date: new Date(new Date().setHours(8,0,0,0)).toISOString() }
  ],
  addCashTransaction: (type, amount, note) => set((state) => ({
    cashTransactions: [...state.cashTransactions, {
      id: 'ct' + Date.now(),
      type,
      amount,
      note,
      date: new Date().toISOString()
    }]
  })),
  getCashInDrawer: () => get().cashTransactions.reduce((total, t) => {
    return t.type === 'in' ? total + t.amount : total - t.amount;
  }, 0),

  storeSettings: {
    name: 'ร้านค้า POS แม่ค้า',
    address: '123 ถ.ทดสอบ ต.จำลอง อ.เมือง จ.กรุงเทพ 10110',
    cashFloat: 1000
  },
  updateSettings: (settings) => set((state) => {
    let newTransactions = [...state.cashTransactions];
    if (settings.cashFloat !== undefined && settings.cashFloat !== state.storeSettings.cashFloat) {
      const floatIndex = newTransactions.findIndex(t => t.id === 'ct1');
      if (floatIndex >= 0) {
        newTransactions[floatIndex] = { ...newTransactions[floatIndex], amount: settings.cashFloat };
      } else {
        newTransactions.push({ id: 'ct1', type: 'in', amount: settings.cashFloat, note: 'เงินทอนตั้งต้น', date: new Date().toISOString() });
      }
    }
    return {
      storeSettings: { ...state.storeSettings, ...settings },
      cashTransactions: newTransactions
    };
  })
}));
