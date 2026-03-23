import React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Volume2, VolumeX } from "lucide-react";

export default function TrainerSettings({
  mode,
  onModeChange,
  intervalSeconds,
  onIntervalSecondsChange,
  bpm,
  onBpmChange,
  beatsPerChord,
  onBeatsPerChordChange,
  showNext,
  onShowNextChange,
  metronomeOn,
  onMetronomeChange,
}) {
  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Mode
        </Label>
        <Tabs value={mode} onValueChange={onModeChange}>
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="seconds" className="flex-1 font-semibold text-sm">
              Seconds
            </TabsTrigger>
            <TabsTrigger value="bpm" className="flex-1 font-semibold text-sm">
              BPM
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mode-specific controls */}
      {mode === "seconds" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Interval</Label>
            <span className="font-mono font-bold text-lg text-foreground">
              {intervalSeconds}s
            </span>
          </div>
          <Slider
            value={[intervalSeconds]}
            onValueChange={([v]) => onIntervalSecondsChange(v)}
            min={1}
            max={15}
            step={1}
            className="w-full"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">BPM</Label>
              <span className="font-mono font-bold text-lg text-foreground">
                {bpm}
              </span>
            </div>
            <Slider
              value={[bpm]}
              onValueChange={([v]) => onBpmChange(v)}
              min={40}
              max={220}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Beats per chord</Label>
              <span className="font-mono font-bold text-lg text-foreground">
                {beatsPerChord}
              </span>
            </div>
            <Slider
              value={[beatsPerChord]}
              onValueChange={([v]) => onBeatsPerChordChange(v)}
              min={1}
              max={16}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showNext ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <Label className="text-sm cursor-pointer">Show next chord</Label>
          </div>
          <Switch checked={showNext} onCheckedChange={onShowNextChange} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {metronomeOn ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <Label className="text-sm cursor-pointer">Metronome click</Label>
          </div>
          <Switch checked={metronomeOn} onCheckedChange={onMetronomeChange} />
        </div>
      </div>
    </div>
  );
}