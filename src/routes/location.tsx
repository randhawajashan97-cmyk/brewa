import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Navigation } from "lucide-react";
import { MAP_DIRECTIONS, MAP_EMBED, RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Location — The Highway Kitchen, NH-1 Rayya" },
      { name: "description", content: "Find us on NH-1, opposite Axis Bank, Rayya, Punjab 143112." },
      { property: "og:title", content: "Find The Highway Kitchen" },
      { property: "og:description", content: "NH-1, opp. Axis Bank, Rayya, Punjab. Get directions." },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-5xl text-primary">Find us</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <p className="flex gap-3"><MapPin className="shrink-0 text-primary" /> {RESTAURANT.address}<br />{RESTAURANT.plusCode}</p>
          <p className="flex gap-3"><Clock className="shrink-0 text-primary" /> {RESTAURANT.hours}</p>
          <a href={MAP_DIRECTIONS} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">
            <Navigation className="h-4 w-4" /> Get directions
          </a>
        </div>
        <iframe title="Map" src={MAP_EMBED} loading="lazy" className="h-[420px] w-full rounded-2xl border border-border md:col-span-2" />
      </div>
    </div>
  );
}
