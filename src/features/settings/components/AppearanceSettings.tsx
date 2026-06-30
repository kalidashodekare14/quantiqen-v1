"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const AppearanceSettings = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card w-full rounded-xl border p-5"
    >
      <h3 className="text-card-foreground mb-4 text-sm font-semibold lg:text-base">
        Appearance
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-card-foreground text-sm font-medium lg:text-base">
            Dark Mode
          </span>
          <span className="text-muted-foreground text-xs lg:text-sm">
            Toggle between light and dark theme
          </span>
        </div>

        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>
    </motion.div>
  );
};

export default AppearanceSettings;
