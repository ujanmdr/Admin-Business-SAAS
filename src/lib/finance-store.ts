import { create } from "zustand";

export interface FinanceState {
  cashInHand: number;
  bankBalance: number;
  todaysSales: number;
  todaysExpenses: number;
  customerDues: number;
  supplierDues: number;
  
  addExpense: (amount: number, from: "cash" | "bank") => void;
  moveMoney: (amount: number, from: "cash" | "bank", to: "cash" | "bank") => void;
  closeDay: (actualCash: number) => { expected: number; difference: number };
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  cashInHand: 42500,
  bankBalance: 185000,
  todaysSales: 38500,
  todaysExpenses: 2500,
  customerDues: 15000,
  supplierDues: 12500,

  addExpense: (amount, from) => set((state) => {
    const newState = { todaysExpenses: state.todaysExpenses + amount };
    if (from === "cash") {
      return { ...newState, cashInHand: state.cashInHand - amount };
    } else {
      return { ...newState, bankBalance: state.bankBalance - amount };
    }
  }),

  moveMoney: (amount, from, to) => set((state) => {
    if (from === to) return state;
    
    let { cashInHand, bankBalance } = state;
    
    if (from === "cash") {
      cashInHand -= amount;
    } else {
      bankBalance -= amount;
    }

    if (to === "cash") {
      cashInHand += amount;
    } else {
      bankBalance += amount;
    }

    return { cashInHand, bankBalance };
  }),

  closeDay: (actualCash) => {
    const state = get();
    const expected = state.cashInHand;
    const difference = actualCash - expected;
    return { expected, difference };
  }
}));
