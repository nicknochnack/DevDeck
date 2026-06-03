import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Command as CommandIcon,
  LayoutGrid,
  Moon,
  Sun,
  X,
  StickyNote,
  Presentation,
  Smartphone,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { slides } from "./slides";
import { SlideRenderer } from "./SlideRenderer";
import { SlideStepContext, getSlideStepCount } from "./steps";
import { SpeakerNotesPanel } from "./SpeakerNotesPanel";
import { MobileAccessDialog } from "./MobileAccessDialog";
import { useSpeakerNotes } from "@/hooks/use-speaker-notes";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Deck() {
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [palette, setPalette] = useState(false);
  const [overview, setOverview] = useState(false);
  const [light, setLight] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const reduce = useReducedMotion();
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  // Initialize speaker notes
  const slideIds = useMemo(() => slides.map((s) => s.id), []);
  const {
    getNote,
    updateNote,
    exportNotes,
    importNotes,
    clearAllNotes,
    hasUnsavedChanges,
  } = useSpeakerNotes(slideIds);

  const total = slides.length;
  const stepCount = getSlideStepCount(slides[i]);

  const openPresenterView = useCallback(() => {
    const presenterWindow = window.open(
      "/presenter",
      "presenter",
      "width=1200,height=800,menubar=no,toolbar=no,location=no,status=no"
    );
    
    if (presenterWindow) {
      // Send current slide index after a short delay to ensure window is ready
      setTimeout(() => {
        broadcastChannel.current?.postMessage({
          type: "SLIDE_CHANGE",
          index: i,
        });
      }, 500);
    }
  }, [i]);

  const go = useCallback(
    (nextIdx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, nextIdx));
      setDir(clamped > i ? 1 : -1);
      setI(clamped);
      setStep(0);
    },
    [i, total],
  );

  // Initialize BroadcastChannel for same-browser presenter sync only.
  // Phone-to-desktop sync cannot rely on localStorage/storage events because
  // those are origin-local and do not propagate between devices.
  useEffect(() => {
    const channel = new BroadcastChannel("presentation-sync");
    broadcastChannel.current = channel;

    channel.onmessage = (event) => {
      if (event.data.type === "REQUEST_CURRENT_SLIDE") {
        channel.postMessage({
          type: "SLIDE_CHANGE",
          index: i,
        });
      } else if (event.data.type === "SLIDE_CHANGE") {
        if (event.data.index !== i) {
          go(event.data.index);
        }
      }
    };

    return () => {
      channel.close();
      if (broadcastChannel.current === channel) {
        broadcastChannel.current = null;
      }
    };
  }, [i, go]);

  // Broadcast slide changes to the presenter window on the same device/browser.
  useEffect(() => {
    broadcastChannel.current?.postMessage({
      type: "SLIDE_CHANGE",
      index: i,
    });
  }, [i]);

  const next = useCallback(() => {
    if (step < stepCount - 1) {
      setStep((s) => s + 1);
    } else {
      go(i + 1);
    }
  }, [step, stepCount, go, i]);

  const prev = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      // jump to previous slide at its final step
      const target = Math.max(0, i - 1);
      setDir(-1);
      setI(target);
      setStep(getSlideStepCount(slides[target]) - 1);
    }
  }, [step, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      // Don't handle keyboard shortcuts when typing in input/textarea
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "/") {
        e.preventDefault();
        setPalette(true);
        return;
      }
      if (e.key === "Escape") {
        if (palette) return;
        setOverview((o) => !o);
        return;
      }
      if (overview) {
        if (e.key === "Enter") setOverview(false);
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        go(0);
      } else if (e.key === "End") {
        go(total - 1);
      } else if (e.key.toLowerCase() === "g") {
        setOverview((o) => !o);
      } else if (e.key.toLowerCase() === "t") {
        setLight((l) => !l);
      } else if (e.key.toLowerCase() === "n") {
        setShowNotes((n) => !n);
      } else if (e.key.toLowerCase() === "p") {
        openPresenterView();
      } else if (e.key.toLowerCase() === "m") {
        setShowMobileDialog(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total, overview, palette]);

  const progress = useMemo(() => ((i + 1) / total) * 100, [i, total]);

  return (
    <div className={`${light ? "light" : ""} relative h-screen w-screen overflow-hidden bg-background text-foreground grid-bg`}>
      {/* Progress bar */}
      <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-border/40 border-b border-accent/40">
        <motion.div
          className="h-full bg-accent text-accent-glow"
          style={{ boxShadow: "0 0 12px var(--accent-glow)" }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
        />
      </div>

      {/* Top-left chrome */}
      <div className="fixed top-5 left-6 z-30 flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span>devdeck</span>
        </span>
        <span className="opacity-40">·</span>
        <span>{slides[i].title}</span>
      </div>

      {/* Top-right controls */}
      <div className="fixed top-3 right-4 z-30 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPalette(true)}
          className="h-8 w-8 text-muted-foreground hover:text-accent"
          aria-label="Command palette"
        >
          <CommandIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOverview((o) => !o)}
          className="h-8 w-8 text-muted-foreground hover:text-accent"
          aria-label="Overview"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLight((l) => !l)}
          className="h-8 w-8 text-muted-foreground hover:text-accent"
          aria-label="Toggle theme"
        >
          {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotes((n) => !n)}
          className={`h-8 w-8 ${showNotes ? "text-accent" : "text-muted-foreground"} hover:text-accent`}
          aria-label="Toggle speaker notes"
        >
          <StickyNote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={openPresenterView}
          className="h-8 w-8 text-muted-foreground hover:text-accent"
          aria-label="Open presenter view"
        >
          <Presentation className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileDialog(true)}
          className="h-8 w-8 text-muted-foreground hover:text-accent"
          aria-label="Mobile access"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide stage */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={slides[i].id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-0"
          >
            <SlideStepContext.Provider value={{ step, totalSteps: stepCount }}>
              <SlideRenderer slide={slides[i]} index={i} onNavigate={go} />
            </SlideStepContext.Provider>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Click zones for nav (subtle) */}
      <button
        aria-label="Previous slide"
        onClick={prev}
        className="fixed bottom-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition hover:bg-card hover:text-accent disabled:opacity-30"
        disabled={i === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={next}
        className="fixed bottom-4 left-16 z-30 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition hover:bg-card hover:text-accent disabled:opacity-30"
        disabled={i === total - 1}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom hint */}
      {!showNotes && (
        <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 font-mono text-[11px] text-muted-foreground">
          Press{" "}
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
            /
          </kbd>{" "}
          for command palette ·{" "}
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
            N
          </kbd>{" "}
          for notes ·{" "}
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
            P
          </kbd>{" "}
          for presenter ·{" "}
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
            M
          </kbd>{" "}
          for mobile
        </div>
      )}

      {/* Counter */}
      <div className="fixed bottom-4 right-6 z-30 flex items-center gap-3 font-mono text-sm">
        <span className="text-foreground tabular-nums">
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground tabular-nums">
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Command palette */}
      <CommandDialog open={palette} onOpenChange={setPalette}>
        <CommandInput placeholder="Jump to slide…" />
        <CommandList>
          <CommandEmpty>No slides found.</CommandEmpty>
          <CommandGroup heading="Slides">
            {slides.map((s, idx) => (
              <CommandItem
                key={s.id}
                value={`${idx + 1} ${s.title} ${s.type}`}
                onSelect={() => {
                  go(idx);
                  setPalette(false);
                }}
              >
                <span className="font-mono text-xs text-muted-foreground w-8">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{s.title}</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {s.type}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Overview */}
      <AnimatePresence>
        {overview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 overflow-auto bg-background/95 backdrop-blur-md p-10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="font-mono text-sm text-muted-foreground">
                <span className="text-accent">$</span> overview — {total} slides
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOverview(false)}
                aria-label="Close overview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    go(idx);
                    setOverview(false);
                  }}
                  className={`group text-left rounded-lg border bg-card overflow-hidden transition hover:border-accent ${
                    idx === i ? "border-accent accent-glow" : "border-border"
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <div className="absolute inset-0 origin-top-left scale-[0.18] w-[555%] h-[555%] pointer-events-none">
                      <SlideRenderer slide={s} index={idx} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")} · {s.type}
                    </span>
                    <span className="text-xs truncate">{s.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaker Notes Panel */}
      <AnimatePresence>
        {showNotes && (
          <SpeakerNotesPanel
            currentSlideId={slides[i].id}
            currentSlideTitle={slides[i].title}
            currentSlideIndex={i}
            notes={getNote(slides[i].id)}
            onNotesChange={(notes) => updateNote(slides[i].id, notes)}
            onExport={exportNotes}
            onImport={importNotes}
            onClear={clearAllNotes}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}
      </AnimatePresence>

      {/* Mobile Access Dialog */}
      <MobileAccessDialog
        open={showMobileDialog}
        onOpenChange={setShowMobileDialog}
      />
    </div>
  );
}
