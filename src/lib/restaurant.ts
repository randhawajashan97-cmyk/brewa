export const RESTAURANT = {
  name: "The Highway Kitchen",
  tagline: "Punjabi & Indo-Chinese on NH-1, Rayya",
  whatsapp: "919999999999", // placeholder — replace with real number
  address: "NH-1, opp. Axis Bank, Rayya, Punjab 143112",
  plusCode: "G6PW+F6 Rayya, Punjab",
  hours: "Daily · 10:30 am – 11:00 pm",
  rating: 4.8,
  reviews: 48,
  price: "₹200–800 per person",
  instagram: "https://instagram.com",
};

export const MAP_QUERY = encodeURIComponent("G6PW+F6 Rayya, Punjab 143112");
export const MAP_EMBED = `https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`;
export const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

export const whatsappLink = (text = "Hello! I'd like to place an order.") =>
  `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(text)}`;

export type MenuItem = { id: string; name: string; price: number; category: string; veg: boolean; desc: string };

export const MENU: MenuItem[] = [
  { id: "gt-smc", name: "GT with Spinach Mushroom Corn", price: 280, category: "Signature", veg: true, desc: "House favourite — creamy spinach, mushroom & sweet corn." },
  { id: "manchurian", name: "Veg Manchurian", price: 180, category: "Indo-Chinese", veg: true, desc: "Crispy veg balls tossed in a tangy garlic sauce." },
  { id: "chilli-paneer", name: "Chilli Paneer", price: 240, category: "Indo-Chinese", veg: true, desc: "Wok-tossed paneer with peppers & onion." },
  { id: "hakka", name: "Hakka Noodles", price: 160, category: "Indo-Chinese", veg: true, desc: "Smoky street-style noodles." },
  { id: "spring-roll", name: "Spring Rolls", price: 150, category: "Indo-Chinese", veg: true, desc: "Crisp rolls with sweet chilli dip." },
  { id: "dal-makhani", name: "Dal Makhani", price: 220, category: "Punjabi", veg: true, desc: "Slow-cooked black lentils, butter & cream." },
  { id: "paneer-butter", name: "Paneer Butter Masala", price: 260, category: "Punjabi", veg: true, desc: "Rich tomato-butter gravy." },
  { id: "butter-naan", name: "Butter Naan", price: 50, category: "Breads", veg: true, desc: "Fresh from the tandoor." },
  { id: "lassi", name: "Sweet Lassi", price: 80, category: "Drinks", veg: true, desc: "Thick Punjabi lassi." },
];

export const ORDER_TYPES = [
  { value: "dine_in", label: "Dine-in" },
  { value: "takeaway", label: "Takeaway" },
  { value: "drive_through", label: "Drive-through" },
  { value: "delivery", label: "Delivery" },
] as const;
export type OrderType = (typeof ORDER_TYPES)[number]["value"];
export const orderTypeLabel = (v: string) => ORDER_TYPES.find((o) => o.value === v)?.label ?? v;

export const STATUSES = ["new", "preparing", "ready", "completed", "cancelled"] as const;
