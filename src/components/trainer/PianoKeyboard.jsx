import React from "react";
import { getChordNotes } from "../../lib/chordNotes";
import { cn } from "@/lib/utils";

// One octave: C to B
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];

// Black key note + which gap index it sits after (0-based white key index)
const BLACK_KEYS = [
  { note: "C#", after: 0 },
  { note: "D#", after: 1 },
  { note: "F#", after: 3 },
  { note: "G#", after: 4 },
  { note: "A#", after: 5 },
];

export default function PianoKeyboard({ chord }) {
  const activeNotes = chord ? getChordNotes(chord) : [];

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        className="relative select-none"
        style={{ width: "100%", maxWidth: 360, height: 120 }}
      >
        {/* White keys */}
        <div className="flex h-full gap-[2px]">
          {WHITE_KEYS.map((note) => {
            const isActive = activeNotes.includes(note);
            return (
              <div
                key={note}
                className={cn(
                  "flex-1 rounded-b-md border border-border/60 flex items-end justify-center pb-2 transition-colors duration-150",
                  isActive
                    ? "bg-primary shadow-[0_0_12px_2px_hsl(var(--primary)/0.6)]"
                    : "bg-foreground/90"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold",
                    isActive ? "text-primary-foreground" : "text-background/50"
                  )}
                >
                  {note}
                </span>
              </div>
            );
          })}
        </div>

        {/* Black keys — absolutely positioned */}
        <div className="absolute inset-0 pointer-events-none">
          {BLACK_KEYS.map(({ note, after }) => {
            const isActive = activeNotes.includes(note);
            // Each white key is (100/7)% wide, black key centered between two whites
            const whiteKeyPct = 100 / 7;
            // Center of black key = right edge of the "after" white key minus half black key width
            // Black key width ≈ 60% of white key width
            const blackWidthPct = whiteKeyPct * 0.6;
            const leftPct = (after + 1) * whiteKeyPct - blackWidthPct / 2;

            return (
              <div
                key={note}
                className={cn(
                  "absolute top-0 rounded-b-md z-10 transition-colors duration-150",
                  isActive
                    ? "bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.7)]"
                    : "bg-background"
                )}
                style={{
                  left: `${leftPct}%`,
                  width: `${blackWidthPct}%`,
                  height: "62%",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}