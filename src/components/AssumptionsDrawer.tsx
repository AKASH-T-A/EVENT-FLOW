/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AssumptionsConfig } from '../types';

interface AssumptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assumptions: AssumptionsConfig;
  onApplyAssumptions: (newAssumptions: AssumptionsConfig) => void;
}

export const AssumptionsDrawer: React.FC<AssumptionsDrawerProps> = ({
  isOpen,
  onClose,
  assumptions,
  onApplyAssumptions
}) => {
  const [localConfig, setLocalConfig] = useState<AssumptionsConfig>({ ...assumptions });

  if (!isOpen) return null;

  const handleReset = () => {
    const defaults: AssumptionsConfig = {
      metroSplitPct: 30,
      busSplitPct: 15,
      cabSplitPct: 20,
      privateSplitPct: 35,
      vehicleOccupancy: 2.5,
      rainCapacityCutPct: 15,
      hotspotWeight: 15,
      closedRoadWeight: 20,
      distanceWeight: 0.5,
      rainLowLyingWeight: 10
    };
    setLocalConfig(defaults);
    onApplyAssumptions(defaults);
  };

  const handleSave = () => {
    onApplyAssumptions(localConfig);
    onClose();
  };

  const sumModalSplit =
    localConfig.metroSplitPct +
    localConfig.busSplitPct +
    localConfig.cabSplitPct +
    localConfig.privateSplitPct;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 animate-fadeIn">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 p-6 overflow-y-auto flex flex-col justify-between text-[#1F2933]">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-[#1F2933]">
                Model assumptions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust crowd modal share and route penalty weights
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Formula Explanation */}
          <div className="p-4 rounded-lg bg-[#F5F6F8] border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <strong className="block text-[#1F2933]">Formula references:</strong>
            <p>• Private Vehicles = Attendees × (Private Share / 100) / Occupancy</p>
            <p>• Road Saturation = (Baseline + Event Traffic) / Capacity</p>
            <p>• Cost Score = Time + 15×Jammed + 20×Closed + 0.5×Km + 10×Rain</p>
            <p>• Minutes saved = (travel time of the direct route under predicted congestion) − (travel time of the chosen route)</p>
            <p className="pt-1 text-[11px] text-slate-500 italic">Road capacities and routes are assumed, not measured.</p>
          </div>

          {/* Section 1: Modal Split */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#1F2933]">
                1. Mode share split (Total: {sumModalSplit}%)
              </span>
              {sumModalSplit !== 100 && (
                <span className="text-xs text-amber-600 font-medium">
                  Should equal 100%
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                <span>Namma Metro share</span>
                <span className="text-blue-700">{localConfig.metroSplitPct}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                value={localConfig.metroSplitPct}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, metroSplitPct: Number(e.target.value) })
                }
                className="w-full accent-[#2563EB]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                <span>BMTC Bus share</span>
                <span className="text-blue-700">{localConfig.busSplitPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={localConfig.busSplitPct}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, busSplitPct: Number(e.target.value) })
                }
                className="w-full accent-[#2563EB]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                <span>Cabs & autos share</span>
                <span className="text-blue-700">{localConfig.cabSplitPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={localConfig.cabSplitPct}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, cabSplitPct: Number(e.target.value) })
                }
                className="w-full accent-[#2563EB]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                <span>Private personal vehicles</span>
                <span className="text-blue-700">{localConfig.privateSplitPct}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                value={localConfig.privateSplitPct}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, privateSplitPct: Number(e.target.value) })
                }
                className="w-full accent-[#2563EB]"
              />
            </div>
          </div>

          {/* Section 2: Occupancy & Weather Parameters */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <span className="text-sm font-semibold text-[#1F2933] block">
              2. Vehicle occupancy & weather impact
            </span>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                <span>Vehicle occupancy (people per car)</span>
                <span className="text-blue-700">{localConfig.vehicleOccupancy}</span>
              </div>
              <input
                type="range"
                min={1.2}
                max={4.0}
                step={0.1}
                value={localConfig.vehicleOccupancy}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, vehicleOccupancy: Number(e.target.value) })
                }
                className="w-full accent-[#2563EB]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                <span>Rain road capacity reduction</span>
                <span className="text-blue-700">{localConfig.rainCapacityCutPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                value={localConfig.rainCapacityCutPct}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, rainCapacityCutPct: Number(e.target.value) })
                }
                className="w-full accent-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset defaults
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors"
          >
            Apply assumptions
          </button>
        </div>
      </div>
    </div>
  );
};
