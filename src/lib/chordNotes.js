// Maps each chord name to the notes that make it up (within one octave)
export const CHORD_NOTES = {
  // Major
  "C":  ["C", "E", "G"],
  "D":  ["D", "F#", "A"],
  "E":  ["E", "G#", "B"],
  "F":  ["F", "A", "C"],
  "G":  ["G", "B", "D"],
  "A":  ["A", "C#", "E"],
  "B":  ["B", "D#", "F#"],
  // Minor
  "Cm": ["C", "Eb", "G"],
  "Dm": ["D", "F", "A"],
  "Em": ["E", "G", "B"],
  "Fm": ["F", "Ab", "C"],
  "Gm": ["G", "Bb", "D"],
  "Am": ["A", "C", "E"],
  "Bm": ["B", "D", "F#"],
  // Dominant 7th
  "C7":  ["C", "E", "G", "Bb"],
  "D7":  ["D", "F#", "A", "C"],
  "E7":  ["E", "G#", "B", "D"],
  "F7":  ["F", "A", "C", "Eb"],
  "G7":  ["G", "B", "D", "F"],
  "A7":  ["A", "C#", "E", "G"],
  "B7":  ["B", "D#", "F#", "A"],
};

// Enharmonic equivalents — normalise everything to sharps
const ENHARMONIC = {
  "Eb": "D#",
  "Ab": "G#",
  "Bb": "A#",
  "Db": "C#",
  "Gb": "F#",
};

export function normalizeNote(note) {
  return ENHARMONIC[note] || note;
}

export function getChordNotes(chord) {
  const notes = CHORD_NOTES[chord] || [];
  return notes.map(normalizeNote);
}