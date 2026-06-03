import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, Trash2, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpeakerNotesPanelProps {
  currentSlideId: string;
  currentSlideTitle: string;
  currentSlideIndex: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClear: () => void;
  hasUnsavedChanges: boolean;
}

export function SpeakerNotesPanel({
  currentSlideId,
  currentSlideTitle,
  currentSlideIndex,
  notes,
  onNotesChange,
  onExport,
  onImport,
  onClear,
  hasUnsavedChanges,
}: SpeakerNotesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
        // Reset input so the same file can be selected again
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-accent" />
            <span className="font-mono text-sm font-semibold">Speaker Notes</span>
            <Badge variant="outline" className="font-mono text-xs">
              Slide {String(currentSlideIndex + 1).padStart(2, "0")}
            </Badge>
            <span className="text-sm text-muted-foreground truncate max-w-xs">
              {currentSlideTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Alert className="py-1 px-3 border-accent/40">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs ml-2">
                      Unsaved changes
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleImportClick}
              className="h-8 text-xs"
            >
              <Upload className="h-3 w-3 mr-1.5" />
              Import
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
              className="h-8 text-xs"
            >
              <Download className="h-3 w-3 mr-1.5" />
              Export
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1.5" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Notes textarea */}
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Enter speaker notes for this slide..."
          className="min-h-[120px] max-h-[200px] resize-y font-mono text-sm bg-background/50 border-border focus:border-accent"
        />

        {/* Footer hint */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-mono">
            <span className="text-accent">Tip:</span> Notes are auto-saved to browser storage
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {notes.length} characters
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Made with Bob
