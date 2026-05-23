/** Shared easing curves and durations for framer-motion. */
export const easeOut = [0.16, 1, 0.3, 1] as const;

export const springSnappy = { type: "spring" as const, stiffness: 420, damping: 32 };

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: easeOut },
};

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalPanel = {
  initial: { opacity: 0, y: 28, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.97 },
  transition: { duration: 0.28, ease: easeOut },
};

export const listItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
  transition: { duration: 0.2, ease: easeOut },
};
