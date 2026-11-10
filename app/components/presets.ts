export const springEnter = { type: "spring" as const, duration: 0.6, bounce: 0.12 };

export const staggerList = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springEnter,
  },
};

export const staggerItemReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.12 } },
};
