import React from 'react';
import { Clock, CloudRain, Play, Pause, RotateCcw, AlertTriangle, Users } from 'lucide-react';

interface TimelineScrubberProps {
  currentHour: number; // e.g. 17.5 for 5:30 PM
  onChangeHour: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isRainTriggered: boolean;
  onTriggerRainAtTime?: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentHour,
  onChangeHour,
  isPlaying,
  onTogglePlay,
  isRainTriggered
}) => {
  const minHour = 15; // 3:00 PM
  const maxHour = 23.5; // 11:30 PM

  // Format decimal hour to human readable time e.g. 17.5 -> "05:30 PM"
  const formatHour = (val: number) => {
    const totalMinutes = Math.round(val * 60);
    const h24 = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const getPositionPct = (hour: number) => {
    return ((hour - minHour) / (maxHour - minHour)) * 100;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        {/* Left: Controls & Label */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause scenario timeline' : 'Play scenario timeline'}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Event Timeline Watchdog
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-cyan-300">
                {formatHour(currentHour)}
              </span>
              <span className="text-[10px] text-slate-400">
                (Saturday Matchday Ingress & Egress Window)
              </span>
            </div>
          </div>
        </div>

        {/* Phase Pill */}
        <div className="flex items-center gap-2">
          {currentHour >= 17.5 && currentHour < 19.5 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/80 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              PEAK ARRIVAL PHASE (35K Attendees)
            </span>
          ) : currentHour >= 19.5 && currentHour < 23.25 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/80">
              🏏 MATCH IN PLAY
            </span>
          ) : currentHour >= 23.25 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/80">
              EXIT SPIKE PHASE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
              PRE-EVENT BUILDUP
            </span>
          )}

          {isRainTriggered && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/90 text-blue-300 border border-blue-700/80 flex items-center gap-1 animate-pulse">
              <CloudRain className="w-3 h-3 text-blue-400" />
              RAIN ACTIVE (14 mm/h)
            </span>
          )}
        </div>
      </div>

      {/* Scrubber Track with Visual Markers */}
      <div className="relative pt-4 pb-2 px-1">
        {/* Event Phase Markers along the timeline */}
        {/* 1. Gates Open & Ingress Start: 17:30 (17.5) */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${getPositionPct(17.5)}%` }}
        >
          <span className="text-[9px] font-mono text-amber-400 font-bold bg-slate-950/80 px-1 rounded border border-amber-600/40">
            5:30 PM Ingress
          </span>
          <div className="w-px h-3 bg-amber-400/80 mt-0.5"></div>
        </div>

        {/* 2. Early Rain Sudden Onset Marker: 18:00 (18.0) */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${getPositionPct(18.0)}%` }}
        >
          <span className="text-[9px] font-mono text-blue-400 font-bold bg-slate-950/80 px-1 rounded border border-blue-500/60 flex items-center gap-0.5">
            <CloudRain className="w-2.5 h-2.5" /> 6:00 PM Rain (14mm)
          </span>
          <div className="w-px h-3 bg-blue-400 mt-0.5"></div>
        </div>

        {/* 3. Match Kickoff Start: 19:30 (19.5) */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${getPositionPct(19.5)}%` }}
        >
          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-slate-950/80 px-1 rounded border border-emerald-600/40">
            7:30 PM Match
          </span>
          <div className="w-px h-3 bg-emerald-400/80 mt-0.5"></div>
        </div>

        {/* 4. Exit Surge Spike: 23:15 (23.25) */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${getPositionPct(23.25)}%` }}
        >
          <span className="text-[9px] font-mono text-purple-400 font-bold bg-slate-950/80 px-1 rounded border border-purple-600/40">
            11:15 PM Exit
          </span>
          <div className="w-px h-3 bg-purple-400/80 mt-0.5"></div>
        </div>

        {/* Input Slider */}
        <input
          type="range"
          min={minHour}
          max={maxHour}
          step={0.05} // ~3 min increments
          value={currentHour}
          onChange={(e) => onChangeHour(parseFloat(e.target.value))}
          aria-label="Event timeline scrubber from 3 PM to 11:30 PM"
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-cyan-400 relative z-20"
        />

        {/* Time Labels */}
        <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
          <span>3:00 PM</span>
          <span>5:00 PM</span>
          <span>7:00 PM</span>
          <span>9:00 PM</span>
          <span>11:30 PM</span>
        </div>
      </div>
    </div>
  );
};
