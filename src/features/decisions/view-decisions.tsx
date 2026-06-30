"use client";

import { useState } from "react";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useDecisions } from "./hooks/useDecisions";
import { Decision } from "@/types/decision.types";
import DecisionTable from "./components/DecisionTable";
import DecisionSidePanel from "./components/DecisionSidePanel";

const ViewDecisions = () => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const { data, isLoading } = useDecisions();

  if (isLoading) {
    return <LoadingSkeleton variant="table" count={8} />;
  }

  if (!data) return null;

  return (
    <>
      <div>
        <DecisionTable
          decisions={data.decisions}
          onRowClick={(decision) => setSelectedDecision(decision)}
        />
      </div>
      <DecisionSidePanel
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
      />
    </>
  );
};

export default ViewDecisions;
