"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionEnabled } from "./AmbientField";

const MIN_WIDTH = 768;
const FPS_SAMPLE_MS = 2000;
const MIN_FPS = 24;

function canRunFluid() {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < MIN_WIDTH) return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  return true;
}

export function FluidBackground() {
  const motionEnabled = useMotionEnabled();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!motionEnabled) {
      setEnabled(false);
      return;
    }

    const sync = () => setEnabled(canRunFluid());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [motionEnabled]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const origRaf = window.requestAnimationFrame.bind(window);
    const origCancel = window.cancelAnimationFrame.bind(window);
    const pending = new Set<number>();
    const listeners: Array<() => void> = [];

    const ignoreFluidKeys = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space" || event.code === "KeyP") {
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("keydown", ignoreFluidKeys);
    listeners.push(() => window.removeEventListener("keydown", ignoreFluidKeys));

    window.requestAnimationFrame = (callback) => {
      const id = origRaf((time) => {
        pending.delete(id);
        if (!cancelled) callback(time);
      });
      pending.add(id);
      return id;
    };

    const wide = window.innerWidth >= 1200;
    const options = {
      IMMEDIATE: false,
      AUTO: false,
      TRIGGER: "hover" as const,
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: wide ? 1024 : 512,
      DENSITY_DISSIPATION: 0.5,
      VELOCITY_DISSIPATION: 3,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: wide ? 20 : 12,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 10,
      BACK_COLOR: { r: 255, g: 255, b: 255 },
      TRANSPARENT: false,
      BLOOM: false,
      SUNRAYS: false,
    };

    void import("webgl-fluid").then((mod) => {
      if (cancelled || !canvasRef.current) return;
      mod.default(canvas, options);

      const relayToCanvas = (type: "mousedown" | "mousemove", event: PointerEvent | MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const synthetic = new MouseEvent(type, {
          clientX: event.clientX,
          clientY: event.clientY,
          bubbles: false,
          cancelable: false,
        });
        Object.defineProperties(synthetic, {
          offsetX: { get: () => offsetX },
          offsetY: { get: () => offsetY },
        });
        canvas.dispatchEvent(synthetic);
      };

      let primed = false;
      let relaying = false;
      const relay = (event: PointerEvent) => {
        if (relaying) return;
        relaying = true;
        try {
          if (!primed) {
            primed = true;
            relayToCanvas("mousedown", event);
          }
          relayToCanvas("mousemove", event);
        } finally {
          relaying = false;
        }
      };

      const attachRelay = window.setTimeout(() => {
        if (cancelled) return;
        window.addEventListener("pointermove", relay, { passive: true });
        listeners.push(() => window.removeEventListener("pointermove", relay));
      }, 550);

      listeners.push(() => window.clearTimeout(attachRelay));

      origRaf((startTime) => {
        const wait = (time: number) => {
          if (cancelled) return;
          if (time - startTime < 1500) {
            origRaf(wait);
            return;
          }
          let frames = 0;
          let sampleStart = time;
          const watch = (now: number) => {
            if (cancelled) return;
            frames += 1;
            if (now - sampleStart >= FPS_SAMPLE_MS) {
              const fps = (frames * 1000) / (now - sampleStart);
              if (fps < MIN_FPS) setEnabled(false);
              return;
            }
            origRaf(watch);
          };
          origRaf(watch);
        };
        origRaf(wait);
      });
    });

    return () => {
      cancelled = true;
      pending.forEach((id) => origCancel(id));
      pending.clear();
      window.requestAnimationFrame = origRaf;
      window.cancelAnimationFrame = origCancel;
      listeners.forEach((off) => off());
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fluid-bg" aria-hidden="true">
      <canvas id="fluid" ref={canvasRef} />
    </div>
  );
}
