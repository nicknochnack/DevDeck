import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Clock, FileText, ChevronRight, Download, Upload, Trash2, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Slide } from "./types";

interface PresenterViewProps {
  currentSlide: Slide;
  nextSlide: Slide | null;
  prevSlide: Slide | null;
  currentIndex: number;
  totalSlides: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClear: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PresenterView({
  currentSlide,
  nextSlide,
  prevSlide,
  currentIndex,
  totalSlides,
  notes,
  onNotesChange,
  onExport,
  onImport,
  onClear,
  onNext,
  onPrev,
}: PresenterViewProps) {
  const [time, setTime] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Failed to import notes:", error);
        alert("Failed to import notes. Please check the file format.");
      }
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all speaker notes? This cannot be undone.")) {
      onClear();
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      onPrev();
    } else if (info.offset.x < -threshold && currentIndex < totalSlides - 1) {
      onNext();
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-mono text-lg sm:text-2xl font-bold">Presenter View</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {currentIndex + 1} / {totalSlides}
          </Badge>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            <span className="hidden sm:inline text-muted-foreground">Current:</span>
            <span className="font-bold tabular-nums text-xs sm:text-sm">{formatTime(time)}</span>
          </div>
          <Separator orientation="vertical" className="h-4 sm:h-6" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-muted-foreground">Elapsed:</span>
            <span className="font-bold tabular-nums text-accent text-xs sm:text-sm">
              {formatElapsed(elapsed)}
            </span>
          </div>
        </div>
      </div>

      {/* Main content - mobile optimized */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] p-4 sm:p-6 overflow-auto">
        {/* Speaker notes - full width on mobile, appears first */}
        <Card className="p-4 sm:p-6 bg-card/60 border-border flex flex-col lg:order-2 min-h-[300px] lg:min-h-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <span className="font-mono text-sm font-semibold">Speaker Notes</span>
              <Badge variant="outline" className="font-mono text-xs">
                {notes.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportClick}
                className="h-7 text-xs"
              >
                <Upload className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-7 text-xs"
              >
                <Download className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>
          <Separator className="mb-4" />
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter speaker notes for this slide..."
            className="flex-1 resize-none font-mono text-sm bg-background/50 border-border focus:border-accent min-h-[200px]"
          />
          <div className="mt-3 text-xs text-muted-foreground font-mono">
            <span className="text-accent">Tip:</span> Notes sync across all devices
          </div>
        </Card>

        {/* Slide previews - swipeable on mobile */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:order-1">
          {/* Navigation buttons for mobile */}
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={currentIndex === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground font-mono">
              Swipe to navigate
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={currentIndex === totalSlides - 1}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x, opacity }}
            className="flex flex-col gap-4 sm:gap-6"
          >

          {/* Current slide preview */}
          <Card className="p-4 sm:p-6 bg-card/60 border-border">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-mono text-xs">
                Current
              </Badge>
              <span className="font-mono text-xs sm:text-sm text-muted-foreground truncate">
                {currentSlide.title}
              </span>
            </div>
            <div className="relative w-full aspect-video bg-background/50 rounded-lg border border-border overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-accent mb-2">
                    {currentSlide.type}
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-2">
                    {currentSlide.title}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Slide {currentIndex + 1}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next/Prev slide preview */}
          <div className="grid grid-cols-2 gap-4">
            {prevSlide && (
              <Card className="p-3 sm:p-4 bg-card/60 border-border">
                <div className="flex items-center gap-1 mb-2">
                  <Badge variant="outline" className="font-mono text-[10px] border-muted">
                    <ChevronLeft className="h-2 w-2 mr-0.5" />
                    Prev
                  </Badge>
                </div>
                <div className="relative w-full aspect-video bg-background/50 rounded border border-border overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-2 opacity-60">
                    <div className="text-center">
                      <div className="text-xs font-bold truncate">
                        {prevSlide.title}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            {nextSlide && (
              <Card className="p-3 sm:p-4 bg-card/60 border-border">
                <div className="flex items-center gap-1 mb-2">
                  <Badge variant="outline" className="font-mono text-[10px] border-accent/40 text-accent">
                    Next
                    <ChevronRight className="h-2 w-2 ml-0.5" />
                  </Badge>
                </div>
                <div className="relative w-full aspect-video bg-background/50 rounded border border-border overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-2 opacity-60">
                    <div className="text-center">
                      <div className="text-xs font-bold truncate">
                        {nextSlide.title}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
