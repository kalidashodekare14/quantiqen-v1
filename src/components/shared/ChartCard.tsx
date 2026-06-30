import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => {
  return (
    <div className="bg-card ring-foreground/10 w-full rounded-xl p-5 ring-1">
      <div className="mb-4">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">{title}</h3>
        {subtitle && <p className="text-muted-foreground text-xs lg:text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

export default ChartCard;
