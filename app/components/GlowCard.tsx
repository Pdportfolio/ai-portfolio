"use client";

import { motion, useSpring } from "framer-motion";
import { type PointerEvent, type ReactNode } from "react";
import { useMotionEnabled } from "./AmbientField";
import { staggerItem, staggerItemReduced } from "./presets";

export function GlowCard({
  children,
  className = "",
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const reduce = !useMotionEnabled();
  const rotateX = useSpring(0, { stiffness: 160, damping: 18, mass: 0.4 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18, mass: 0.4 });

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(nx * 14);
    rotateX.set(-ny * 11);
  }

  function onPointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      variants={reduce ? staggerItemReduced : staggerItem}
      {...(stagger
        ? {}
        : {
            initial: "hidden",
            whileInView: "show",
            viewport: { once: true, amount: 0.3 },
          })}
    >
      <motion.div
        className={`glow-card ${className}`.trim()}
        style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 920 }}
        whileHover={reduce ? undefined : { y: -10 }}
        transition={{ type: "spring", duration: 0.42, bounce: 0.14 }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
