import React from "react";
import { cn } from "@/lib/utils";

const ALL_CHORDS = [
  "C", "Cm", "C7",
  "D", "Dm", "D7",
  "E", "Em", "E7",
  "F", "Fm", "F7",
  "G", "Gm", "G7",
  "A", "Am", "A7",
  "B", "Bm", "B7",
];

export default function ChordBank({ selected, onToggle }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Chord Bank
        </h3>
        <span className="text-xs text-muted-foreground">
          {selected.length} selected
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {ALL_CHORDS.map((chord) => {
          const isSelected = selected.includes(chord);
          return (
            <button
              key={chord}
              onClick={() => onToggle(chord)}
              className={cn(
                "relative rounded-lg py-2.5 px-1 text-sm font-mono font-bold transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {chord}
            </button>
          );
        })}
      </div>
    </div>
  );
}