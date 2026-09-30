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


export type Expense = {
  id: string;
  date: string;
  category: 'restock' | 'bill' | 'other';
  amount: number;
  note: string;
  paidBy: 'cash_drawer' | string; // 'cash_drawer' or partnerId
};

export type Partner = {
  id: string;
  name: string;
  balance: number; 
};

export type PartnerTransaction = {
  id: string;
  partnerId: string;
  type: 'invest' | 'withdraw';
  amount: number;
  date: string;
  note: string;
  expenseId?: string;
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
  checkout: (type: 'cash' | 'promptpay' | 'credit', customerId?: string, received?: number, change?: number) => void;
  voidSale: (id: string) => void;

  // Cash Drawer
  cashTransactions: CashTransaction[];
  addCashTransaction: (type: 'in' | 'out', amount: number, note: string) => void;
  getCashInDrawer: () => number;


  // Expenses
  expenses: Expense[];
  addExpense: (category: Expense['category'], amount: number, note: string, paidBy: string) => void;
  deleteExpense: (id: string) => void;

  // Partners
  partners: Partner[];
  partnerTransactions: PartnerTransaction[];
  addPartner: (name: string) => string;
  addPartnerTransaction: (partnerId: string, type: 'invest' | 'withdraw', amount: number, note: string) => void;
  deletePartnerTransaction: (id: string) => void;

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
      checkout: (type, customerId, received, change) => {
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
            if (received && change && change > 0) {
              newCashTransactions.push({
                id: 'ct' + Date.now() + 'in',
                type: 'in',
                amount: received,
                note: `รับเงินสด (บิล ${newSale.id})`,
                date: new Date().toISOString()
              });
              newCashTransactions.push({
                id: 'ct' + Date.now() + 'out',
                type: 'out',
                amount: change,
                note: `เงินทอน (บิล ${newSale.id})`,
                date: new Date().toISOString()
              });
            } else {
              newCashTransactions.push({
                id: 'ct' + Date.now(),
                type: 'in',
                amount: total,
                note: `ขายหน้าร้าน (บิล ${newSale.id})`,
                date: new Date().toISOString()
              });
            }
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


      // Expenses
      expenses: [],
      addExpense: (category, amount, note, paidBy) => set((state) => {
        const newExpenseId = 'exp' + Date.now();
        const newExpense: Expense = {
          id: newExpenseId,
          date: new Date().toISOString(),
          category,
          amount,
          note,
          paidBy
        };

        let newCashTransactions = [...state.cashTransactions];
        let newPartners = [...state.partners];
        let newPartnerTransactions = [...state.partnerTransactions];

        if (paidBy === 'cash_drawer') {
          newCashTransactions.push({
            id: 'ct' + Date.now(),
            type: 'out',
            amount,
            note: `รายจ่าย: ${note}`,
            date: new Date().toISOString()
          });
        } else {
          // Paid by partner -> partner balance increases
          newPartners = newPartners.map(p => 
            p.id === paidBy ? { ...p, balance: p.balance + amount } : p
          );
          newPartnerTransactions.push({
            id: 'ptx' + Date.now(),
            partnerId: paidBy,
            type: 'invest',
            amount,
            date: new Date().toISOString(),
            note: `สำรองจ่าย: ${note}`,
            expenseId: newExpenseId
          });
        }

        return {
          expenses: [...state.expenses, newExpense],
          cashTransactions: newCashTransactions,
          partners: newPartners,
          partnerTransactions: newPartnerTransactions
        };
      }),
      deleteExpense: (id) => set((state) => {
        const expense = state.expenses.find(e => e.id === id);
        if (!expense) return state;

        let newCashTransactions = [...state.cashTransactions];
        let newPartners = [...state.partners];
        let newPartnerTransactions = [...state.partnerTransactions];

        if (expense.paidBy === 'cash_drawer') {
          // Remove the corresponding cash transaction out if possible, 
          // or just add a refund transaction
          newCashTransactions.push({
            id: 'ct' + Date.now(),
            type: 'in',
            amount: expense.amount,
            note: `ยกเลิกรายจ่าย: ${expense.note}`,
            date: new Date().toISOString()
          });
        } else {
          // Remove from partner balance
          newPartners = newPartners.map(p => 
            p.id === expense.paidBy ? { ...p, balance: p.balance - expense.amount } : p
          );
          newPartnerTransactions.push({
            id: 'ptx' + Date.now(),
            partnerId: expense.paidBy,
            type: 'withdraw',
            amount: expense.amount,
            date: new Date().toISOString(),
            note: `ยกเลิกรายการจ่าย: ${expense.note}`,
            expenseId: id
          });
        }

        return {
          expenses: state.expenses.filter(e => e.id !== id),
          cashTransactions: newCashTransactions,
          partners: newPartners,
          partnerTransactions: newPartnerTransactions
        };
      }),

      // Partners
      partners: [],
      partnerTransactions: [],
      addPartner: (name) => {
        const newId = 'ptr' + Date.now();
        set((state) => ({
          partners: [...state.partners, { id: newId, name, balance: 0 }]
        }));
        return newId;
      },
      addPartnerTransaction: (partnerId, type, amount, note) => set((state) => {
        const newPartnerTransactions = [...state.partnerTransactions, {
          id: 'ptx' + Date.now(),
          partnerId,
          type,
          amount,
          date: new Date().toISOString(),
          note
        }];

        const newPartners = state.partners.map(p => {
          if (p.id === partnerId) {
            return {
              ...p,
              balance: type === 'invest' ? p.balance + amount : p.balance - amount
            };
          }
          return p;
        });

        // If a partner invests/withdraws cash to/from the drawer directly
        // We might want to add cash drawer logic here, but let's assume partner transactions 
        // normally go into the bank/drawer. 
        // For simplicity, let's also add it to cashTransactions if they put it in the drawer.
        // Wait, not all investments go to drawer (e.g. they pay for stuff directly).
        // Let's leave drawer separate or assume all partner 'invest/withdraw' affects the drawer?
        // Let's assume it affects the drawer! If Mom gives 5000, it goes to the drawer.
        let newCashTransactions = [...state.cashTransactions];
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: type === 'invest' ? 'in' : 'out',
          amount,
          note: `หุ้นส่วน ${type === 'invest' ? 'นำเงินเข้าร้าน' : 'ถอนเงิน'}: ${note}`,
          date: new Date().toISOString()
        });

        return {
          partners: newPartners,
          partnerTransactions: newPartnerTransactions,
          cashTransactions: newCashTransactions
        };
      }),
      deletePartnerTransaction: (id) => set((state) => {
        const ptx = state.partnerTransactions.find(t => t.id === id);
        if (!ptx) return state;

        const newPartners = state.partners.map(p => {
          if (p.id === ptx.partnerId) {
            return {
              ...p,
              balance: ptx.type === 'invest' ? p.balance - ptx.amount : p.balance + ptx.amount
            };
          }
          return p;
        });

        let newCashTransactions = [...state.cashTransactions];
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: ptx.type === 'invest' ? 'out' : 'in',
          amount: ptx.amount,
          note: `ยกเลิกรายการหุ้นส่วน: ${ptx.note}`,
          date: new Date().toISOString()
        });

        return {
          partners: newPartners,
          partnerTransactions: state.partnerTransactions.filter(t => t.id !== id),
          cashTransactions: newCashTransactions
        };
      }),

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
    
      // Expenses
      expenses: [],
      addExpense: (category, amount, note, paidBy) => set((state) => {
        const newExpenseId = 'exp' + Date.now();
        const newExpense: Expense = {
          id: newExpenseId,
          date: new Date().toISOString(),
          category,
          amount,
          note,
          paidBy
        };

        let newCashTransactions = [...state.cashTransactions];
        let newPartners = [...state.partners];
        let newPartnerTransactions = [...state.partnerTransactions];

        if (paidBy === 'cash_drawer') {
          newCashTransactions.push({
            id: 'ct' + Date.now(),
            type: 'out',
            amount,
            note: `รายจ่าย: ${note}`,
            date: new Date().toISOString()
          });
        } else {
          // Paid by partner -> partner balance increases
          newPartners = newPartners.map(p => 
            p.id === paidBy ? { ...p, balance: p.balance + amount } : p
          );
          newPartnerTransactions.push({
            id: 'ptx' + Date.now(),
            partnerId: paidBy,
            type: 'invest',
            amount,
            date: new Date().toISOString(),
            note: `สำรองจ่าย: ${note}`,
            expenseId: newExpenseId
          });
        }

        return {
          expenses: [...state.expenses, newExpense],
          cashTransactions: newCashTransactions,
          partners: newPartners,
          partnerTransactions: newPartnerTransactions
        };
      }),
      deleteExpense: (id) => set((state) => {
        const expense = state.expenses.find(e => e.id === id);
        if (!expense) return state;

        let newCashTransactions = [...state.cashTransactions];
        let newPartners = [...state.partners];
        let newPartnerTransactions = [...state.partnerTransactions];

        if (expense.paidBy === 'cash_drawer') {
          // Remove the corresponding cash transaction out if possible, 
          // or just add a refund transaction
          newCashTransactions.push({
            id: 'ct' + Date.now(),
            type: 'in',
            amount: expense.amount,
            note: `ยกเลิกรายจ่าย: ${expense.note}`,
            date: new Date().toISOString()
          });
        } else {
          // Remove from partner balance
          newPartners = newPartners.map(p => 
            p.id === expense.paidBy ? { ...p, balance: p.balance - expense.amount } : p
          );
          newPartnerTransactions.push({
            id: 'ptx' + Date.now(),
            partnerId: expense.paidBy,
            type: 'withdraw',
            amount: expense.amount,
            date: new Date().toISOString(),
            note: `ยกเลิกรายการจ่าย: ${expense.note}`,
            expenseId: id
          });
        }

        return {
          expenses: state.expenses.filter(e => e.id !== id),
          cashTransactions: newCashTransactions,
          partners: newPartners,
          partnerTransactions: newPartnerTransactions
        };
      }),

      // Partners
      partners: [],
      partnerTransactions: [],
      addPartner: (name) => {
        const newId = 'ptr' + Date.now();
        set((state) => ({
          partners: [...state.partners, { id: newId, name, balance: 0 }]
        }));
        return newId;
      },
      addPartnerTransaction: (partnerId, type, amount, note) => set((state) => {
        const newPartnerTransactions = [...state.partnerTransactions, {
          id: 'ptx' + Date.now(),
          partnerId,
          type,
          amount,
          date: new Date().toISOString(),
          note
        }];

        const newPartners = state.partners.map(p => {
          if (p.id === partnerId) {
            return {
              ...p,
              balance: type === 'invest' ? p.balance + amount : p.balance - amount
            };
          }
          return p;
        });

        // If a partner invests/withdraws cash to/from the drawer directly
        // We might want to add cash drawer logic here, but let's assume partner transactions 
        // normally go into the bank/drawer. 
        // For simplicity, let's also add it to cashTransactions if they put it in the drawer.
        // Wait, not all investments go to drawer (e.g. they pay for stuff directly).
        // Let's leave drawer separate or assume all partner 'invest/withdraw' affects the drawer?
        // Let's assume it affects the drawer! If Mom gives 5000, it goes to the drawer.
        let newCashTransactions = [...state.cashTransactions];
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: type === 'invest' ? 'in' : 'out',
          amount,
          note: `หุ้นส่วน ${type === 'invest' ? 'นำเงินเข้าร้าน' : 'ถอนเงิน'}: ${note}`,
          date: new Date().toISOString()
        });

        return {
          partners: newPartners,
          partnerTransactions: newPartnerTransactions,
          cashTransactions: newCashTransactions
        };
      }),
      deletePartnerTransaction: (id) => set((state) => {
        const ptx = state.partnerTransactions.find(t => t.id === id);
        if (!ptx) return state;

        const newPartners = state.partners.map(p => {
          if (p.id === ptx.partnerId) {
            return {
              ...p,
              balance: ptx.type === 'invest' ? p.balance - ptx.amount : p.balance + ptx.amount
            };
          }
          return p;
        });

        let newCashTransactions = [...state.cashTransactions];
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: ptx.type === 'invest' ? 'out' : 'in',
          amount: ptx.amount,
          note: `ยกเลิกรายการหุ้นส่วน: ${ptx.note}`,
          date: new Date().toISOString()
        });

        return {
          partners: newPartners,
          partnerTransactions: state.partnerTransactions.filter(t => t.id !== id),
          cashTransactions: newCashTransactions
        };
      }),

      storeSettings: { ...state.storeSettings, ...settings },
          cashTransactions: newTransactions,
          lastUpdatedLocal: Date.now()
        };
      }),

      lastUpdatedLocal: 0,
      setStoreFromFirebase: (data) => set({ ...data }),
      resetStore: () => set({
        inventory: [],
        cart: [],
        sales: [],
        cashTransactions: [],
        expenses: [],
        partners: [],
        partnerTransactions: [],
        heldBills: [],
        customers: [],
        customerTransactions: [],
  
      // Expenses
      expenses: [],
      addExpense: (category, amount, note, paidBy) => set((state) => {
        const newExpenseId = 'exp' + Date.now();
        const newExpense: Expense = {
          id: newExpenseId,
          date: new Date().toISOString(),
          category,
          amount,
          note,
          paidBy
        };

        let newCashTransactions = [...state.cashTransactions];
        let newPartners = [...state.partners];
        let newPartnerTransactions = [...state.partnerTransactions];

        if (paidBy === 'cash_drawer') {
          newCashTransactions.push({
            id: 'ct' + Date.now(),
            type: 'out',
            amount,
            note: `รายจ่าย: ${note}`,
            date: new Date().toISOString()
          });
        } else {
          // Paid by partner -> partner balance increases
          newPartners = newPartners.map(p => 
            p.id === paidBy ? { ...p, balance: p.balance + amount } : p
          );
          newPartnerTransactions.push({
            id: 'ptx' + Date.now(),
            partnerId: paidBy,
            type: 'invest',
            amount,
            date: new Date().toISOString(),
            note: `สำรองจ่าย: ${note}`,
            expenseId: newExpenseId
          });
        }

        return {
          expenses: [...state.expenses, newExpense],
          cashTransactions: newCashTransactions,
          partners: newPartners,
          partnerTransactions: newPartnerTransactions
        };
      }),
      deleteExpense: (id) => set((state) => {
        const expense = state.expenses.find(e => e.id === id);
        if (!expense) return state;

        let newCashTransactions = [...state.cashTransactions];
        let newPartners = [...state.partners];
        let newPartnerTransactions = [...state.partnerTransactions];

        if (expense.paidBy === 'cash_drawer') {
          // Remove the corresponding cash transaction out if possible, 
          // or just add a refund transaction
          newCashTransactions.push({
            id: 'ct' + Date.now(),
            type: 'in',
            amount: expense.amount,
            note: `ยกเลิกรายจ่าย: ${expense.note}`,
            date: new Date().toISOString()
          });
        } else {
          // Remove from partner balance
          newPartners = newPartners.map(p => 
            p.id === expense.paidBy ? { ...p, balance: p.balance - expense.amount } : p
          );
          newPartnerTransactions.push({
            id: 'ptx' + Date.now(),
            partnerId: expense.paidBy,
            type: 'withdraw',
            amount: expense.amount,
            date: new Date().toISOString(),
            note: `ยกเลิกรายการจ่าย: ${expense.note}`,
            expenseId: id
          });
        }

        return {
          expenses: state.expenses.filter(e => e.id !== id),
          cashTransactions: newCashTransactions,
          partners: newPartners,
          partnerTransactions: newPartnerTransactions
        };
      }),

      // Partners
      partners: [],
      partnerTransactions: [],
      addPartner: (name) => {
        const newId = 'ptr' + Date.now();
        set((state) => ({
          partners: [...state.partners, { id: newId, name, balance: 0 }]
        }));
        return newId;
      },
      addPartnerTransaction: (partnerId, type, amount, note) => set((state) => {
        const newPartnerTransactions = [...state.partnerTransactions, {
          id: 'ptx' + Date.now(),
          partnerId,
          type,
          amount,
          date: new Date().toISOString(),
          note
        }];

        const newPartners = state.partners.map(p => {
          if (p.id === partnerId) {
            return {
              ...p,
              balance: type === 'invest' ? p.balance + amount : p.balance - amount
            };
          }
          return p;
        });

        // If a partner invests/withdraws cash to/from the drawer directly
        // We might want to add cash drawer logic here, but let's assume partner transactions 
        // normally go into the bank/drawer. 
        // For simplicity, let's also add it to cashTransactions if they put it in the drawer.
        // Wait, not all investments go to drawer (e.g. they pay for stuff directly).
        // Let's leave drawer separate or assume all partner 'invest/withdraw' affects the drawer?
        // Let's assume it affects the drawer! If Mom gives 5000, it goes to the drawer.
        let newCashTransactions = [...state.cashTransactions];
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: type === 'invest' ? 'in' : 'out',
          amount,
          note: `หุ้นส่วน ${type === 'invest' ? 'นำเงินเข้าร้าน' : 'ถอนเงิน'}: ${note}`,
          date: new Date().toISOString()
        });

        return {
          partners: newPartners,
          partnerTransactions: newPartnerTransactions,
          cashTransactions: newCashTransactions
        };
      }),
      deletePartnerTransaction: (id) => set((state) => {
        const ptx = state.partnerTransactions.find(t => t.id === id);
        if (!ptx) return state;

        const newPartners = state.partners.map(p => {
          if (p.id === ptx.partnerId) {
            return {
              ...p,
              balance: ptx.type === 'invest' ? p.balance - ptx.amount : p.balance + ptx.amount
            };
          }
          return p;
        });

        let newCashTransactions = [...state.cashTransactions];
        newCashTransactions.push({
          id: 'ct' + Date.now(),
          type: ptx.type === 'invest' ? 'out' : 'in',
          amount: ptx.amount,
          note: `ยกเลิกรายการหุ้นส่วน: ${ptx.note}`,
          date: new Date().toISOString()
        });

        return {
          partners: newPartners,
          partnerTransactions: state.partnerTransactions.filter(t => t.id !== id),
          cashTransactions: newCashTransactions
        };
      }),

      storeSettings: {
          name: 'ร้านค้า POS',
          address: '',
          cashFloat: 0
        },
        lastUpdatedLocal: 0
      })
    }),
    {
      name: 'pos-storage'
    }
  )
);
