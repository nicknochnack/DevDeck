import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { FlowchartSlide as FlowchartSlideType } from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FlowchartSlideProps {
  slide: FlowchartSlideType;
  onNavigate: (slideId: string) => void;
}

export function FlowchartSlide({ slide, onNavigate }: FlowchartSlideProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!focusedNode) return;
      
      const currentIdx = slide.nodes.findIndex(n => n.id === focusedNode);
      if (currentIdx === -1) return;

      if (e.key === "ArrowLeft" && currentIdx > 0) {
        e.preventDefault();
        const prevNode = slide.nodes[currentIdx - 1];
        setFocusedNode(prevNode.id);
        nodeRefs.current.get(prevNode.id)?.focus();
      } else if (e.key === "ArrowRight" && currentIdx < slide.nodes.length - 1) {
        e.preventDefault();
        const nextNode = slide.nodes[currentIdx + 1];
        setFocusedNode(nextNode.id);
        nodeRefs.current.get(nextNode.id)?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNavigate(slide.nodes[currentIdx].targetSlideId);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusedNode, slide.nodes, onNavigate]);

  const handleNodeClick = useCallback((targetSlideId: string) => {
    onNavigate(targetSlideId);
  }, [onNavigate]);

  // Calculate positions for nodes in a radial layout
  const nodePositions = slide.nodes.map((_, i) => {
    const angle = (i / slide.nodes.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 35; // percentage units for viewBox
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="flex h-full w-full items-center justify-center px-[8vw] py-[6vh]">
      <div className="relative w-full max-w-5xl aspect-[16/10]">
        {/* SVG for edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Animated gradient for idle shimmer */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.86 0.24 152 / 0.2)">
                <animate
                  attributeName="stop-opacity"
                  values="0.2;0.6;0.2"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="oklch(0.86 0.24 152 / 0.6)">
                <animate
                  attributeName="stop-opacity"
                  values="0.6;1;0.6"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="oklch(0.86 0.24 152 / 0.2)">
                <animate
                  attributeName="stop-opacity"
                  values="0.2;0.6;0.2"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          {/* Dot grid background */}
          <pattern id="dots" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.3" fill="oklch(0.22 0 0 / 0.4)" />
          </pattern>
          <rect width="100" height="100" fill="url(#dots)" />

          {/* Edges from root to each node */}
          {slide.nodes.map((node, i) => {
            const pos = nodePositions[i];
            const isHovered = hoveredNode === node.id || focusedNode === node.id;
            const isDimmed = hoveredNode !== null && hoveredNode !== node.id && focusedNode !== node.id;
            
            return (
              <motion.line
                key={`edge-${node.id}`}
                x1="50"
                y1="50"
                x2={pos.x}
                y2={pos.y}
                stroke={isHovered ? "oklch(0.86 0.24 152)" : "url(#shimmer)"}
                strokeWidth={isHovered ? "0.4" : "0.25"}
                strokeLinecap="round"
                filter="url(#glow)"
                initial={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                animate={reduce ? { pathLength: 1, opacity: isDimmed ? 0.3 : 1 } : { 
                  pathLength: 1, 
                  opacity: isDimmed ? 0.3 : 1 
                }}
                transition={reduce ? { duration: 0 } : {
                  pathLength: { duration: 0.8, delay: 0.3 + i * 0.15, ease: EASE },
                  opacity: { duration: 0.3 }
                }}
                style={{
                  vectorEffect: "non-scaling-stroke",
                }}
              />
            );
          })}
        </svg>

        {/* Root node */}
        <motion.div
          initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 10 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg bg-accent/20 blur-xl" />
            <div className="relative px-10 py-6 rounded-lg border-2 border-accent bg-card/95 backdrop-blur-sm">
              <div className="font-mono text-4xl text-accent flex items-center gap-3">
                <span className="text-accent">$</span>
                <span className="font-bold">{slide.rootNode.label}</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-3 h-8 bg-accent ml-1"
                >
                  ▋
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Child nodes */}
        {slide.nodes.map((node, i) => {
          const pos = nodePositions[i];
          const isHovered = hoveredNode === node.id;
          const isFocused = focusedNode === node.id;
          
          return (
            <motion.button
              key={node.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(node.id, el);
                else nodeRefs.current.delete(node.id);
              }}
              initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { 
                duration: 0.5, 
                delay: 0.5 + i * 0.15, 
                ease: EASE 
              }}
              onClick={() => handleNodeClick(node.targetSlideId)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setFocusedNode(node.id)}
              onBlur={() => setFocusedNode(null)}
              className="absolute group cursor-pointer focus:outline-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
              aria-label={`Navigate to ${node.label}`}
            >
              <div className="relative">
                {/* Glow effect on hover/focus */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-accent/30 blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered || isFocused ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Node card */}
                <motion.div
                  className={`relative px-5 py-3 rounded-lg border bg-card/95 backdrop-blur-sm transition-colors ${
                    isHovered || isFocused
                      ? "border-accent shadow-[0_0_20px_oklch(0.86_0.24_152/0.4)]"
                      : "border-border"
                  }`}
                  animate={reduce ? {} : {
                    scale: isHovered || isFocused ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="font-mono text-2xl text-foreground flex items-center gap-3 whitespace-nowrap">
                    <span className="text-accent">{'>'}</span>
                    <span>{node.label}</span>
                    <motion.span
                      animate={reduce ? {} : { opacity: [1, 0, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-3 h-6 bg-accent"
                    >
                      ▋
                    </motion.span>
                  </div>
                </motion.div>

                {/* Pulsing border animation */}
                {!reduce && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-accent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}

        {/* Hint text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground text-center whitespace-nowrap"
        >
          <span className="text-accent">→</span> click a node to navigate · arrow keys to focus · enter to select
        </motion.div>
      </div>
    </div>
  );
}

// Made with Bob
