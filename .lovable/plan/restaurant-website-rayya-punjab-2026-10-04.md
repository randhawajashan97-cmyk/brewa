# Restaurant website — Rayya, Punjab

Based on the Google Maps listing (4.8 rating, ₹200–800, NH-1 opp. Axis Bank, Rayya, opens 10:30 am, dine-in / drive-through / no-contact delivery).

## Pages
- **Home** — big welcome section, rating badge, services (dine-in, drive-through, delivery), opening hours, featured dishes (Manchurian, GT with Spinach Mushroom Corn).
- **Menu** — sample dishes with prices in ₹ (placeholders until real menu is shared), add-to-order.
- **Order** — customer picks order type: Dine-in, Takeaway, Drive-through or Delivery; enters name, phone, address (delivery only); submits.
- **Location** — embedded Google map of NH-1, Rayya, address, "Get directions" button.
- **Owner panel** (login required) — data panel for all orders.

## Requested features
1. **WhatsApp button** — floating green button on every page, opens WhatsApp chat with a pre-filled message. Order page also offers "Send order on WhatsApp".
2. **Orders data panel** — totals today / this week, revenue, count per order type, list with filters (type, status), status updates (New → Preparing → Ready → Completed / Cancelled).
3. **Map location** — Google map embed at the restaurant address.
4. **Website on/off button** — in the owner panel. When OFF, the site stays visible but shows a "Currently closed" banner and ordering is blocked.

## Placeholders to confirm
Restaurant name, WhatsApp number and real menu prices are not in the listing — sample values will be used until provided.

## Technical details
- Lovable Cloud: tables `orders`, `order_items`, `site_settings` (is_open flag), `user_roles` with admin role; email login for owner.
- Public can insert orders and read settings/menu; only admin reads orders and toggles settings (RLS + has_role).
- Server functions for order placement (rejects when closed).
- Map via Google Maps embed iframe (no key needed for basic embed).
- Warm Punjabi palette (saffron, deep maroon, cream), distinctive display font.
