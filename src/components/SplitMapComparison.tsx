import React, { useState } from 'react';
import { EventData, CrowdFlowPrediction, PolicePlan } from '../types';
import { LeafletMap } from './LeafletMap';

interface SplitMapComparisonProps {
  event: EventData;
  crowdFlow?: CrowdFlowPrediction;
  activePlan?: PolicePlan;
  isRaining: boolean;
  rainRate?: number;
  timeScrubHour?: number;
}

export const SplitMapComparison: React.FC<SplitMapComparisonProps> = ({
  event,
  crowdFlow,
  activePlan,
  isRaining,
  rainRate,
  timeScrubHour
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Synthesize uncoordinated "Without EventFlow" data:
  // All diverted vehicles cascade into Queens Road & Infantry Road (critical gridlock, 185% saturation)
  const uncoordinatedCrowdFlow: CrowdFlowPrediction | undefined = crowdFlow ? {
    ...crowdFlow,
    peakSaturationPct: 185,
    hotspotCount: 4,
    roadSaturations: crowdFlow.roadSaturations.map((r, i) => ({
      ...r,
      saturationPct: i === 0 ? 185 : i === 1 ? 135 : r.saturationPct,
      isHotspot: true
    }))
  } : undefined;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPos = Math.max(10, Math.min(90, (x / rect.width) * 100));
    setSliderPos(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already released
    }
  };

  return (
    <div
      className="relative w-full h-full min-h-[460px] select-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Layer 1 (Full): Right Side - "With EventFlow" (Load Spreading + Emergency Corridor) */}
      <div className="absolute inset-0 w-full h-full">
        <LeafletMap
          event={event}
          crowdFlow={crowdFlow}
          activePlan={activePlan}
          isRaining={isRaining}
          rainRate={rainRate}
          timeScrubHour={timeScrubHour}
        />
        {/* Right Label Badge */}
        <div className="absolute top-3 right-3 z-[1001] bg-blue-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md pointer-events-none flex items-center gap-1.5">
          <span>With EventFlow</span>
          <span className="text-blue-100 font-normal text-[11px]">(84% cap • Emergency corridor active)</span>
        </div>
      </div>

      {/* Layer 2 (Clipped): Left Side - "Without EventFlow" (Uncoordinated Choke) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <div className="relative w-full h-full pointer-events-auto">
          <LeafletMap
            event={event}
            crowdFlow={uncoordinatedCrowdFlow}
            activePlan={undefined} // No diversion plan
            isRaining={isRaining}
            rainRate={rainRate}
            timeScrubHour={timeScrubHour}
          />
          {/* Left Label Badge */}
          <div className="absolute top-3 left-3 z-[1001] bg-rose-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md pointer-events-none flex items-center gap-1.5">
            <span>Without EventFlow</span>
            <span className="text-rose-100 font-normal text-[11px]">(185% gridlock • 4 jammed roads)</span>
          </div>
        </div>
      </div>

      {/* Draggable Divider Handle */}
      <div
        className="absolute top-0 bottom-0 z-[1002] w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg hover:w-1.5 transition-all"
        style={{ left: `${sliderPos}%` }}
        onPointerDown={handlePointerDown}
      >
        <div className="w-8 h-8 rounded-full bg-white border-2 border-[#2563EB] shadow-md flex items-center justify-center text-xs font-bold text-[#2563EB] select-none hover:scale-110 transition-transform">
          ⇄
        </div>
      </div>

      {/* Floating Prompt at Bottom */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-[1001] bg-slate-900/80 text-white text-xs px-3.5 py-1 rounded-full shadow-md pointer-events-none backdrop-blur-xs flex items-center gap-2">
        <span className="text-amber-400 font-bold">Swipe Slider</span>
        <span>Drag divider to compare uncoordinated vs multi-channel traffic flow</span>
      </div>
    </div>
  );
};
