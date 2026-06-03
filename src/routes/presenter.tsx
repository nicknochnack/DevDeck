import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PresenterView } from "@/deck/PresenterView";
import { slides } from "@/deck/slides";
import { useSpeakerNotes } from "@/hooks/use-speaker-notes";

export const Route = createFileRoute("/presenter")({
  component: PresenterRoute,
});

function PresenterRoute() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideIds = slides.map((s) => s.id);
  const { getNote, updateNote, exportNotes, importNotes, clearAllNotes } = useSpeakerNotes(slideIds);

  useEffect(() => {
    // BroadcastChannel works only between browsing contexts on the same device/browser.
    // It cannot sync phone and desktop sessions.
    const channel = new BroadcastChannel("presentation-sync");

    channel.onmessage = (event) => {
      if (event.data.type === "SLIDE_CHANGE") {
        setCurrentIndex(event.data.index);
      }
    };

    channel.postMessage({ type: "REQUEST_CURRENT_SLIDE" });

    return () => {
      channel.close();
    };
  }, []);

  const handleNotesChange = (notes: string) => {
    updateNote(currentSlide.id, notes);
  };

  // Broadcast slide changes back to the main deck when presenter view is opened
  // in the same browser/device.
  useEffect(() => {
    const channel = new BroadcastChannel("presentation-sync");
    channel.postMessage({
      type: "SLIDE_CHANGE",
      index: currentIndex,
    });
    return () => {
      channel.close();
    };
  }, [currentIndex]);

  const currentSlide = slides[currentIndex];
  const nextSlide = currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null;
  const prevSlide = currentIndex > 0 ? slides[currentIndex - 1] : null;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <PresenterView
      currentSlide={currentSlide}
      nextSlide={nextSlide}
      prevSlide={prevSlide}
      currentIndex={currentIndex}
      totalSlides={slides.length}
      notes={getNote(currentSlide.id)}
      onNotesChange={handleNotesChange}
      onExport={exportNotes}
      onImport={importNotes}
      onClear={clearAllNotes}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
}

// Made with Bob
