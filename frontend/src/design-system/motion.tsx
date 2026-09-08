import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
};

export function PageMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] } },
};

export function StaggerGrid({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" style={style}>
      {children}
    </motion.div>
  );
}

export function StaggerCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div variants={staggerItem} style={style}>
      {children}
    </motion.div>
  );
}
