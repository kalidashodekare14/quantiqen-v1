"use client";

import { useState } from "react";
import { useDecisions } from "./hooks/useDecisions";
import { Decision } from "@/types/decision.types";
import DecisionTable from "./components/DecisionTable";

const ViewDecisions = () => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const { data, isLoading } = useDecisions();
  console.log("checking decissions data", data);

  //   if (isLoading) return <LoadingSkeleton />
  // if (isError) return <p>Error loading data</p>
  if (!data) return null;

  return (
    <div>
      <DecisionTable
        decisions={data.decisions}
        onRowClick={(decision) => setSelectedDecision(decision)}
      />
    </div>
  );
};

export default ViewDecisions;
