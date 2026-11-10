import React from 'react';
import { ComparisonScenarioResult } from '../types';

interface ComparisonCardProps {
  comparison?: ComparisonScenarioResult;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ comparison }) => {
  if (!comparison) {
    return null;
  }

  const {
    busiestRoadSaturationPct,
    jammedRoadsCount,
    avgDelayMinutes,
    metroSharePct,
    roadComparisons,
    spreadingSplits,
    summarySentence
  } = comparison;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5">
      {/* Header with Title and Honest Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#1F2933]">
              Traffic Impact Comparison: Without vs With EventFlow
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-100">
              Load Spreading Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates traffic congestion if all traffic takes the single shortest corridor vs multi-channel dynamic load spreading.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 bg-[#F5F6F8] px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto whitespace-nowrap">
          Sample data. Estimates from stated assumptions.
        </div>
      </div>

      {/* 2-Column Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Without EventFlow Column */}
        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Without EventFlow
            </span>
            <span className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
              Single-Corridor Surge
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Busiest road</span>
              <div className="text-2xl font-bold text-[#EF4444] mt-0.5">
                {busiestRoadSaturationPct.without}%
              </div>
              <span className="text-[11px] text-rose-600 block mt-0.5">Critical gridlock</span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Jammed roads</span>
              <div className="text-2xl font-bold text-[#EF4444] mt-0.5">
                {jammedRoadsCount.without}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Over 85% capacity</span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Avg delay / driver</span>
              <div className="text-2xl font-bold text-slate-800 mt-0.5">
                {avgDelayMinutes.without} <span className="text-xs font-normal text-slate-500">min</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">Direct bottleneck</span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Metro share</span>
              <div className="text-2xl font-bold text-slate-800 mt-0.5">
                {metroSharePct.without}%
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">Baseline ridership</span>
            </div>
          </div>
        </div>

        {/* With EventFlow Column */}
        <div className="p-4 bg-blue-50/40 rounded-lg border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide">
              With EventFlow
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
              Multi-Channel Spreading
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-[11px] font-medium text-slate-500 block">Busiest road</span>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                {busiestRoadSaturationPct.with}%
              </div>
              <span className="text-[11px] text-emerald-600 block mt-0.5">Under 85% safe cap</span>
            </div>

            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-[11px] font-medium text-slate-500 block">Jammed roads</span>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                {jammedRoadsCount.with}
              </div>
              <span className="text-[11px] text-emerald-600 block mt-0.5">Zero jammed roads</span>
            </div>

            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-[11px] font-medium text-slate-500 block">Avg delay / driver</span>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                {avgDelayMinutes.with} <span className="text-xs font-normal text-slate-500">min</span>
              </div>
              <span className="text-[11px] text-emerald-600 block mt-0.5">
                -{avgDelayMinutes.without - avgDelayMinutes.with} min reduction
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-[11px] font-medium text-slate-500 block">Metro share</span>
              <div className="text-2xl font-bold text-[#2563EB] mt-0.5">
                {metroSharePct.with}%
              </div>
              <span className="text-[11px] text-[#2563EB] block mt-0.5">
                +{metroSharePct.with - metroSharePct.without}% high frequency
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Comparison Sentence */}
      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm text-[#1F2933]">
        <strong className="text-slate-900 font-semibold">Dynamic Insight: </strong>
        <span>{summarySentence}</span>
      </div>

      {/* Mini Saturation Bar Chart per Road */}
      {roadComparisons && roadComparisons.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-[#1F2933]">Road Saturation Comparison</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block"></span>
                Without EventFlow
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB] inline-block"></span>
                With EventFlow (Spread)
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {roadComparisons.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#1F2933] font-medium truncate max-w-[280px]">
                    {item.roadName}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    <span className="text-rose-600 font-semibold">{item.withoutSaturationPct}%</span>
                    {' → '}
                    <span className="text-[#2563EB] font-semibold">{item.withSaturationPct}%</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Without Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                    <div
                      className={`h-full ${
                        item.withoutSaturationPct > 100
                          ? 'bg-rose-600'
                          : item.withoutSaturationPct > 85
                          ? 'bg-rose-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, item.withoutSaturationPct)}%` }}
                    />
                  </div>

                  {/* With Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                    <div
                      className={`h-full ${
                        item.withSaturationPct > 85
                          ? 'bg-amber-500'
                          : 'bg-[#2563EB]'
                      }`}
                      style={{ width: `${Math.min(100, item.withSaturationPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spreading Allocation Plan */}
      {spreadingSplits && spreadingSplits.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-[#1F2933] block">
            Load Spreading Allocation Scheme
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {spreadingSplits.map((split, i) => (
              <div key={i} className="p-2.5 bg-[#F5F6F8] rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="truncate">{split.name}</span>
                  <span className="text-[#2563EB] font-mono text-sm ml-1">{split.percentage}%</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{split.assignedVehicles.toLocaleString()} vehicles</span>
                  {split.resultingSaturationPct != null && (
                    <span className="font-medium text-slate-700">
                      ~{split.resultingSaturationPct}% sat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
