import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Globe, TrendingUp, Thermometer, TreePine } from "lucide-react";
import { getGlobalData } from "@/lib/carbonCalculator";

const stats = [
  { icon: Globe, label: "Global CO₂ (2024)", value: "37.4 Gt", sub: "+1.1% from 2023" },
  { icon: Thermometer, label: "Temp Rise", value: "+1.2°C", sub: "above pre-industrial" },
  { icon: TrendingUp, label: "India's Share", value: "7.3%", sub: "3rd largest emitter" },
  { icon: TreePine, label: "Trees Needed", value: "1.6T", sub: "to offset annually" },
];

const GlobalImpactSection = () => {
  const globalData = getGlobalData();

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 eco-shadow">
            <stat.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-sm font-medium text-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart — Per Capita */}
        <div className="glass-card rounded-xl p-6 eco-shadow">
          <h3 className="font-heading font-semibold text-foreground mb-4">Per Capita Emissions (tonnes CO₂/yr)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={globalData}>
              <XAxis dataKey="country" tick={{ fontSize: 12 }} stroke="hsl(150,10%,45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150,10%,45%)" />
              <Tooltip
                contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(145,15%,88%)", borderRadius: "8px" }}
              />
              <Bar dataKey="emission" radius={[6, 6, 0, 0]}>
                {globalData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Share */}
        <div className="glass-card rounded-xl p-6 eco-shadow">
          <h3 className="font-heading font-semibold text-foreground mb-4">Global Emission Share</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={globalData}
                dataKey="emission"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={({ country }) => country}
              >
                {globalData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GlobalImpactSection;
