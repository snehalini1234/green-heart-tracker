import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { getWeeklyData, BANGALORE_AVERAGE_DAILY } from "@/lib/carbonCalculator";

const WeeklyChart = () => {
  const data = getWeeklyData();

  return (
    <div className="glass-card rounded-xl p-6 eco-shadow">
      <h3 className="font-heading font-semibold text-foreground mb-1">Your Weekly Emissions</h3>
      <p className="text-sm text-muted-foreground mb-4">kg CO₂ per day vs Bangalore average</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="ecoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(150,10%,45%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(150,10%,45%)" />
          <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(145,15%,88%)", borderRadius: "8px" }} />
          <ReferenceLine y={BANGALORE_AVERAGE_DAILY} stroke="hsl(42, 92%, 56%)" strokeDasharray="5 5" label={{ value: "Avg", position: "right", fontSize: 11 }} />
          <Area type="monotone" dataKey="emission" stroke="hsl(152, 45%, 28%)" fill="url(#ecoGrad)" strokeWidth={2.5} dot={{ fill: "hsl(152, 45%, 28%)", r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
