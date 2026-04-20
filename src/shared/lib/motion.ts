export const MOTION_EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const pageStagger = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
} as const;

export const sectionFadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: MOTION_EASE_OUT,
    },
  },
} as const;

export const listStagger = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
} as const;

export const listItemFadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: MOTION_EASE_OUT,
    },
  },
} as const;

export const panelSwap = {
  initial: { opacity: 0, y: 10, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: MOTION_EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: {
      duration: 0.18,
      ease: MOTION_EASE_OUT,
    },
  },
} as const;
