import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInScale } from "@/lib/motion";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => {
  return (
    <div className="bg-card/80 border-foreground/10 hover:border-primary/40 hover:shadow-primary/5 w-full rounded-xl border p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">{title}</h3>
        {subtitle && <p className="text-muted-foreground text-xs lg:text-sm">{subtitle}</p>}
      </div>
      <motion.div {...fadeInScale}>{children}</motion.div>
    </div>
  );
};

export default ChartCard;
