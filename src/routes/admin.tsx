import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { ORDER_TYPES, STATUSES, orderTypeLabel } from "@/lib/restaurant";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner Panel — The Highway Kitchen" },
      { name: "description", content: "Manage orders and open/close the website." },
      { property: "og:title", content: "Owner Panel" },
      { property: "og:description", content: "Restaurant order management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Order = {
  id: string; customer_name: string; phone: string; order_type: string; address: string | null;
  notes: string | null; items: { name: string; qty: number; price: number }[]; total: number; status: string; created_at: string;
};

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!ready) return <div className="p-12 text-center">Loading…</div>;
  return user ? <Dashboard user={user} /> : <Login />;
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up") toast.success("Check your email to confirm your account.");
  };
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-4xl text-primary">Owner {mode === "in" ? "login" : "sign up"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">The first account created becomes the owner.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" required className="w-full rounded-xl border border-input bg-card px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required minLength={6} className="w-full rounded-xl border border-input bg-card px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">{busy ? "…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm text-primary underline">
        {mode === "in" ? "First time? Create owner account" : "Have an account? Sign in"}
      </button>
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const { isOpen, setIsOpenLocal } = useStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [typeF, setTypeF] = useState("all");
  const [statusF, setStatusF] = useState("all");

  const load = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    setOrders((data ?? []) as unknown as Order[]);
  }, []);

  useEffect(() => {
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user.id]);

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const ch = supabase.channel("orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, load]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const week = new Date(today); week.setDate(week.getDate() - 6);
    const valid = orders.filter((o) => o.status !== "cancelled");
    const todayO = valid.filter((o) => new Date(o.created_at) >= today);
    const weekO = valid.filter((o) => new Date(o.created_at) >= week);
    return {
      todayCount: todayO.length, todayRev: todayO.reduce((s, o) => s + o.total, 0),
      weekCount: weekO.length, weekRev: weekO.reduce((s, o) => s + o.total, 0),
      pending: orders.filter((o) => ["new", "preparing", "ready"].includes(o.status)).length,
      byType: ORDER_TYPES.map((t) => ({ ...t, n: valid.filter((o) => o.order_type === t.value).length })),
    };
  }, [orders]);

  const toggleSite = async (v: boolean) => {
    const { error } = await supabase.from("site_settings").update({ is_open: v, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { toast.error("Couldn't update"); return; }
    setIsOpenLocal(v);
    toast.success(v ? "Website is ON — taking orders" : "Website is OFF — ordering paused");
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("Couldn't update"); else load();
  };

  if (isAdmin === null) return <div className="p-12 text-center">Loading…</div>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p>This account doesn't have owner access.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 text-primary underline">Sign out</button>
      </div>
    );

  const shown = orders.filter((o) => (typeF === "all" || o.order_type === typeF) && (statusF === "all" || o.status === statusF));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-primary">Owner panel</h1>
        <div className="flex items-center gap-4">
          <label className={`flex items-center gap-3 rounded-full px-4 py-2 font-semibold ${isOpen ? "bg-whatsapp/15 text-foreground" : "bg-destructive/15 text-destructive"}`}>
            Website {isOpen ? "ON" : "OFF"}
            <Switch checked={isOpen} onCheckedChange={toggleSite} />
          </label>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground underline">Sign out</button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Orders today" value={stats.todayCount} />
        <Stat label="Revenue today" value={`₹${stats.todayRev}`} />
        <Stat label="Orders (7 days)" value={stats.weekCount} />
        <Stat label="Revenue (7 days)" value={`₹${stats.weekRev}`} />
        <Stat label="Active orders" value={stats.pending} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.byType.map((t) => <Stat key={t.value} label={t.label} value={t.n} subtle />)}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <select value={typeF} onChange={(e) => setTypeF(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2">
          <option value="all">All types</option>
          {ORDER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2 capitalize">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {shown.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
        {shown.map((o) => (
          <div key={o.id} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
            <div>
              <p className="font-semibold">{o.customer_name}</p>
              <a href={`tel:${o.phone}`} className="text-sm text-primary">{o.phone}</a>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
            </div>
            <div className="text-sm md:col-span-2">
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{orderTypeLabel(o.order_type)}</span>
              <p className="mt-1">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
              {o.address && <p className="text-muted-foreground">📍 {o.address}</p>}
              {o.notes && <p className="text-muted-foreground">Note: {o.notes}</p>}
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="font-bold">₹{o.total}</p>
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-lg border border-input bg-background px-2 py-1 text-sm capitalize">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, subtle }: { label: string; value: string | number; subtle?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${subtle ? "border border-border bg-card" : "bg-primary text-primary-foreground"}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
