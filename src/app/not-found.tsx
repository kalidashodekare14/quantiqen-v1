"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AppButton from "@/components/shared/AppButton";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-background relative flex min-h-screen items-center justify-center"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary/10 size-125 rounded-full blur-[120px] sm:size-175" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-chart-5 text-8xl font-bold tracking-tight lg:text-9xl"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <h2 className="text-foreground text-xl font-semibold lg:text-2xl">Page Not Found</h2>
          <p className="text-muted-foreground max-w-sm text-sm lg:text-base">
            The page you are looking for does not exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <AppButton variant="outline" size="lg">
            <Link href="/dashboard">Back to Dashboard</Link>
          </AppButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
