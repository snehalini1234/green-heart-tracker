import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, LogOut, LayoutDashboard, ClipboardList, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalImpactSection from "@/components/GlobalImpactSection";
import WeeklyChart from "@/components/WeeklyChart";
import DailyActivityForm from "@/components/DailyActivityForm";
import EcoPointsBadge from "@/components/EcoPointsBadge";
import ProductScanner from "@/components/ProductScanner";
import EcoLeaderboard from "@/components/EcoLeaderboard";
import type { DailyActivity } from "@/lib/carbonCalculator";
import { getCategoryBreakdown } from "@/lib/carbonCalculator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import heroImage from "@/assets/hero-earth.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ecoPoints, setEcoPoints] = useState(42);
  const [latestActivity, setLatestActivity] = useState<DailyActivity | null>(null);
  const [latestEmission, setLatestEmission] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("eco_user");
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("eco_user");
    navigate("/");
  };

  const handleCalculate = (activity: DailyActivity, emission: number) => {
    setLatestActivity(activity);
    setLatestEmission(emission);
    const saved = 7.8 - emission;
    if (saved > 0) setEcoPoints((p) => p + Math.round(saved * 10));
  };

  const breakdown = latestActivity ? getCategoryBreakdown(latestActivity) : null;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-80 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-sidebar-primary" />
            <span className="font-heading font-bold text-lg">EcoTrack</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <EcoPointsBadge points={ecoPoints} />
          <DailyActivityForm onCalculate={handleCalculate} />
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-sidebar-foreground hover:text-sidebar-primary">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-heading font-bold text-foreground">Dashboard</h1>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-6xl mx-auto">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-56 eco-shadow">
            <img src={heroImage} alt="Earth" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 gradient-eco opacity-80" />
            <div className="relative z-10 flex flex-col justify-center h-full px-8 text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                Hello, {user.name} 🌱
              </h2>
              <p className="text-lg opacity-90">Track your impact. Every choice matters.</p>
            </div>
          </div>

          {/* Global Impact */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              🌍 Global Carbon Impact
            </h2>
            <GlobalImpactSection />
          </section>

          {/* Personal Charts */}
          <section className="grid lg:grid-cols-2 gap-6">
            <WeeklyChart />
            {breakdown && (
              <div className="glass-card rounded-xl p-6 eco-shadow">
                <h3 className="font-heading font-semibold text-foreground mb-1">Today's Breakdown</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Total: <span className="font-semibold text-foreground">{latestEmission} kg CO₂</span>
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={4} label={({ name, value }) => `${name}: ${value}`}>
                      {breakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {!breakdown && (
              <div className="glass-card rounded-xl p-6 eco-shadow flex flex-col items-center justify-center text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-heading font-semibold text-foreground mb-1">No Data Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your daily activity form in the sidebar to see your personal breakdown.
                </p>
              </div>
            )}
          </section>

          {/* Leaderboard & Product Scanner */}
          <section className="grid lg:grid-cols-2 gap-6">
            <EcoLeaderboard currentUserName={user.name} currentUserPoints={ecoPoints} />
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  📸 Product Scanner
                </h2>
                <ProductScanner />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
