import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressRing from "./ProgressRing";
import PianoKeyboard from "./PianoKeyboard";

export default function ChordDisplay({ currentChord, nextChord, showNext, progress, isRunning }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Progress ring with chord inside */}
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={isRunning ? progress : 1} size={260} strokeWidth={5} />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentChord}
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-mono font-extrabold text-8xl sm:text-9xl text-foreground select-none"
            >
              {currentChord || "—"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Piano keyboard */}
      <div className="w-full max-w-sm px-2">
        <PianoKeyboard chord={currentChord} />
      </div>

      {/* Next chord preview */}
      {showNext && nextChord && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm font-medium uppercase tracking-widest">Next</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={nextChord}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-mono font-bold text-3xl text-primary"
            >
              {nextChord}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}