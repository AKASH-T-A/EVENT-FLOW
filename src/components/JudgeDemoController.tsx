import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { JudgeMilestone, JudgeDemoState } from '../types';

export const JUDGE_MILESTONES: JudgeMilestone[] = [
  {
    id: 1,
    timeSec: 0,
    title: '1. Ingress Telemetry',
    subtitle: 'Chinnaswamy Stadium IPL match (35,000 fans)',
    narration: 'Observing venue schedule and real-time precipitation for RCB vs CSK with 35,000 attendees.',
    highlightCardId: 'map',
    actionTrigger: 'observe'
  },
  {
    id: 2,
    timeSec: 15,
    title: '2. Predictive Saturation',
    subtitle: 'Bottleneck detected on Queens Road (115% saturation)',
    narration: 'Predicting crowd arrival surge. Queens Road exceeds 110% capacity, creating severe arterial friction.',
    highlightCardId: 'logs',
    actionTrigger: 'predict'
  },
  {
    id: 3,
    timeSec: 30,
    title: '3. Multi-Channel Load Spreading',
    subtitle: 'Route A (38%), Route B (27%), Metro (25%), Park-and-Ride (10%)',
    narration: 'Formulating load spreading across 4 channels to keep all monitored roads below the safe 85% threshold.',
    highlightCardId: 'plan',
    actionTrigger: 'plan'
  },
  {
    id: 4,
    timeSec: 45,
    title: '4. Police Approval & Emergency Corridor',
    subtitle: 'Bowring Hospital Green Route locked & protected',
    narration: 'Police operator provides one-click authorization. Bowring Hospital ambulance corridor is isolated and protected.',
    highlightCardId: 'plan',
    actionTrigger: 'approve'
  },
  {
    id: 5,
    timeSec: 60,
    title: '5. Segmented Multilingual Alerts',
    subtitle: 'Targeted alerts to Commuters, Attendees, Residents, and Autos (EN, KN, HI)',
    narration: 'Dispatching targeted alerts in English, Kannada, and Hindi with in-app preview and Telegram delivery.',
    highlightCardId: 'alerts',
    actionTrigger: 'plan'
  },
  {
    id: 6,
    timeSec: 75,
    title: '6. Sudden Monsoon Rain Re-Plan',
    subtitle: '14 mm/h cloudburst detected → Autonomous Revision 2',
    narration: 'Flash torrential rain of 14 mm/h cuts road capacity by 15%. Agent detects waterlogging danger and automatically re-routes via elevated bypass.',
    highlightCardId: 'map',
    actionTrigger: 'rain'
  },
  {
    id: 7,
    timeSec: 90,
    title: '7. Ground Truth Learning Calibration',
    subtitle: 'Loop detector telemetry match (96%) & self-calibrated model factor',
    narration: 'Comparing predicted volume against simulated ground truth sensors, auto-calibrating the arterial damping factor from 1.05 to 1.02.',
    highlightCardId: 'learning',
    actionTrigger: 'after_action'
  }
];

interface JudgeDemoControllerProps {
  demoState: JudgeDemoState;
  onTogglePlay: () => void;
  onNextMilestone: () => void;
  onPrevMilestone: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: 1 | 1.5 | 2) => void;
  onToggleVoice: () => void;
  onSelectMilestone: (index: number) => void;
}

export const JudgeDemoController: React.FC<JudgeDemoControllerProps> = ({
  demoState,
  onTogglePlay,
  onNextMilestone,
  onPrevMilestone,
  onReset,
  onChangeSpeed,
  onToggleVoice,
  onSelectMilestone
}) => {
  const currentMilestone = JUDGE_MILESTONES[demoState.currentMilestoneIndex] || JUDGE_MILESTONES[0];

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Judge Demo Banner & Current Step Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-bold whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Judge Demo (90s)</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1F2933]">
                {currentMilestone.title}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-600 truncate hidden sm:inline">
                {currentMilestone.subtitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic truncate">
              "{currentMilestone.narration}"
            </p>
          </div>
        </div>

        {/* Center: Interactive Milestones Step Track */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {JUDGE_MILESTONES.map((m, idx) => {
            const isCurrent = demoState.currentMilestoneIndex === idx;
            const isPassed = demoState.currentMilestoneIndex > idx;

            return (
              <button
                key={m.id}
                onClick={() => onSelectMilestone(idx)}
                title={`${m.title}: ${m.subtitle}`}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-[#2563EB] text-white ring-2 ring-blue-200 ring-offset-1 scale-105'
                    : isPassed
                    ? 'bg-slate-300 text-slate-800 hover:bg-slate-400'
                    : 'bg-[#F5F6F8] text-slate-500 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {m.id}
              </button>
            );
          })}
        </div>

        {/* Right: Controls (Play/Pause, Step, Voice, Speed, Reset) */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* Step Back */}
          <button
            onClick={onPrevMilestone}
            disabled={demoState.currentMilestoneIndex === 0}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-40"
            title="Previous Milestone"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              demoState.isActive && !demoState.isPaused
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#2563EB] hover:bg-blue-700 text-white'
            }`}
          >
            {demoState.isActive && !demoState.isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{demoState.isPaused ? 'Resume' : 'Play Walkthrough'}</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onNextMilestone}
            disabled={demoState.currentMilestoneIndex >= JUDGE_MILESTONES.length - 1}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-40"
            title="Next Milestone"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector (1x, 1.5x, 2x) */}
          <button
            onClick={() => {
              const nextSpeed = demoState.speed === 1 ? 1.5 : demoState.speed === 1.5 ? 2 : 1;
              onChangeSpeed(nextSpeed);
            }}
            className="px-2 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-[#F5F6F8] hover:bg-slate-200 text-slate-700"
            title="Playback Speed Multiplier"
          >
            {demoState.speed}x
          </button>

          {/* Speech Audio Voice Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-1.5 rounded-md border transition-colors ${
              demoState.isVoiceMuted
                ? 'bg-slate-100 border-slate-300 text-slate-400'
                : 'bg-blue-50 border-blue-200 text-[#2563EB]'
            }`}
            title={demoState.isVoiceMuted ? 'Voice narration muted (Click to unmute)' : 'Voice narration active (Click to mute)'}
          >
            {demoState.isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
            title="Reset Judge Walkthrough"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
