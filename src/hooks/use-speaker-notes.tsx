import { useState, useEffect, useCallback } from "react";
import type { SlideNote, SlideNotesData } from "@/deck/types";

const STORAGE_KEY = "devdeck-speaker-notes";

export function useSpeakerNotes(slideIds: string[]) {
  const [notes, setNotes] = useState<Map<string, string>>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: SlideNotesData = JSON.parse(stored);
        const map = new Map<string, string>();
        data.slideNotes.forEach((note) => {
          map.set(note.slideId, note.notes);
        });
        return map;
      }
    } catch (error) {
      console.error("Failed to load speaker notes from localStorage:", error);
    }
    // Initialize empty notes for all slides
    return new Map(slideIds.map((id) => [id, ""]));
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Save to localStorage whenever notes change
  useEffect(() => {
    try {
      const data: SlideNotesData = {
        slideNotes: Array.from(notes.entries()).map(([slideId, noteText]) => ({
          slideId,
          notes: noteText,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save speaker notes to localStorage:", error);
    }
  }, [notes]);

  // Listen for storage changes from other windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const data: SlideNotesData = JSON.parse(e.newValue);
          const newMap = new Map<string, string>();
          data.slideNotes.forEach((note) => {
            newMap.set(note.slideId, note.notes);
          });
          setNotes(newMap);
        } catch (error) {
          console.error("Failed to sync speaker notes from storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateNote = useCallback((slideId: string, noteText: string) => {
    setNotes((prev) => {
      const newMap = new Map(prev);
      newMap.set(slideId, noteText);
      return newMap;
    });
    setHasUnsavedChanges(true);
  }, []);

  const getNote = useCallback(
    (slideId: string) => {
      return notes.get(slideId) || "";
    },
    [notes]
  );

  const exportNotes = useCallback(() => {
    const data: SlideNotesData = {
      slideNotes: Array.from(notes.entries()).map(([slideId, noteText]) => ({
        slideId,
        notes: noteText,
      })),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speaker-notes-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasUnsavedChanges(false);
  }, [notes]);

  const importNotes = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data: SlideNotesData = JSON.parse(content);
            const newMap = new Map<string, string>();
            
            // Initialize with existing slide IDs
            slideIds.forEach((id) => newMap.set(id, ""));
            
            // Update with imported notes
            data.slideNotes.forEach((note) => {
              if (slideIds.includes(note.slideId)) {
                newMap.set(note.slideId, note.notes);
              }
            });
            
            setNotes(newMap);
            setHasUnsavedChanges(false);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    },
    [slideIds]
  );

  const clearAllNotes = useCallback(() => {
    const newMap = new Map(slideIds.map((id) => [id, ""]));
    setNotes(newMap);
    setHasUnsavedChanges(false);
  }, [slideIds]);

  return {
    getNote,
    updateNote,
    exportNotes,
    importNotes,
    clearAllNotes,
    hasUnsavedChanges,
  };
}

// Made with Bob
