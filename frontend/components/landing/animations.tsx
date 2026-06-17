"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        ease: "easeOut",
        delay: reduceMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className }: Omit<Props, "delay">) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: {
          transition: reduceMotion
            ? { delayChildren: 0, staggerChildren: 0 }
            : { delayChildren: 0.1, staggerChildren: 0.12 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, delay = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion ? {} : { y: 20 },
        show: {
          y: 0,
          transition: {
            duration: reduceMotion ? 0 : 0.45,
            ease: "easeOut",
            delay: reduceMotion ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FloatCard({
  children,
  className,
  delay = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
      animate={{
        opacity: 1,
        y: reduceMotion ? 0 : [0, -8, 0],
      }}
      transition={{
        opacity: { duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : delay },
        y: reduceMotion
          ? { duration: 0 }
          : { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      {children}
    </motion.div>
  );
}
