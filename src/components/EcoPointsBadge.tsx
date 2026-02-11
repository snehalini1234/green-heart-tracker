import { Award, Leaf, Star } from "lucide-react";

interface Props {
  points: number;
}

const tiers = [
  { min: 0, label: "Seedling", icon: Leaf },
  { min: 50, label: "Sapling", icon: Leaf },
  { min: 150, label: "Tree", icon: Award },
  { min: 300, label: "Forest Guardian", icon: Star },
];

const EcoPointsBadge = ({ points }: Props) => {
  const tier = [...tiers].reverse().find((t) => points >= t.min) || tiers[0];
  const nextTier = tiers.find((t) => t.min > points);
  const Icon = tier.icon;

  return (
    <div className="glass-card rounded-xl p-5 eco-shadow text-center space-y-3">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-gold animate-float">
        <Icon className="h-8 w-8 text-eco-gold-foreground" />
      </div>
      <div>
        <p className="text-3xl font-heading font-bold text-foreground">{points}</p>
        <p className="text-sm text-muted-foreground">Eco Points</p>
      </div>
      <div className="gradient-gold rounded-full px-4 py-1 inline-block">
        <span className="text-sm font-semibold text-eco-gold-foreground">{tier.label}</span>
      </div>
      {nextTier && (
        <p className="text-xs text-muted-foreground">
          {nextTier.min - points} pts to <span className="font-medium">{nextTier.label}</span>
        </p>
      )}
    </div>
  );
};

export default EcoPointsBadge;
