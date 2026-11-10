import React, { useState } from 'react';
import { Sliders, X, RotateCcw } from 'lucide-react';

interface WhatIfSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  baseAttendees: number;
  basePrivateSharePct: number;
}

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({
  isOpen,
  onClose,
  baseAttendees,
  basePrivateSharePct
}) => {
  const [attendees, setAttendees] = useState(baseAttendees);
  const [rainRate, setRainRate] = useState(0);
  const [privateShare, setPrivateShare] = useState(basePrivateSharePct);
  const [policeCount, setPoliceCount] = useState(42);

  if (!isOpen) return null;

  // Real-time calculated simulation metrics
  const occupancy = 2.5;
  const privateVehicles = Math.round((attendees * (privateShare / 100)) / occupancy);
  const peakIngress = Math.round(privateVehicles * 0.45);

  const baselineCap = 2000;
  const rainPenalty = rainRate >= 7 ? 0.85 : rainRate >= 2 ? 0.90 : 1.0;
  const effectiveCap = Math.round(baselineCap * rainPenalty);
  const addedLoad = Math.round(peakIngress * 0.34);
  const baselineFlow = 1550;
  const projectedSaturation = Math.round(((baselineFlow + addedLoad) / effectiveCap) * 100);

  // Minutes saved
  const directCongestionMultiplier = 1 + Math.max(0, (projectedSaturation - 60) / 60) * 1.35;
  const rainDelay = rainRate > 0 ? 12 : 0;
  const congestedTime = Math.round(20 * directCongestionMultiplier + rainDelay);
  const chosenTime = 14;
  const minutesSaved = Math.max(0, congestedTime - chosenTime);

  const resetDefaults = () => {
    setAttendees(baseAttendees);
    setRainRate(0);
    setPrivateShare(basePrivateSharePct);
    setPoliceCount(42);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] w-full max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-base font-semibold text-[#1F2933]">
              What-If Traffic Sandbox
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Test policy levers and weather disruptions in real time. Adjust sliders to inspect dynamic saturation and delay impacts.
        </p>

        {/* Sliders */}
        <div className="space-y-4">
          {/* 1. Attendees */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Expected crowd:</span>
              <span className="font-bold text-[#2563EB]">{attendees.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="60000"
              step="1000"
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5,000</span>
              <span>35,000</span>
              <span>60,000</span>
            </div>
          </div>

          {/* 2. Rain rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Rainfall intensity:</span>
              <span className="font-bold text-[#2563EB]">
                {rainRate === 0 ? 'Dry (0 mm/h)' : `${rainRate} mm/h (${rainRate >= 7 ? 'Heavy' : 'Moderate'})`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={rainRate}
              onChange={(e) => setRainRate(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 mm/h</span>
              <span>14 mm/h</span>
              <span>25 mm/h</span>
            </div>
          </div>

          {/* 3. Private vehicle share */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Private vehicle mode share:</span>
              <span className="font-bold text-[#2563EB]">{privateShare}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={privateShare}
              onChange={(e) => setPrivateShare(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10% (Metro heavy)</span>
              <span>35% (Baseline)</span>
              <span>60% (Car heavy)</span>
            </div>
          </div>

          {/* 4. Police officer count */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Police officers deployed:</span>
              <span className="font-bold text-[#2563EB]">{policeCount} officers</span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              step="1"
              value={policeCount}
              onChange={(e) => setPoliceCount(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15</span>
              <span>42</span>
              <span>80</span>
            </div>
          </div>
        </div>

        {/* Real-time Calculated Outcomes */}
        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-200 space-y-3">
          <span className="text-xs font-semibold text-slate-700 block">
            Sandbox Projected Outcomes
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Private vehicles</span>
              <div className="text-xl font-bold text-[#1F2933]">
                {privateVehicles.toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Peak saturation</span>
              <div className={`text-xl font-bold ${projectedSaturation > 90 ? 'text-[#EF4444]' : 'text-emerald-600'}`}>
                {projectedSaturation}%
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Delay per commuter</span>
              <div className="text-xl font-bold text-slate-800">
                {congestedTime} <span className="text-xs font-normal">min</span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Minutes saved</span>
              <div className="text-xl font-bold text-emerald-600">
                {minutesSaved} <span className="text-xs font-normal">min</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 pt-1">
            Status: {projectedSaturation > 90 ? (
              <span className="text-rose-600 font-semibold">Critical chokepoints projected. Diversion mandatory.</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Within manageable corridor absorption capacity.</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={resetDefaults}
          className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset sliders</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-xs font-semibold"
        >
          Apply to view
        </button>
      </div>
    </div>
  );
};
