'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type AnimateInViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function AnimateInView({ children, className, delay = 0 }: AnimateInViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}