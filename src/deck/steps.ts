import { createContext, useContext } from "react";

export const SlideStepContext = createContext<{ step: number; totalSteps: number }>({
  step: 0,
  totalSteps: 1,
});

export const useSlideStep = () => useContext(SlideStepContext);

// Returns the number of internal steps a slide has (default 1).
export function getSlideStepCount(slide: { type: string; reveals?: unknown[] }): number {
  if (slide.type === "title" && Array.isArray(slide.reveals) && slide.reveals.length > 0) {
    return slide.reveals.length + 1; // 1 base view + one per reveal
  }
  return 1;
}
