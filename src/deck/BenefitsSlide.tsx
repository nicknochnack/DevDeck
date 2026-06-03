import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE },
};

interface BenefitsSlideProps {
  heading: string;
  benefits: {
    title: string;
    description: string;
    imageSrc: string;
  }[];
}

export function BenefitsSlide({ heading, benefits }: BenefitsSlideProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <>
      <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[6vh]">
        <motion.h2
          {...fade}
          className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-12 tracking-tight"
        >
          {heading}
        </motion.h2>
        
        <div className="grid grid-cols-4 gap-4 max-w-7xl">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.1, ease: EASE }}
              className="flex flex-col h-[60vh] rounded-lg border border-border bg-card/60 overflow-hidden hover:border-accent/60 transition-colors"
            >
              {/* Top half - text content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  benefit_{String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-mono text-xl font-bold mb-3 leading-tight">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Bottom half - clickable image */}
              <button
                onClick={() => setExpandedImage(benefit.imageSrc)}
                className="relative h-1/2 overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                aria-label={`View ${benefit.title} image fullscreen`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <div className="font-mono text-xs text-accent bg-background/90 px-3 py-1.5 rounded border border-accent">
                    click to expand
                  </div>
                </div>
                {benefit.imageSrc ? (
                  <img
                    src={benefit.imageSrc}
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="font-mono text-xs text-muted-foreground">
                      // TODO: add image to src/assets/benefits/benefit_{i + 1}.png
                    </div>
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen image modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-md flex items-center justify-center p-8"
            onClick={() => setExpandedImage(null)}
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-6 right-6 p-2 rounded-lg bg-card border border-border hover:border-accent hover:text-accent transition-colors"
              aria-label="Close fullscreen image"
            >
              <X className="h-6 w-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden border border-accent shadow-[0_0_60px_oklch(0.86_0.24_152/0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {expandedImage ? (
                <img
                  src={expandedImage}
                  alt="Expanded view"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center p-20">
                  <div className="font-mono text-sm text-muted-foreground">
                    placeholder image
                  </div>
                </div>
              )}
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">
              <span className="text-accent">esc</span> or click outside to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Made with Bob
