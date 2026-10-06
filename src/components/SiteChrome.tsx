import { Link } from "@tanstack/react-router";
import { MessageCircle, ShoppingBag, Star } from "lucide-react";
import { RESTAURANT, whatsappLink } from "@/lib/restaurant";
import { useStore } from "@/lib/store";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/order", label: "Order" },
  { to: "/location", label: "Location" },
] as const;

export function Header() {
  const { count, isOpen } = useStore();
  return (
    <>
      {!isOpen && (
        <div className="bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
          We're currently closed — online ordering is paused. Please check back soon.
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-display text-2xl leading-none text-primary">
            {RESTAURANT.name}
          </Link>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-foreground/70 hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link to="/order" className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <ShoppingBag className="h-4 w-4" /> Order
            {count > 0 && <span className="rounded-full bg-accent px-2 text-xs text-accent-foreground">{count}</span>}
          </Link>
        </div>
        <nav className="flex justify-center gap-5 pb-2 text-sm md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-foreground/70" activeProps={{ className: "text-primary font-semibold" }} activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">{RESTAURANT.name}</p>
          <p className="mt-2 flex items-center gap-1 text-sm opacity-80">
            <Star className="h-4 w-4 fill-current" /> {RESTAURANT.rating} · {RESTAURANT.reviews} reviews
          </p>
        </div>
        <div className="text-sm opacity-90">
          <p>{RESTAURANT.address}</p>
          <p className="mt-1">{RESTAURANT.hours}</p>
        </div>
        <div className="flex flex-col gap-1 text-sm md:items-end">
          <a href={RESTAURANT.instagram} target="_blank" rel="noreferrer" className="underline">Instagram</a>
          <Link to="/admin" className="opacity-60 hover:opacity-100">Owner login</Link>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
