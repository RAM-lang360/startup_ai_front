import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedPageProps {
  children: React.ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier matching modern design systems
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.25,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
