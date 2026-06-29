"use client";

import { motion } from "framer-motion";
import KpiCard from "@/components/shared/KpiCard";
import type { KpiCard as KpiCardType } from "@/types/dashboard.types";

interface KpiGridProps {
  cards: KpiCardType[];
}

const KpiGrid = ({ cards }: KpiGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <KpiCard card={card} />
        </motion.div>
      ))}
    </div>
  );
};

export default KpiGrid;
