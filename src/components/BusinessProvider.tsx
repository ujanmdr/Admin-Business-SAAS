import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { businesses } from "@/lib/nav";

type Ctx = {
  business: string;
  setBusiness: (b: string) => void;
  businesses: string[];
};

const BusinessContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "brg.activeBusiness";

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusinessState] = useState<string>(businesses[0]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && businesses.includes(stored)) setBusinessState(stored);
    } catch {}
  }, []);

  const setBusiness = useCallback((b: string) => {
    setBusinessState(b);
    try {
      localStorage.setItem(STORAGE_KEY, b);
    } catch {}
  }, []);

  return (
    <BusinessContext.Provider value={{ business, setBusiness, businesses }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used inside <BusinessProvider>");
  return ctx;
}
