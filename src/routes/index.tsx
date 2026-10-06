import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Clock, MapPin, Star, Truck, UtensilsCrossed } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { MENU, RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Highway Kitchen — Punjabi & Indo-Chinese in Rayya" },
      { name: "description", content: "Rated 4.8 on NH-1, Rayya. Dine-in, drive-through and no-contact delivery. Order online or on WhatsApp." },
      { property: "og:title", content: "The Highway Kitchen — Rayya, Punjab" },
      { property: "og:description", content: "Dine-in, drive-through and delivery on NH-1, Rayya. Order online or on WhatsApp." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = MENU.slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Manchurian, chilli paneer and naan" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-28 text-background md:py-40">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            <Star className="h-4 w-4 fill-current" /> {RESTAURANT.rating} · {RESTAURANT.reviews} Google reviews
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-5xl leading-tight md:text-7xl">{RESTAURANT.name}</h1>
          <p className="mt-4 max-w-lg text-lg opacity-90">{RESTAURANT.tagline}. {RESTAURANT.price}.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/order" className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Order now</Link>
            <Link to="/menu" className="rounded-full border border-background/60 px-6 py-3 font-semibold">See menu</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-3">
        {[
          { icon: UtensilsCrossed, t: "Dine-in", d: "Sit down with family right on the highway." },
          { icon: Car, t: "Drive-through", d: "Order ahead, pick up without leaving your car." },
          { icon: Truck, t: "No-contact delivery", d: "Hot food delivered to your door." },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-6">
            <I className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-display text-2xl">{t}</h3>
            <p className="mt-1 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl text-primary">Guest favourites</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featured.map((m) => (
            <div key={m.id} className="rounded-2xl bg-secondary p-6">
              <p className="font-display text-xl">{m.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
              <p className="mt-3 font-bold text-primary">₹{m.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 flex max-w-6xl flex-col gap-4 px-4 md:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border p-5"><Clock className="text-primary" /> {RESTAURANT.hours}</div>
        <Link to="/location" className="flex flex-1 items-center gap-3 rounded-2xl border border-border p-5 hover:border-primary"><MapPin className="text-primary" /> {RESTAURANT.address}</Link>
      </section>
    </>
  );
}
