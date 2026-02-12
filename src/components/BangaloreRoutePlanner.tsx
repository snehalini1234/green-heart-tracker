import { useState } from "react";
import { MapPin, Navigation, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TRANSPORT_FACTORS } from "@/lib/carbonCalculator";

interface Location {
  id: string;
  name: string;
  area: string;
}

const BANGALORE_LOCATIONS: Location[] = [
  { id: "mg_road", name: "MG Road", area: "Central" },
  { id: "koramangala", name: "Koramangala", area: "South-East" },
  { id: "indiranagar", name: "Indiranagar", area: "East" },
  { id: "whitefield", name: "Whitefield", area: "East" },
  { id: "electronic_city", name: "Electronic City", area: "South" },
  { id: "hsr_layout", name: "HSR Layout", area: "South-East" },
  { id: "jayanagar", name: "Jayanagar", area: "South" },
  { id: "malleshwaram", name: "Malleshwaram", area: "North-West" },
  { id: "yelahanka", name: "Yelahanka", area: "North" },
  { id: "marathahalli", name: "Marathahalli", area: "East" },
  { id: "banashankari", name: "Banashankari", area: "South" },
  { id: "hebbal", name: "Hebbal", area: "North" },
  { id: "kempegowda_bus", name: "Majestic (Kempegowda)", area: "Central" },
  { id: "rajajinagar", name: "Rajajinagar", area: "West" },
  { id: "btm_layout", name: "BTM Layout", area: "South" },
  { id: "jp_nagar", name: "JP Nagar", area: "South" },
  { id: "kr_puram", name: "KR Puram", area: "East" },
  { id: "airport", name: "Kempegowda Airport", area: "North" },
];

// Approximate distance matrix (km) — simplified
const DISTANCE_MAP: Record<string, Record<string, number>> = {};
BANGALORE_LOCATIONS.forEach((a) => {
  DISTANCE_MAP[a.id] = {};
  BANGALORE_LOCATIONS.forEach((b) => {
    if (a.id === b.id) {
      DISTANCE_MAP[a.id][b.id] = 0;
    } else {
      // Simple heuristic distance based on area proximity
      const areaDistances: Record<string, Record<string, number>> = {
        Central: { Central: 3, "South-East": 8, East: 7, South: 10, "North-West": 6, North: 14, West: 5 },
        "South-East": { Central: 8, "South-East": 4, East: 6, South: 7, "North-West": 14, North: 18, West: 12 },
        East: { Central: 7, "South-East": 6, East: 5, South: 12, "North-West": 15, North: 16, West: 14 },
        South: { Central: 10, "South-East": 7, East: 12, South: 5, "North-West": 16, North: 22, West: 14 },
        "North-West": { Central: 6, "South-East": 14, East: 15, South: 16, "North-West": 4, North: 10, West: 5 },
        North: { Central: 14, "South-East": 18, East: 16, South: 22, "North-West": 10, North: 5, West: 12 },
        West: { Central: 5, "South-East": 12, East: 14, South: 14, "North-West": 5, North: 12, West: 4 },
      };
      const d = areaDistances[a.area]?.[b.area] ?? 10;
      // Add some variation
      DISTANCE_MAP[a.id][b.id] = d + Math.round((a.id.length + b.id.length) % 5);
    }
  });
});

interface RouteOption {
  mode: string;
  label: string;
  emission: number;
  time_min: number;
  cost_inr: number;
  isSafest: boolean;
  isGreenest: boolean;
}

