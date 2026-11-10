/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EventData, PolicePlan, OperatingMode, LiveScenarioStatus, ScenarioState } from '../types';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface TopBarProps {
  events: EventData[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onStartScenario: () => void;
  onRunAgent: () => void;
  onApprovePlan?: () => void;
  onToggleRain: () => void;
  onToggleDelay: () => void;
  onReset: () => void;
  onOpenAssumptions: () => void;
  onOpenAddEvent?: () => void;
  onOpenWhatIf?: () => void;
  onOpenAfterAction?: () => void;
  operatingMode: OperatingMode;
  onToggleOperatingMode: () => void;
  isAgentRunning: boolean;
  scenarioState: ScenarioState;
  activePlan?: PolicePlan;
  isRainSimulated: boolean;
  isDelaySimulated: boolean;
  matchDelayMins: number;
  liveScenario: LiveScenarioStatus;
  currentHour: number;
  onHourChange: (hour: number) => void;
  isTimelinePlaying: boolean;
  onToggleTimelinePlay: () => void;
  hasAlerts: boolean;
  hasCrowdFlow: boolean;
  weatherSource?: string;
  modeNotice?: string | null;
}

// Convert decimal hour to human readable e.g. 18.5 -> "6:30 PM"
function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour % 1) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

export const TopBar: React.FC<TopBarProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  onStartScenario,
  onRunAgent,
  onApprovePlan,
  onToggleRain,
  onToggleDelay,
  onReset,
  onOpenAssumptions,
  onOpenAddEvent,
  onOpenWhatIf,
  onOpenAfterAction,
  isAgentRunning,
  scenarioState,
  activePlan,
  isRainSimulated,
  isDelaySimulated,
  liveScenario,
  currentHour,
  onHourChange,
  isTimelinePlaying,
  onToggleTimelinePlay,
  hasAlerts,
  hasCrowdFlow,
  operatingMode,
  onToggleOperatingMode,
  weatherSource,
  modeNotice
}) => {
  // Determine current active step (1 to 4)
  let currentStep = 1;
  if (hasAlerts && activePlan?.status === 'approved') {
    currentStep = 4; // 4. Alert commuters
  } else if (activePlan?.status === 'awaiting_approval') {
    currentStep = 3; // 3. Police approval
  } else if (activePlan || hasCrowdFlow) {
    currentStep = 2; // 2. Plan diversions
  } else {
    currentStep = 1; // 1. Predict traffic
  }

  const steps = [
    { number: 1, label: 'Predict traffic' },
    { number: 2, label: 'Plan diversions' },
    { number: 3, label: 'Police approval' },
    { number: 4, label: 'Alert commuters' }
  ];

  const weatherLabel = operatingMode === 'demo'
    ? 'Simulated weather'
    : (weatherSource || 'Open-Meteo live');

  return (
    <header className="bg-white border-b border-slate-200 text-[#1F2933]">
      {/* Mode Notice Banner (e.g. fallback when Live AI unavailable) */}
      {modeNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs font-medium text-amber-800 flex items-center justify-between">
          <span>{modeNotice}</span>
          <span className="text-[11px] text-amber-700">Resumed with zero disruption</span>
        </div>
      )}

      {/* 1. Header: Product Name + Selected Event + Operating Mode Badge + Weather Source + Sample Data */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1F2933] tracking-tight">
              EventFlow
            </span>
          </div>

          <span className="hidden sm:inline-block w-px h-5 bg-slate-200"></span>

          {/* Event Selector */}
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
              disabled={scenarioState !== 'idle' && scenarioState !== 'complete'}
              aria-label="Select Event"
              className="bg-[#F5F6F8] hover:bg-slate-100 border border-slate-200 rounded-md text-sm font-medium text-[#1F2933] py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {events.map((ev, idx) => (
                <option key={`${ev.id}_${idx}`} value={ev.id}>
                  {ev.name} ({ev.venue.split(',')[0]}, Sat {ev.startTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Persistent Mode Badge */}
          <button
            onClick={onToggleOperatingMode}
            title="Click to toggle between Demo mode and Live AI mode"
            className={`text-xs px-2.5 py-1 rounded font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
              operatingMode === 'live_ai'
                ? 'bg-blue-50 text-[#2563EB] border-blue-300'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {operatingMode === 'live_ai' ? 'Live AI mode' : 'Demo mode (scripted)'}
          </button>

          {/* Weather Source Indicator */}
          <span className="text-xs text-slate-500 bg-[#F5F6F8] border border-slate-200 px-2 py-1 rounded">
            Weather: {weatherLabel}
          </span>

          <button
            onClick={onOpenAssumptions}
            className="text-xs font-medium text-slate-600 hover:text-[#2563EB] underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            Assumptions
          </button>

          {onOpenWhatIf && (
            <button
              onClick={onOpenWhatIf}
              className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-2 py-1 rounded transition-colors"
            >
              What-If Sandbox
            </button>
          )}

          {onOpenAddEvent && (
            <button
              onClick={onOpenAddEvent}
              className="text-xs font-medium text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors"
            >
              + Add Event
            </button>
          )}

          {onOpenAfterAction && (
            <button
              onClick={onOpenAfterAction}
              className="text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded transition-colors"
            >
              Learning Report
            </button>
          )}

          {/* Honest Sample Data Badge */}
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2.5 py-1 rounded font-medium">
            Sample data. Estimates from stated assumptions.
          </span>
        </div>
      </div>

      {/* 2. 4-Step Progress Bar Under Header */}
      <div className="px-6 py-2.5 bg-[#F5F6F8] border-b border-slate-200">
        <div className="flex items-center justify-between max-w-4xl mx-auto text-sm">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <React.Fragment key={s.number}>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white'
                        : isCompleted
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {s.number}
                  </span>
                  <span
                    className={`text-sm ${
                      isCurrent
                        ? 'font-bold text-[#2563EB]'
                        : isCompleted
                        ? 'font-medium text-slate-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <span className="text-slate-400 select-none hidden sm:inline">
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Scenario Controls & Timeline Slider in One Quiet Row */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Scenario buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Start demo button: disabled while scenario is running (except pause toggle when live scenario is running) */}
          <button
            onClick={onStartScenario}
            disabled={!liveScenario.isActive && scenarioState !== 'idle' && scenarioState !== 'complete'}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed ${
              liveScenario.isActive
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#2563EB] hover:bg-blue-700 text-white'
            }`}
          >
            {liveScenario.isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause demo ({Math.round(liveScenario.progressPct)}%)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start demo</span>
              </>
            )}
          </button>

          {/* Approve plan button: disabled unless in awaiting_approval or awaiting_approval_rev2 */}
          {onApprovePlan && (
            <button
              onClick={onApprovePlan}
              disabled={scenarioState !== 'awaiting_approval' && scenarioState !== 'awaiting_approval_rev2'}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed ${
                scenarioState === 'awaiting_approval' || scenarioState === 'awaiting_approval_rev2'
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Approve plan</span>
            </button>
          )}

          {/* Simulate heavy rain: disabled unless plan is approved or complete */}
          <button
            onClick={onToggleRain}
            disabled={scenarioState !== 'approved' && scenarioState !== 'complete'}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed ${
              isRainSimulated
                ? 'bg-blue-50 border-blue-300 text-[#2563EB]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isRainSimulated ? 'Rain: 14 mm/h active' : 'Simulate heavy rain'}
          </button>

          {/* Simulate match delay: disabled unless plan is approved or complete */}
          <button
            onClick={onToggleDelay}
            disabled={scenarioState !== 'approved' && scenarioState !== 'complete'}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed ${
              isDelaySimulated
                ? 'bg-blue-50 border-blue-300 text-[#2563EB]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isDelaySimulated ? 'Match delayed (+45m)' : 'Simulate match delay'}
          </button>

          {/* Reset button: works in every state */}
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>

        {/* Timeline Slider with Clear Time Label */}
        <div className="flex items-center gap-3 bg-[#F5F6F8] px-3.5 py-1.5 rounded-lg border border-slate-200">
          <button
            onClick={onToggleTimelinePlay}
            title={isTimelinePlaying ? 'Pause time scrubber' : 'Play time scrubber'}
            className="p-1 rounded text-slate-600 hover:text-slate-900 transition-colors"
          >
            {isTimelinePlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          <span className="text-sm font-semibold text-[#1F2933] min-w-[105px]">
            Time: {formatHour(currentHour)}
          </span>

          <input
            type="range"
            min={15.0}
            max={23.5}
            step={0.25}
            value={currentHour}
            onChange={(e) => onHourChange(parseFloat(e.target.value))}
            aria-label="Time slider"
            className="w-28 sm:w-44 accent-[#2563EB] cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};
