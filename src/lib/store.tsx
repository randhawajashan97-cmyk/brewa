import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MENU } from "./restaurant";

type Cart = Record<string, number>;
type Ctx = {
  cart: Cart;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
  isOpen: boolean;
  setIsOpenLocal: (v: boolean) => void;
};
const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [isOpen, setIsOpenLocal] = useState(true);

  useEffect(() => {
    supabase.from("site_settings").select("is_open").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setIsOpenLocal(data.is_open);
    });
  }, []);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((s, [id, q]) => s + (MENU.find((m) => m.id === id)?.price ?? 0) * q, 0);

  return (
    <StoreContext.Provider value={{ cart, add, remove, clear: () => setCart({}), count, total, isOpen, setIsOpenLocal }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