function getRouteOptions(from: string, to: string): RouteOption[] {
  const dist = DISTANCE_MAP[from]?.[to] ?? 10;

  const options: RouteOption[] = [
    {
      mode: "metro",
      label: "Namma Metro",
      emission: Math.round(dist * TRANSPORT_FACTORS.metro.factor * 100) / 100,
      time_min: Math.round(dist * 2.5 + 10),
      cost_inr: Math.round(dist * 2.5 + 10),
      isSafest: true,
      isGreenest: false,
    },
    {
      mode: "bus",
      label: "BMTC Bus",
      emission: Math.round(dist * TRANSPORT_FACTORS.bus.factor * 100) / 100,
      time_min: Math.round(dist * 3.5 + 15),
      cost_inr: Math.round(dist * 1.5 + 5),
      isSafest: false,
      isGreenest: false,
    },
    {
      mode: "autorickshaw",
      label: "Auto-Rickshaw",
      emission: Math.round(dist * TRANSPORT_FACTORS.autorickshaw.factor * 100) / 100,
      time_min: Math.round(dist * 2.2 + 5),
      cost_inr: Math.round(dist * 8 + 30),
      isSafest: false,
      isGreenest: false,
    },
    {
      mode: "bike",
      label: "Two-Wheeler",
      emission: Math.round(dist * TRANSPORT_FACTORS.bike.factor * 100) / 100,
      time_min: Math.round(dist * 2 + 5),
      cost_inr: Math.round(dist * 3),
      isSafest: false,
      isGreenest: false,
    },
    {
      mode: "cab",
      label: "Cab / Ride-share",
      emission: Math.round(dist * TRANSPORT_FACTORS.cab.factor * 100) / 100,
      time_min: Math.round(dist * 2 + 8),
      cost_inr: Math.round(dist * 14 + 50),
      isSafest: false,
      isGreenest: false,
    },
    {
      mode: "walk",
      label: "Walk / Cycle",
      emission: 0,
      time_min: dist <= 5 ? Math.round(dist * 12) : 999,
      cost_inr: 0,
      isSafest: false,
      isGreenest: true,
    },
  ];

  // Filter walk if too far
  const filtered = options.filter((o) => o.time_min < 900);

  // Mark greenest (lowest emission > 0 if walk not feasible)
  const sorted = [...filtered].sort((a, b) => a.emission - b.emission);
  if (sorted.length > 0) {
    sorted[0].isGreenest = true;
  }

  // Mark safest (metro > bus > cab)
  const safetyOrder = ["metro", "bus", "cab", "walk", "autorickshaw", "bike"];
  filtered.forEach((o) => (o.isSafest = false));
  for (const mode of safetyOrder) {
    const found = filtered.find((o) => o.mode === mode);
    if (found) {
      found.isSafest = true;
      break;
    }
  }

  return filtered.sort((a, b) => a.emission - b.emission);
}

const BangaloreRoutePlanner = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routes, setRoutes] = useState<RouteOption[] | null>(null);

  const handlePlan = () => {
    if (!from || !to || from === to) return;
    setRoutes(getRouteOptions(from, to));
  };

  const dist = from && to && from !== to ? (DISTANCE_MAP[from]?.[to] ?? 0) : 0;

  return (
    <div className="glass-card rounded-xl p-6 eco-shadow space-y-5">
      <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
        <Navigation className="h-5 w-5 text-primary" />
        Bangalore Eco Route Planner
      </h3>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> From
          </Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Origin" />
            </SelectTrigger>
            <SelectContent>
              {BANGALORE_LOCATIONS.map((loc) => (
                <SelectItem key={loc.id} value={loc.id} disabled={loc.id === to}>
                  {loc.name} <span className="text-muted-foreground">({loc.area})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground mb-2" />
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> To
          </Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              {BANGALORE_LOCATIONS.map((loc) => (
                <SelectItem key={loc.id} value={loc.id} disabled={loc.id === from}>
                  {loc.name} <span className="text-muted-foreground">({loc.area})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handlePlan}
        disabled={!from || !to || from === to}
        className="w-full gradient-eco text-primary-foreground font-semibold"
        size="sm"
      >
        Find Eco Routes
      </Button>

      {routes && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Approx. distance: <span className="font-semibold text-foreground">{dist} km</span>
          </p>
          {routes.map((r) => (
            <div
              key={r.mode}
              className={`rounded-lg p-3 border transition-all ${
                r.isGreenest
                  ? "bg-secondary border-primary/40 ring-1 ring-primary/20"
                  : r.isSafest
                  ? "bg-accent/5 border-accent/30"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{r.label}</span>
                <div className="flex gap-1">
                  {r.isGreenest && (
                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                      <Leaf className="h-2.5 w-2.5" /> Greenest
                    </span>
                  )}
                  {r.isSafest && (
                    <span className="text-[10px] bg-accent/15 text-accent-foreground px-1.5 py-0.5 rounded-full font-medium">
                      🛡️ Safest
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{r.emission} kg CO₂</span>
                <span>~{r.time_min} min</span>
                <span>₹{r.cost_inr}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BangaloreRoutePlanner;
