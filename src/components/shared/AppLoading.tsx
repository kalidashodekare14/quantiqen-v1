import { fadeInUp } from "@/lib/motion";
import { motion } from "framer-motion";

const AppLoading = () => {
  return (
    <motion.div
      {...fadeInUp()}
      className="bg-background fixed inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="flex flex-col items-center gap-8">
        <motion.h1
          {...fadeInUp()}
          className="text-chart-5 text-5xl font-bold tracking-widest sm:text-6xl"
        >
          QUANTIQEN
        </motion.h1>

        <div className="bg-primary/20 h-0.75 w-50 overflow-hidden rounded-full">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="bg-chart-5 h-full w-full rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AppLoading;
