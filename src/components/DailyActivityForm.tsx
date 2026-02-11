import { useState } from "react";
import { Bike, Utensils, Zap, Calculator, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  calculateDailyEmission,
  getEcoPoints,
  getEmissionLevel,
  BANGALORE_AVERAGE_DAILY,
  type DailyActivity,
} from "@/lib/carbonCalculator";
import { toast } from "sonner";

interface Props {
  onCalculate: (activity: DailyActivity, emission: number) => void;
}

const DailyActivityForm = ({ onCalculate }: Props) => {
  const [transport, setTransport] = useState("bus");
  const [transportDistance, setTransportDistance] = useState(10);
  const [foodType, setFoodType] = useState("vegetarian");
  const [electricityHours, setElectricityHours] = useState(4);
  const [acHours, setAcHours] = useState(2);
  const [cookingHours, setCookingHours] = useState(1);
  const [result, setResult] = useState<{ emission: number; points: number; level: string } | null>(null);

  const handleCalculate = () => {
    const activity: DailyActivity = { transport, transportDistance, foodType, electricityHours, acHours, cookingHours };
    const emission = calculateDailyEmission(activity);
    const points = getEcoPoints(emission);
    const level = getEmissionLevel(emission);
    setResult({ emission, points, level });
    onCalculate(activity, emission);

    if (points > 0) {
      toast.success(`🌱 You earned ${points} Eco Points today!`);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        Daily Activity Log
      </h3>

      {/* Transport */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Bike className="h-4 w-4 text-eco-teal" /> Transport Mode
        </Label>
        <Select value={transport} onValueChange={setTransport}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(TRANSPORT_FACTORS).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Distance (km)</Label>
          <Input
            type="number"
            min={0}
            value={transportDistance}
            onChange={(e) => setTransportDistance(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Food */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Utensils className="h-4 w-4 text-eco-amber" /> Diet Today
        </Label>
        <Select value={foodType} onValueChange={setFoodType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(FOOD_FACTORS).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Energy */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Zap className="h-4 w-4 text-eco-gold" /> Energy Usage
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Lights (hrs)</Label>
            <Input type="number" min={0} value={electricityHours} onChange={(e) => setElectricityHours(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">AC (hrs)</Label>
            <Input type="number" min={0} value={acHours} onChange={(e) => setAcHours(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Cooking (hrs)</Label>
            <Input type="number" min={0} value={cookingHours} onChange={(e) => setCookingHours(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gradient-eco text-primary-foreground font-semibold">
        Calculate Emissions
      </Button>

      {/* Result */}
      {result && (
        <div className={`rounded-lg p-4 border space-y-3 animate-count-up ${
          result.level === "low" ? "bg-secondary border-primary/30" :
          result.level === "moderate" ? "bg-accent/10 border-accent/30" :
          "bg-destructive/10 border-destructive/30"
        }`}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Your Daily Emission</p>
            <p className="text-3xl font-heading font-bold text-foreground">{result.emission} <span className="text-base font-normal">kg CO₂</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              Bangalore avg: {BANGALORE_AVERAGE_DAILY} kg CO₂/day
            </p>
          </div>
          {result.points > 0 && (
            <div className="flex items-center justify-center gap-2 gradient-gold rounded-md p-2">
              <Award className="h-5 w-5 text-eco-gold-foreground" />
              <span className="font-heading font-bold text-eco-gold-foreground">+{result.points} Eco Points!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyActivityForm;
