import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Settings, X, Music, RotateCcw, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChordDisplay from "../components/trainer/ChordDisplay";
import ChordBank from "../components/trainer/ChordBank";
import TrainerSettings from "../components/trainer/TrainerSettings";
import DeleteAccountModal from "../components/trainer/DeleteAccountModal";
import { playClick } from "../lib/metronomeEngine";

function pickRandom(chords, lastChord) {
  // Pure random, just avoid immediate repeat
  const pool = chords.length > 1 ? chords.filter((c) => c !== lastChord) : chords;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Trainer() {
  // Chord bank
  const [selectedChords, setSelectedChords] = useState(["C", "G", "Am", "F", "D", "Em"]);

  // Settings
  const [mode, setMode] = useState("seconds");
  const [intervalSeconds, setIntervalSeconds] = useState(3);
  const [bpm, setBpm] = useState(100);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [showNext, setShowNext] = useState(true);
  const [metronomeOn, setMetronomeOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Runtime
  const [isRunning, setIsRunning] = useState(false);
  const [currentChord, setCurrentChord] = useState(null);
  const [nextChord, setNextChord] = useState(null);
  const [progress, setProgress] = useState(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const accumulatedMsRef = useRef(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const chordStartRef = useRef(null);
  const beatCountRef = useRef(0);
  const sessionStartRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const nextChordRef = useRef(null); // tracks the committed "next" chord

  // Refs for latest state in intervals
  const selectedChordsRef = useRef(selectedChords);
  const metronomeOnRef = useRef(metronomeOn);
  const currentChordRef = useRef(currentChord);

  useEffect(() => { selectedChordsRef.current = selectedChords; }, [selectedChords]);
  useEffect(() => { metronomeOnRef.current = metronomeOn; }, [metronomeOn]);
  useEffect(() => { currentChordRef.current = currentChord; }, [currentChord]);

  const getIntervalMs = useCallback(() => {
    if (mode === "seconds") return intervalSeconds * 1000;
    return (60 / bpm) * beatsPerChord * 1000;
  }, [mode, intervalSeconds, bpm, beatsPerChord]);

  const getBeatIntervalMs = useCallback(() => {
    if (mode === "seconds") return intervalSeconds * 1000;
    return (60 / bpm) * 1000;
  }, [mode, intervalSeconds, bpm]);

  const advanceChord = useCallback((isFirst = false) => {
    const chords = selectedChordsRef.current;
    if (chords.length === 0) return;

    // On first call, pick fresh. On subsequent calls, use the committed nextChordRef.
    const next = isFirst ? pickRandom(chords, null) : (nextChordRef.current ?? pickRandom(chords, currentChordRef.current));
    const afterNext = pickRandom(chords, next);

    nextChordRef.current = afterNext;
    currentChordRef.current = next;

    setCurrentChord(next);
    setNextChord(afterNext);
    chordStartRef.current = Date.now();
    beatCountRef.current = 0;
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    timerRef.current = null;
    sessionTimerRef.current = null;
    setProgress(1);
    // Save accumulated time so it persists across stop/start
    accumulatedMsRef.current += Date.now() - (sessionStartRef.current ?? Date.now());
  }, []);

  const resetTimer = useCallback(() => {
    accumulatedMsRef.current = 0;
    sessionStartRef.current = isRunning ? Date.now() : null;
    setElapsedMs(0);
  }, [isRunning]);

  const start = useCallback(() => {
    if (selectedChords.length < 2) return;

    advanceChord(true);
    setIsRunning(true);
    sessionStartRef.current = Date.now();
    chordStartRef.current = Date.now();
    beatCountRef.current = 0;

    // Play initial click
    if (metronomeOnRef.current) playClick(true);

    // Session timer
    sessionTimerRef.current = setInterval(() => {
      setElapsedMs(accumulatedMsRef.current + (Date.now() - sessionStartRef.current));
    }, 250);

    // Main loop
    const beatMs = getBeatIntervalMs();
    const totalMs = getIntervalMs();
    const totalBeats = mode === "bpm" ? beatsPerChord : 1;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - chordStartRef.current;
      const prog = Math.max(0, 1 - elapsed / totalMs);
      setProgress(prog);

      // Beat tracking for metronome
      if (mode === "bpm") {
        const currentBeat = Math.floor(elapsed / beatMs);
        if (currentBeat > beatCountRef.current && currentBeat < totalBeats) {
          beatCountRef.current = currentBeat;
          if (metronomeOnRef.current) playClick(false);
        }
      }

      // Chord change
      if (elapsed >= totalMs) {
        advanceChord();
        if (metronomeOnRef.current) playClick(true);
      }
    }, 30);
  }, [selectedChords, advanceChord, getBeatIntervalMs, getIntervalMs, mode, beatsPerChord]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  // Back button: close settings panel if open, otherwise let browser handle it
  useEffect(() => {
    const handleBack = (e) => {
      if (settingsOpen) {
        e.preventDefault();
        setSettingsOpen(false);
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [settingsOpen]);

  // Pull-to-refresh: reload page on downward swipe from top
  useEffect(() => {
    let startY = 0;
    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      const delta = e.changedTouches[0].clientY - startY;
      if (delta > 80 && window.scrollY === 0 && !isRunning) {
        window.location.reload();
      }
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isRunning]);

  // Stop if chords change while running
  useEffect(() => {
    if (isRunning && selectedChords.length < 2) stop();
  }, [selectedChords, isRunning, stop]);

  const toggleChord = (chord) => {
    setSelectedChords((prev) =>
      prev.includes(chord)
        ? prev.filter((c) => c !== chord)
        : [...prev, chord]
    );
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleToggle = () => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 sm:w-5 sm:h-5 text-primary" />
          <h1 className="text-base font-bold tracking-tight">Chord Trainer</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-2">
          <span className="font-mono text-sm sm:text-sm text-muted-foreground tabular-nums">
            {formatTime(elapsedMs)}
          </span>
          <button
            onClick={resetTimer}
            className="p-1.5 sm:p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 sm:p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
            title="Delete account"
          >
            <UserX className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </header>

      {/* Main display area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6 w-full max-w-lg mx-auto sm:max-w-none">
        <ChordDisplay
          currentChord={currentChord}
          nextChord={nextChord}
          showNext={showNext}
          progress={progress}
          isRunning={isRunning}
        />

        {/* Mode info chip */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/60 rounded-full px-5 py-2">
          {mode === "seconds" ? (
            <span>Every <span className="font-mono font-bold text-foreground">{intervalSeconds}s</span></span>
          ) : (
            <span>
              <span className="font-mono font-bold text-foreground">{bpm}</span> BPM ·{" "}
              <span className="font-mono font-bold text-foreground">{beatsPerChord}</span> beats
            </span>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4 sm:gap-4">
          <Button
            onClick={handleToggle}
            disabled={selectedChords.length < 2}
            size="lg"
            className={`
              rounded-full h-20 w-20 sm:h-16 sm:w-16 p-0 transition-all duration-200 shadow-lg
              ${isRunning
                ? "bg-destructive hover:bg-destructive/90 shadow-destructive/25"
                : "bg-primary hover:bg-primary/90 shadow-primary/25"
              }
            `}
          >
            {isRunning ? (
              <Square className="w-8 h-8 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-9 h-9 sm:w-7 sm:h-7 fill-current ml-0.5" />
            )}
          </Button>
          <Button
            onClick={() => setSettingsOpen(!settingsOpen)}
            variant="secondary"
            size="lg"
            className="rounded-full h-16 w-16 sm:h-14 sm:w-14 p-0"
          >
            {settingsOpen ? (
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            ) : (
              <Settings className="w-6 h-6 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>

        {selectedChords.length < 2 && (
          <p className="text-sm text-destructive font-medium">
            Select at least 2 chords to start
          </p>
        )}
      </main>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="px-4 py-5 space-y-6 max-w-lg mx-auto w-full">
              <TrainerSettings
                mode={mode}
                onModeChange={setMode}
                intervalSeconds={intervalSeconds}
                onIntervalSecondsChange={setIntervalSeconds}
                bpm={bpm}
                onBpmChange={setBpm}
                beatsPerChord={beatsPerChord}
                onBeatsPerChordChange={setBeatsPerChord}
                showNext={showNext}
                onShowNextChange={setShowNext}
                metronomeOn={metronomeOn}
                onMetronomeChange={setMetronomeOn}
              />
              <ChordBank selected={selectedChords} onToggle={toggleChord} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}