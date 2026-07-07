"use client";

import { motion } from "framer-motion";
import { Brain, Clock } from "lucide-react";
import type { AIDecisionResponse } from "@/types/ai-engine.types";
import { severityStyles } from "@/constants/severity";
import { fadeInUp } from "@/lib/motion";

interface AIDecisionResultProps {
  result: AIDecisionResponse;
  onClear: () => void;
}

const AIDecisionResult = ({ result, onClear }: AIDecisionResultProps) => {
  const decision = result.decisions[0];

  return (
    <motion.div
      {...fadeInUp()}
      className="bg-card/80 border-foreground/10 space-y-5 rounded-xl border p-5 backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-card-foreground flex items-center gap-2 text-base font-semibold">
          <Brain className="text-primary size-5" />
          AI Decision Summary
        </h4>
        {/* <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
          Powered by QUANTIQEN AI
        </span> */}
      </div>

      <hr className="border-border" />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border-foreground/10 rounded-xl border p-4">
          <p className="text-muted-foreground mb-1 text-xs">Risk Score</p>
          <p className="text-primary text-3xl font-bold">{result.overall_risk_score}</p>
        </div>
        <div className="bg-card border-foreground/10 rounded-xl border p-4">
          <p className="text-muted-foreground mb-1 text-xs">Priority Level</p>
          {decision?.priority && (
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                severityStyles[decision.priority]
              }`}
            >
              {decision.priority}
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-card-foreground mb-2 text-base font-semibold">AI Decision Summary</p>
        <p className="text-card-foreground text-sm leading-relaxed">{result.summary}</p>
      </div>

      <div>
        <p className="text-card-foreground mb-2 text-base font-semibold">Recommended Action</p>
        <p className="text-card-foreground text-sm leading-relaxed">{decision?.recommendation}</p>
      </div>

      <div>
        <p className="text-card-foreground mb-2 text-base font-semibold">Remediation Timeline</p>
        <p className="text-card-foreground flex items-center gap-2 text-sm">
          <Clock className="text-muted-foreground size-4" />
          {decision?.timeline}
        </p>
      </div>

      {result.processing_time !== undefined && (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <span>Processed in {result.processing_time}s</span>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-primary text-sm transition-colors"
        >
          Clear Result
        </button>
      </div>
    </motion.div>
  );
};

export default AIDecisionResult;
