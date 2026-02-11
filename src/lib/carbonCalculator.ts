// Carbon emission factors in kg CO2 per unit (Bangalore-specific where applicable)

export const TRANSPORT_FACTORS: Record<string, { label: string; factor: number; unit: string }> = {
  walk: { label: "Walking / Cycling", factor: 0, unit: "km" },
  metro: { label: "Namma Metro", factor: 0.04, unit: "km" },
  bus: { label: "BMTC Bus", factor: 0.06, unit: "km" },
  autorickshaw: { label: "Auto-Rickshaw", factor: 0.08, unit: "km" },
  bike: { label: "Two-Wheeler", factor: 0.05, unit: "km" },
  car_petrol: { label: "Car (Petrol)", factor: 0.17, unit: "km" },
  car_diesel: { label: "Car (Diesel)", factor: 0.15, unit: "km" },
  car_electric: { label: "Car (Electric)", factor: 0.05, unit: "km" },
  cab: { label: "Cab / Ride-share", factor: 0.14, unit: "km" },
};

export const FOOD_FACTORS: Record<string, { label: string; factor: number }> = {
  vegan: { label: "Vegan", factor: 1.5 },
  vegetarian: { label: "Vegetarian", factor: 2.5 },
  mixed: { label: "Mixed (some meat)", factor: 4.0 },
  heavy_meat: { label: "Heavy Non-Veg", factor: 6.0 },
};

export const ENERGY_FACTORS = {
  electricity_per_kwh: 0.82, // India grid factor
  cooking_gas_per_hour: 0.5,
  ac_per_hour: 1.5,
};

// Average daily carbon emission for a Bangalore resident (kg CO2)
export const BANGALORE_AVERAGE_DAILY = 7.8;

export interface DailyActivity {
  transport: string;
  transportDistance: number;
  foodType: string;
  electricityHours: number;
  acHours: number;
  cookingHours: number;
}

export function calculateDailyEmission(activity: DailyActivity): number {
  const transportEmission = (TRANSPORT_FACTORS[activity.transport]?.factor || 0) * activity.transportDistance;
  const foodEmission = FOOD_FACTORS[activity.foodType]?.factor || 2.5;
  const electricityEmission = activity.electricityHours * ENERGY_FACTORS.electricity_per_kwh;
  const acEmission = activity.acHours * ENERGY_FACTORS.ac_per_hour;
  const cookingEmission = activity.cookingHours * ENERGY_FACTORS.cooking_gas_per_hour;

  return Math.round((transportEmission + foodEmission + electricityEmission + acEmission + cookingEmission) * 100) / 100;
}

export function getEcoPoints(emission: number): number {
  if (emission <= 0) return 0;
  const saved = BANGALORE_AVERAGE_DAILY - emission;
  if (saved <= 0) return 0;
  return Math.round(saved * 10);
}

export function getEmissionLevel(emission: number): "low" | "moderate" | "high" {
  if (emission < BANGALORE_AVERAGE_DAILY * 0.7) return "low";
  if (emission < BANGALORE_AVERAGE_DAILY * 1.1) return "moderate";
  return "high";
}

// Mock weekly data for charts
export function getWeeklyData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    emission: Math.round((3 + Math.random() * 8) * 10) / 10,
    average: BANGALORE_AVERAGE_DAILY,
  }));
}

export function getGlobalData() {
  return [
    { country: "USA", emission: 15.5, color: "hsl(0, 72%, 55%)" },
    { country: "China", emission: 7.4, color: "hsl(35, 90%, 55%)" },
    { country: "India", emission: 1.9, color: "hsl(152, 45%, 28%)" },
    { country: "EU", emission: 6.8, color: "hsl(175, 50%, 35%)" },
    { country: "Brazil", emission: 2.3, color: "hsl(85, 55%, 50%)" },
    { country: "Japan", emission: 9.7, color: "hsl(42, 92%, 56%)" },
  ];
}

export function getCategoryBreakdown(activity: DailyActivity) {
  const transport = (TRANSPORT_FACTORS[activity.transport]?.factor || 0) * activity.transportDistance;
  const food = FOOD_FACTORS[activity.foodType]?.factor || 2.5;
  const energy = activity.electricityHours * ENERGY_FACTORS.electricity_per_kwh + activity.acHours * ENERGY_FACTORS.ac_per_hour + activity.cookingHours * ENERGY_FACTORS.cooking_gas_per_hour;

  return [
    { name: "Transport", value: Math.round(transport * 100) / 100, fill: "hsl(175, 50%, 35%)" },
    { name: "Food", value: Math.round(food * 100) / 100, fill: "hsl(42, 92%, 56%)" },
    { name: "Energy", value: Math.round(energy * 100) / 100, fill: "hsl(152, 45%, 28%)" },
  ];
}
