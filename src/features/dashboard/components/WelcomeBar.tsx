"use client";

import { motion } from "framer-motion";
import type { Organization, SecuritySummary } from "@/types/dashboard.types";
import { formatDateTime } from "@/utils/date/date";

interface WelcomeBarProps {
  organization: Organization;
  summary: SecuritySummary;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

const RADIUS = 42;

const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
console.log("circumference", CIRCUMFERENCE);

const WelcomeBar = ({ organization, summary }: WelcomeBarProps) => {
  const score = summary.securityScore;
  const scoreColor = getScoreColor(score);
  const strokeOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  console.log("strockoffset", strokeOffset);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-card ring-foreground/10 flex items-center justify-between overflow-hidden rounded-xl p-4 ring-1"
    >
      <div>
        <h1 className="text-card-foreground text-xl font-semibold">
          Good morning, {organization.name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">
          Last updated: {formatDateTime(summary.lastUpdated)} &middot; Plan: {organization.plan}{" "}
          &middot; Active APIs: {summary.activeAPIs}
        </p>
      </div>

      <div className="flex flex-col items-center">
        <svg width={96} height={96} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            className="stroke-border"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="46"
            textAnchor="middle"
            className="fill-card-foreground"
            fontSize="22"
            fontWeight="bold"
          >
            {score}
          </text>
          <text x="50" y="64" textAnchor="middle" className="fill-muted-foreground" fontSize="11">
            Score
          </text>
        </svg>
      </div>
    </motion.div>
  );
};

export default WelcomeBar;
