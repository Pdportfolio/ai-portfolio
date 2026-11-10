"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useState, type PointerEvent } from "react";

export function useMotionEnabled() {
  const prefersReduce = useReducedMotion();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(prefersReduce !== true);
  }, [prefersReduce]);

  return enabled;
}

const BLOBS = [
  { id: "hero", speed: 0.74 },
  { id: "about", speed: 0.84 },
  { id: "projects", speed: 0.92 },
  { id: "contact", speed: 0.8 },
] as const;

export function AmbientField() {
  const motionEnabled = useMotionEnabled();
  const { scrollY } = useScroll();

  return (
    <div className="glow-layer" aria-hidden="true">
      {BLOBS.map((blob) => (
        <GlowBlob key={blob.id} id={blob.id} speed={blob.speed} scrollY={scrollY} motionEnabled={motionEnabled} />
      ))}
    </div>
  );
}

function GlowBlob({
  id,
  speed,
  scrollY,
  motionEnabled,
}: {
  id: string;
  speed: number;
  scrollY: MotionValue<number>;
  motionEnabled: boolean;
}) {
  const y = useTransform(scrollY, (value) => (motionEnabled ? value * speed : 0));

  return (
    <motion.div className="glow-blob-track" style={{ y }}>
      <div className={`glow-blob glow-blob--${id} glow-blob--live`} />
    </motion.div>
  );
}

export function usePointerParallax(range = 36) {
  const motionEnabled = useMotionEnabled();
  const rawX = useSpring(0, { stiffness: 70, damping: 18, mass: 0.6 });
  const rawY = useSpring(0, { stiffness: 70, damping: 18, mass: 0.6 });

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    rawX.set(nx * range);
    rawY.set(ny * range);
  }

  function onPointerLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return { x: rawX, y: rawY, onPointerMove, onPointerLeave, reduce: !motionEnabled };
}
