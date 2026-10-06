import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { MENU } from "@/lib/restaurant";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — The Highway Kitchen, Rayya" },
      { name: "description", content: "Manchurian, GT with Spinach Mushroom Corn, chilli paneer, dal makhani and more." },
      { property: "og:title", content: "Menu — The Highway Kitchen" },
      { property: "og:description", content: "Punjabi & Indo-Chinese dishes from ₹50. Add to your order online." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { cart, add, remove, count, total } = useStore();
  const categories = [...new Set(MENU.map((m) => m.category))];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-5xl text-primary">Our menu</h1>
      <p className="mt-2 text-muted-foreground">Tap + to add dishes to your order.</p>
      {categories.map((c) => (
        <section key={c} className="mt-10">
          <h2 className="border-b border-border pb-2 font-display text-2xl">{c}</h2>
          <ul className="divide-y divide-border">
            {MENU.filter((m) => m.category === c).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                  <p className="mt-1 font-bold text-primary">₹{m.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  {cart[m.id] ? (
                    <>
                      <button aria-label="Remove" onClick={() => remove(m.id)} className="rounded-full border border-border p-2"><Minus className="h-4 w-4" /></button>
                      <span className="w-5 text-center font-semibold">{cart[m.id]}</span>
                    </>
                  ) : null}
                  <button aria-label="Add" onClick={() => add(m.id)} className="rounded-full bg-primary p-2 text-primary-foreground"><Plus className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {count > 0 && (
        <Link to="/order" className="sticky bottom-24 mt-8 flex justify-between rounded-full bg-accent px-6 py-4 font-semibold text-accent-foreground shadow-lg">
          <span>{count} items · ₹{total}</span><span>Checkout →</span>
        </Link>
      )}
    </div>
  );
}
