export const fadeInScale = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  transition: {
    duration: 0.3,
    ease: "easeOut" as const,
  },
};

export const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    delay,
  },
});
