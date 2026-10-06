import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MENU, ORDER_TYPES, orderTypeLabel, whatsappLink, type OrderType } from "@/lib/restaurant";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Order Online — The Highway Kitchen" },
      { name: "description", content: "Order for dine-in, takeaway, drive-through or delivery in Rayya." },
      { property: "og:title", content: "Order from The Highway Kitchen" },
      { property: "og:description", content: "Dine-in, takeaway, drive-through or delivery — order online or via WhatsApp." },
    ],
  }),
  component: OrderPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  phone: z.string().trim().regex(/^[0-9+\s-]{6,20}$/, "Enter a valid phone number"),
  address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(300).optional(),
});

function OrderPage() {
  const { cart, add, remove, clear, total, count, isOpen } = useStore();
  const [type, setType] = useState<OrderType>("dine_in");
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const items = Object.entries(cart).map(([id, qty]) => {
    const m = MENU.find((x) => x.id === id)!;
    return { id, name: m.name, price: m.price, qty };
  });

  const waText = () =>
    `New ${orderTypeLabel(type)} order\n${items.map((i) => `${i.qty} x ${i.name} - ₹${i.price * i.qty}`).join("\n")}\nTotal: ₹${total}\nName: ${form.name}\nPhone: ${form.phone}${type === "delivery" ? `\nAddress: ${form.address}` : ""}${form.notes ? `\nNotes: ${form.notes}` : ""}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpen) { toast.error("We're closed right now."); return; }
    if (!count) { toast.error("Add at least one dish."); return; }
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Check your details"); return; }
    if (type === "delivery" && !form.address.trim()) { toast.error("Enter delivery address"); return; }
    setBusy(true);
    const { error } = await supabase.from("orders").insert({
      customer_name: r.data.name,
      phone: r.data.phone,
      order_type: type,
      address: type === "delivery" ? r.data.address || null : null,
      notes: r.data.notes || null,
      items,
      total,
    });
    setBusy(false);
    if (error) { toast.error("Couldn't place order. Please try WhatsApp."); return; }
    setDone(true);
    clear();
  };

  if (done)
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-primary">Order received!</h1>
        <p className="mt-3 text-muted-foreground">Thank you. We'll call you shortly to confirm.</p>
        <Link to="/menu" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Back to menu</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-5">
      <div className="md:col-span-3">
        <h1 className="font-display text-5xl text-primary">Your order</h1>
        {!isOpen && <p className="mt-4 rounded-xl bg-destructive/10 p-4 text-destructive">Ordering is paused — we're currently closed.</p>}
        {items.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Your order is empty. <Link to="/menu" className="text-primary underline">Browse the menu</Link></p>
        ) : (
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between p-4">
                <div><p className="font-semibold">{i.name}</p><p className="text-sm text-muted-foreground">₹{i.price} each</p></div>
                <div className="flex items-center gap-2">
                  <button aria-label="Remove" onClick={() => remove(i.id)} className="rounded-full border border-border p-1.5"><Minus className="h-4 w-4" /></button>
                  <span className="w-5 text-center">{i.qty}</span>
                  <button aria-label="Add" onClick={() => add(i.id)} className="rounded-full border border-border p-1.5"><Plus className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
            <li className="flex justify-between p-4 font-bold"><span>Total</span><span>₹{total}</span></li>
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-secondary p-6 md:col-span-2">
        <p className="font-semibold">How would you like it?</p>
        <div className="grid grid-cols-2 gap-2">
          {ORDER_TYPES.map((o) => (
            <button type="button" key={o.value} onClick={() => setType(o.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${type === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
              {o.label}
            </button>
          ))}
        </div>
        <input className="w-full rounded-xl border border-input bg-card px-3 py-2" placeholder="Your name" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded-xl border border-input bg-card px-3 py-2" placeholder="Phone number" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {type === "delivery" && (
          <textarea className="w-full rounded-xl border border-input bg-card px-3 py-2" placeholder="Delivery address" maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        )}
        <textarea className="w-full rounded-xl border border-input bg-card px-3 py-2" placeholder="Notes (optional)" maxLength={300} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button disabled={busy || !isOpen} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Placing…" : `Place order · ₹${total}`}
        </button>
        <a href={whatsappLink(waText())} target="_blank" rel="noreferrer"
          className={`flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp py-3 font-semibold text-whatsapp-foreground ${!count ? "pointer-events-none opacity-50" : ""}`}>
          <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
        </a>
      </form>
    </div>
  );
}
