import { useState } from "react";
import { Package, Plus, Trash2, Mail, AlertTriangle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Delivery {
  id: string;
  platform: string;
  item: string;
  distance_km: number;
  weight_kg: number;
  emission_kg: number;
  date: string;
}

const PLATFORM_FACTORS: Record<string, { label: string; base: number }> = {
  amazon: { label: "Amazon", base: 0.05 },
  flipkart: { label: "Flipkart", base: 0.05 },
  myntra: { label: "Myntra", base: 0.04 },
  swiggy_instamart: { label: "Swiggy Instamart", base: 0.03 },
  bigbasket: { label: "BigBasket", base: 0.03 },
  other: { label: "Other", base: 0.06 },
};

function estimateDeliveryEmission(distance_km: number, weight_kg: number, platform: string): number {
  const base = PLATFORM_FACTORS[platform]?.base || 0.05;
  // Emission = base factor * distance + weight factor
  const emission = base * distance_km + weight_kg * 0.1;
  return Math.round(emission * 100) / 100;
}

interface Props {
  onEmissionAdd: (emission: number) => void;
}

const DeliveryTracker = ({ onEmissionAdd }: Props) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [platform, setPlatform] = useState("amazon");
  const [item, setItem] = useState("");
  const [distance, setDistance] = useState(15);
  const [weight, setWeight] = useState(1);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState<string[]>([]);

  const handleGrantPermission = () => {
    setPermissionGranted(true);
    toast.success("📬 Delivery tracking permission granted!");
  };

  const handleAddDelivery = () => {
    if (!item.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    const emission = estimateDeliveryEmission(distance, weight, platform);
    const newDelivery: Delivery = {
      id: Date.now().toString(),
      platform,
      item: item.trim(),
      distance_km: distance,
      weight_kg: weight,
      emission_kg: emission,
      date: new Date().toLocaleDateString("en-IN"),
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    onEmissionAdd(emission);
    setItem("");

    // Check threshold and send simulated email alert
    const totalEmission = deliveries.reduce((sum, d) => sum + d.emission_kg, 0) + emission;
    if (totalEmission > 5) {
      const alertMsg = `⚠️ Alert: Your delivery emissions have reached ${totalEmission.toFixed(2)} kg CO₂ this week. Consider consolidating orders or choosing slower, eco-friendly shipping.`;
      setEmailAlerts((prev) => [alertMsg, ...prev]);
      toast.warning("📧 Emission alert email sent!");
    }
  };

  const handleRemove = (id: string) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
  };

  const totalEmission = deliveries.reduce((sum, d) => sum + d.emission_kg, 0);

  if (!permissionGranted) {
    return (
      <div className="glass-card rounded-xl p-6 eco-shadow space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Delivery Emission Tracker
        </h3>
        <p className="text-sm text-muted-foreground">
          Allow EcoTrack to monitor your e-commerce deliveries and estimate their carbon footprint. We'll send you alerts when emissions cross thresholds.
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 text-sm text-secondary-foreground space-y-2">
          <p className="font-medium">Permissions requested:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Track delivery orders you log</li>
            <li>Estimate shipping carbon emissions</li>
            <li>Send simulated email alerts for high emissions</li>
          </ul>
        </div>
        <Button onClick={handleGrantPermission} className="w-full gradient-eco text-primary-foreground font-semibold">
          Grant Permission
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 eco-shadow space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Delivery Tracker
        </h3>
        <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground font-medium">
          {totalEmission.toFixed(2)} kg CO₂
        </span>
      </div>

      {/* Add Delivery Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_FACTORS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Item</Label>
            <Input className="h-9 text-xs" placeholder="e.g. Headphones" value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Distance (km)</Label>
            <Input className="h-9 text-xs" type="number" min={1} value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
            <Input className="h-9 text-xs" type="number" min={0.1} step={0.1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </div>
        </div>
        <Button onClick={handleAddDelivery} size="sm" className="w-full gradient-eco text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Log Delivery
        </Button>
      </div>

      {/* Email Alerts */}
      {emailAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" /> Simulated Email Alerts
          </p>
          {emailAlerts.slice(0, 3).map((alert, i) => (
            <Alert key={i} variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs">Emission Alert</AlertTitle>
              <AlertDescription className="text-xs">{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Delivery List */}
      {deliveries.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {deliveries.map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{d.item}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {PLATFORM_FACTORS[d.platform]?.label} · {d.distance_km}km · {d.weight_kg}kg
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-destructive">{d.emission_kg} kg</span>
                <button onClick={() => handleRemove(d.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;
