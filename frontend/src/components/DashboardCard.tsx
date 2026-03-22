import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "primary" | "secondary" | "accent" | "default";
}

const variantClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  default: "bg-muted text-muted-foreground",
};

const DashboardCard = ({ title, value, icon: Icon, trend, variant = "default" }: DashboardCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover-lift cursor-default">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1 text-card-foreground">{value}</p>
          {trend && <p className="text-sm text-secondary mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
