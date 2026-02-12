import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  tier: string;
}

const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Aria Chen", points: 482, tier: "Forest Guardian" },
  { rank: 2, name: "Liam Patel", points: 371, tier: "Forest Guardian" },
  { rank: 3, name: "Sofia Müller", points: 298, tier: "Tree" },
  { rank: 4, name: "Noah Kim", points: 245, tier: "Tree" },
  { rank: 5, name: "Emma Verde", points: 198, tier: "Tree" },
  { rank: 6, name: "Lucas Obi", points: 162, tier: "Sapling" },
  { rank: 7, name: "Zara Woods", points: 134, tier: "Sapling" },
  { rank: 8, name: "Kai Tanaka", points: 97, tier: "Sapling" },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-primary" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-accent-foreground" />;
  return <span className="text-sm font-semibold text-muted-foreground w-5 text-center">{rank}</span>;
};

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

interface Props {
  currentUserName?: string;
  currentUserPoints?: number;
}

const EcoLeaderboard = ({ currentUserName, currentUserPoints }: Props) => {
  const combined = [...mockLeaderboard];

  if (currentUserName && currentUserPoints !== undefined) {
    const exists = combined.find((u) => u.name === currentUserName);
    if (!exists) {
      combined.push({
        rank: 0,
        name: currentUserName,
        points: currentUserPoints,
        tier:
          currentUserPoints >= 300 ? "Forest Guardian" :
          currentUserPoints >= 150 ? "Tree" :
          currentUserPoints >= 50 ? "Sapling" : "Seedling",
      });
    }
  }

  combined.sort((a, b) => b.points - a.points);
  combined.forEach((u, i) => (u.rank = i + 1));

  const top3 = combined.slice(0, 3);
  const rest = combined.slice(3, 10);

  return (
    <div className="glass-card rounded-xl p-6 eco-shadow space-y-5">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">Eco Leaderboard</h3>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 pt-2">
        {[top3[1], top3[0], top3[2]].map((user, i) => {
          if (!user) return null;
          const heights = ["h-20", "h-28", "h-16"];
          const isCurrentUser = user.name === currentUserName;
          return (
            <div key={user.name} className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px]">
              <Avatar className={`${i === 1 ? "h-14 w-14 ring-2 ring-primary" : "h-10 w-10"} ${isCurrentUser ? "ring-2 ring-accent" : ""}`}>
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <p className={`text-xs font-medium truncate max-w-full ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                {user.name}
              </p>
              <div className={`w-full ${heights[i]} rounded-t-lg flex flex-col items-center justify-end pb-2 ${
                i === 1 ? "bg-primary/20" : "bg-muted"
              }`}>
                {rankIcon(user.rank)}
                <span className="text-sm font-bold text-foreground mt-1">{user.points}</span>
                <span className="text-[10px] text-muted-foreground">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of list */}
      <div className="space-y-1.5">
        {rest.map((user) => {
          const isCurrentUser = user.name === currentUserName;
          return (
            <div
              key={user.name}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isCurrentUser ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50"
              }`}
            >
              <div className="w-6 flex justify-center">{rankIcon(user.rank)}</div>
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className={`text-sm flex-1 truncate ${isCurrentUser ? "font-semibold text-primary" : "text-foreground"}`}>
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground">{user.tier}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-sm font-semibold text-foreground">{user.points}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EcoLeaderboard;
