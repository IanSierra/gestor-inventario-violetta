import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    positive?: boolean;
    label: string;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow p-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-full", iconClassName || "bg-primary-light/10")}>
          <Icon className={cn("h-5 w-5", iconClassName ? "text-white" : "text-primary")} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center mt-3 text-sm">
          <span className={trend.positive ? "text-green-600" : "text-red-500"}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-gray-500 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
