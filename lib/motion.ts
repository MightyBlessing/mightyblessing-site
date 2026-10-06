import type { CSSProperties } from "react";

// Shared CSS / Web Animations values from docs/redesign/motion.md.
export const motion = {
  feedback: 120, preview: 160, menu: 200, word: 360, stagger: 100,
  hold: 2200, fade: 600, travel: 8, failsafe: 4000,
  heroAssetReady: 1200,
  railColor: 200, railTransform: 280,
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const motionVariables = {
  "--motion-feedback": `${motion.feedback}ms`,
  "--motion-preview": `${motion.preview}ms`,
  "--motion-rail-color": `${motion.railColor}ms`,
  "--motion-rail-transform": `${motion.railTransform}ms`,
  "--motion-menu": `${motion.menu}ms`,
  "--motion-travel": `${motion.travel}px`,
  "--motion-ease": motion.ease,
  "--motion-failsafe": `${motion.failsafe}ms`,
} as CSSProperties;
