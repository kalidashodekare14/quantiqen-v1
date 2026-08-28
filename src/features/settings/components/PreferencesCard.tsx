"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Preferences } from "@/types/settings.types";
import { fadeInUp } from "@/lib/motion";

interface PreferencesCardProps {
  preferences: Preferences;
}

const LANGUAGES = ["English", "Spanish", "French"];
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Kolkata",
];
const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

const PreferencesCard = ({ preferences }: PreferencesCardProps) => {
  const [language, setLanguage] = useState(preferences.language);
  const [timezone, setTimezone] = useState(preferences.timezone);
  const [dateFormat, setDateFormat] = useState(preferences.dateFormat);

  const rows = [
    {
      label: "Language",
      value: language,
      onValueChange: setLanguage,
      options: LANGUAGES,
    },
    {
      label: "Timezone",
      value: timezone,
      onValueChange: setTimezone,
      options: TIMEZONES,
    },
    {
      label: "Date Format",
      value: dateFormat,
      onValueChange: setDateFormat,
      options: DATE_FORMATS,
    },
  ];

  return (
    <motion.div {...fadeInUp(0.2)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <h3 className="text-card-foreground mb-4 text-sm font-semibold lg:text-base">Preferences</h3>

      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 py-3 ${
              idx < rows.length - 1 ? "border-border border-b" : ""
            }`}
          >
            <span className="text-card-foreground shrink-0 text-sm lg:text-base">{row.label}</span>
            <Select value={row.value} onValueChange={row.onValueChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {row.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PreferencesCard;
