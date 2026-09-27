import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Product = {
  id: string;
  name: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category?: string;
  barcode?: string;
  imageColor: string;
  imageUrl?: string;
  soldCount?: number;
};

export type CartItem = {
  id: string;
  productId?: string;
  name: string;
  price: number;
  cost?: number;
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

export type CustomerTransaction = {
  id: string;
  customerId: string;
  type: 'add_debt' | 'pay_debt' | 'sale_credit' | 'void_credit';
  amount: number;
  date: string;
  note: string;
  saleId?: string;
};

export type CashTransaction = {
  id: string;
  type: 'in' | 'out';
  amount: number;
  note: string;
  date: string;
};

export type HeldBill = {
  id: string;
  items: CartItem[];
  timestamp: string;
  name?: string;
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
  addToCart: (item: { productId?: string; name: string; price: number; cost?: number; qty: number }) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  // Held Bills
  heldBills: HeldBill[];
  holdCurrentBill: () => void;
  restoreHeldBill: (id: string) => void;
  deleteHeldBill: (id: string) => void;

  // Customers
  customers: Customer[];
  customerTransactions: CustomerTransaction[];
  payDebt: (id: string, amount: number) => void;
  addCustomer: (name: string) => string;
  editCustomer: (id: string, name: string) => void;
  deleteCustomer: (id: string) => void;
  addManualDebt: (id: string, amount: number, note: string) => void;

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

  // Sync state
  isRemoteUpdate?: boolean;
  lastUpdatedLocal?: number;
  setStoreFromFirebase: (data: Partial<AppState>) => void;
  resetStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      inventory: [],
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

      heldBills: [],
      holdCurrentBill: () => set((state) => {
        if (state.cart.length === 0) return state;
        const newBill: HeldBill = {
          id: 'hb' + Date.now(),
          items: [...state.cart],
          timestamp: new Date().toISOString(),
          name: `พักบิล ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
        };
        return {
          heldBills: [...state.heldBills, newBill],
          cart: []
        };
      }),
      restoreHeldBill: (id) => set((state) => {
        const bill = state.heldBills.find(b => b.id === id);
        if (!bill) return state;
        return {
          cart: bill.items,
          heldBills: state.heldBills.filter(b => b.id !== id)
        };
      }),
      deleteHeldBill: (id) => set((state) => ({
        heldBills: state.heldBills.filter(b => b.id !== id)
      })),

      customers: [],
      customerTransactions: [],
      payDebt: (id, amount) => {
        const customer = get().customers.find(c => c.id === id);
        if (!customer) return;
        get().addCashTransaction('in', amount, `ชำระหนี้จากลูกค้า ${customer.name}`);
        const newTransaction: CustomerTransaction = {
          id: 'ctx' + Date.now(),
          customerId: id,
          type: 'pay_debt',
          amount,
          date: new Date().toISOString(),
          note: 'ชำระหนี้'
        };
        set((state) => ({
          customers: state.customers.map(c => c.id === id ? { ...c, debt: Math.max(0, c.debt - amount) } : c),
          customerTransactions: [...state.customerTransactions, newTransaction]
        }));
      },
      addCustomer: (name) => {
        const newId = 'c' + Date.now();
        set((state) => ({
          customers: [...state.customers, { id: newId, name, debt: 0 }]
        }));
        return newId;
      },
      editCustomer: (id, name) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, name } : c)
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id),
        customerTransactions: state.customerTransactions.filter(ctx => ctx.customerId !== id)
      })),
      addManualDebt: (id, amount, note) => {
        const newTransaction: CustomerTransaction = {
          id: 'ctx' + Date.now(),
          customerId: id,
          type: 'add_debt',
          amount,
          date: new Date().toISOString(),
          note
        };
        set((state) => ({
          customers: state.customers.map(c => c.id === id ? { ...c, debt: c.debt + amount } : c),
          customerTransactions: [...state.customerTransactions, newTransaction]
        }));
      },

      sales: [],
      checkout: (type, customerId) => {
        const { cart, getCartTotal } = get();
        const total = getCartTotal();
        if (total === 0) return;

        set((state) => {
          const newSale: Sale = {
            id: 's' + Date.now(),
            total,
            type,
            date: new Date().toISOString(),
            customerId,
            items: cart
          };

          let newInventory = [...state.inventory];
          cart.forEach(item => {
            if (item.productId) {
              const productIndex = newInventory.findIndex(p => p.id === item.productId);
              if (productIndex >= 0) {
                newInventory[productIndex] = {
                  ...newInventory[productIndex],
                  stock: newInventory[productIndex].stock - item.qty,
                  soldCount: (newInventory[productIndex].soldCount || 0) + item.qty
                };
              }
            }
          });

          let newCustomers = [...state.customers];
          let newCustomerTransactions = [...state.customerTransactions];
          if (type === 'credit' && customerId) {
            newCustomers = newCustomers.map(c =>
              c.id === customerId ? { ...c, debt: c.debt + total } : c
            );
            newCustomerTransactions.push({
              id: 'ctx' + Date.now(),
              customerId,
              type: 'sale_credit',
              amount: total,
              date: new Date().toISOString(),
              note: `บิลขาย ${newSale.id}`,
              saleId: newSale.id
            });
          }

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
            customerTransactions: newCustomerTransactions,
            cashTransactions: newCashTransactions,
            cart: []
          };
        });
      },

      voidSale: (id: string) => set((state) => {
        const sale = state.sales.find(s => s.id === id);
        if (!sale || sale.isVoided) return state;

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

        let newCustomers = [...state.customers];
        let newCustomerTransactions = [...state.customerTransactions];
        if (sale.type === 'credit' && sale.customerId) {
          newCustomers = newCustomers.map(c =>
            c.id === sale.customerId ? { ...c, debt: Math.max(0, c.debt - sale.total) } : c
          );
          newCustomerTransactions.push({
            id: 'ctx_void_' + Date.now(),
            customerId: sale.customerId,
            type: 'void_credit',
            amount: sale.total,
            date: new Date().toISOString(),
            note: `ยกเลิกบิล ${sale.id}`,
            saleId: sale.id
          });
        }

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
          customerTransactions: newCustomerTransactions,
          cashTransactions: newCashTransactions
        };
      }),

      cashTransactions: [],
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
        name: 'ร้านค้า POS',
        address: '',
        cashFloat: 0
      },
      updateSettings: (settings) => set((state) => {
        let newTransactions = [...state.cashTransactions];
        if (settings.cashFloat !== undefined && settings.cashFloat !== state.storeSettings.cashFloat) {
          const floatIndex = newTransactions.findIndex(t => t.id === 'ct1');
          if (floatIndex >= 0) {
            newTransactions[floatIndex] = { ...newTransactions[floatIndex], amount: settings.cashFloat };
          } else if (settings.cashFloat > 0) {
            newTransactions.push({ id: 'ct1', type: 'in', amount: settings.cashFloat, note: 'เงินทอนตั้งต้น', date: new Date().toISOString() });
          }
        }
        return {
          storeSettings: { ...state.storeSettings, ...settings },
          cashTransactions: newTransactions,
          lastUpdatedLocal: Date.now()
        };
      }),

      isRemoteUpdate: false,
      lastUpdatedLocal: 0,
      setStoreFromFirebase: (data) => set({ ...data, isRemoteUpdate: true }),
      resetStore: () => set({
        inventory: [],
        cart: [],
        sales: [],
        cashTransactions: [],
        heldBills: [],
        customers: [],
        customerTransactions: [],
        storeSettings: {
          name: 'ร้านค้า POS',
          address: '',
          cashFloat: 0
        },
        lastUpdatedLocal: 0
      })
    }),
    {
      name: 'pos-storage',
      partialize: (state) => {
        const { isRemoteUpdate, ...rest } = state;
        return rest;
      }
    }
  )
);
