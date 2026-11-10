/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventData, CrowdFlowPrediction, PolicePlan } from '../types';
import { GoogleMapsView } from './GoogleMapsView';
import { LeafletMap } from './LeafletMap';
import { SplitMapComparison } from './SplitMapComparison';

interface MapStageProps {
  event: EventData;
  crowdFlow?: CrowdFlowPrediction;
  activePlan?: PolicePlan;
  isRaining: boolean;
  rainRate?: number;
  timeScrubHour?: number;
  resetCount?: number;
}

export type ViewEngine = 'leaflet' | 'google_maps' | 'split_comparison';

export const MapStage: React.FC<MapStageProps> = ({
  event,
  crowdFlow,
  activePlan,
  isRaining,
  rainRate = 14,
  timeScrubHour = 17.5,
  resetCount
}) => {
  const [engine, setEngine] = useState<ViewEngine>('leaflet'); // Default to clean light Leaflet OSM map

  // Reset view back to standard Leaflet map whenever reset is triggered
  React.useEffect(() => {
    if (resetCount !== undefined && resetCount > 0) {
      setEngine('leaflet');
    }
  }, [resetCount]);

  return (
    <div className="relative w-full h-full flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Clean Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-base font-semibold text-[#1F2933]">
            Area map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {event.venue.split(',')[0]} and surrounding road corridors
          </p>
        </div>

        {/* Quiet View Engine Selector */}
        <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 rounded-md border border-slate-200 text-xs">
          <button
            onClick={() => setEngine('leaflet')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
              engine === 'leaflet'
                ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard map
          </button>
          <button
            onClick={() => setEngine('split_comparison')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
              engine === 'split_comparison'
                ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Before / After Slider
          </button>
          <button
            onClick={() => setEngine('google_maps')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
              engine === 'google_maps'
                ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Maps
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full min-h-[460px] h-[480px]">
        {engine === 'leaflet' && (
          <LeafletMap
            event={event}
            crowdFlow={crowdFlow}
            activePlan={activePlan}
            isRaining={isRaining}
            rainRate={rainRate}
            timeScrubHour={timeScrubHour}
          />
        )}

        {engine === 'split_comparison' && (
          <SplitMapComparison
            event={event}
            crowdFlow={crowdFlow}
            activePlan={activePlan}
            isRaining={isRaining}
            rainRate={rainRate}
            timeScrubHour={timeScrubHour}
          />
        )}

        {engine === 'google_maps' && (
          <GoogleMapsView
            event={event}
            crowdFlow={crowdFlow}
            activePlan={activePlan}
            isRaining={isRaining}
            rainRate={rainRate}
            timeScrubHour={timeScrubHour}
            onFallbackToLeaflet={() => setEngine('leaflet')}
          />
        )}
      </div>
    </div>
  );
};
