"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useMotionEnabled } from "./AmbientField";
import { springEnter, staggerItem, staggerItemReduced, staggerList } from "./presets";

export function Stage({
  id,
  children,
  className = "",
  narrow = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <section id={id} className={`stage ${className}`.trim()}>
      <div className={narrow ? "container stage__narrow" : "container"}>{children}</div>
    </section>
  );
}

export function StageHeading({ children }: { children: ReactNode }) {
  const reduce = !useMotionEnabled();

  return (
    <motion.h2
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.97 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0.12 } : springEnter}
    >
      {children}
    </motion.h2>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = !useMotionEnabled();

  return (
    <motion.div
      className={className}
      variants={reduce ? { hidden: {}, show: { transition: { staggerChildren: 0.04 } } } : staggerList}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = !useMotionEnabled();

  return (
    <motion.div
      className={className}
      variants={reduce ? staggerItemReduced : staggerItem}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0.12, delay } : { ...springEnter, delay }}
    >
      {children}
    </motion.div>
  );
}
