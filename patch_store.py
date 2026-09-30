import re

with open('src/store/useStore.ts', 'r') as f:
    content = f.read()

# 1. Add Types
types_to_insert = """
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
"""

content = content.replace("export type HeldBill =", types_to_insert + "\nexport type HeldBill =")

# 2. Add AppState fields
appstate_to_insert = """
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
"""

content = content.replace("  // Settings", appstate_to_insert + "\n  // Settings")

# 3. Add Store implementation
impl_to_insert = """
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
"""

content = content.replace("      storeSettings: {", impl_to_insert + "\n      storeSettings: {")

# 4. Add to resetStore
reset_insert = """        expenses: [],
        partners: [],
        partnerTransactions: [],"""
content = content.replace("        heldBills: [],", reset_insert + "\n        heldBills: [],")

with open('src/store/useStore.ts', 'w') as f:
    f.write(content)
