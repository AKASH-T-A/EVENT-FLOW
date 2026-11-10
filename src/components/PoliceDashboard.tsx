/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PolicePlan } from '../types';
import { Check, X } from 'lucide-react';
import { ComparisonCard } from './ComparisonCard';

interface PoliceDashboardProps {
  plan?: PolicePlan;
  previousPlan?: PolicePlan;
  onApprove: () => void;
  onReject?: () => void;
  isAgentRunning: boolean;
}

export const PoliceDashboard: React.FC<PoliceDashboardProps> = ({
  plan,
  previousPlan,
  onApprove,
  onReject,
  isAgentRunning
}) => {
  const isAwaiting = plan?.status === 'awaiting_approval';
  const isApproved = plan?.status === 'approved';
  const isRejected = plan?.status === 'rejected';

  const isUpdatedPlan = Boolean(previousPlan && previousPlan.id !== plan?.id);

  // Safe calculated numbers or '–'
  const displayVehicles =
    plan?.kpis?.privateVehiclesExpected != null && !isNaN(plan.kpis.privateVehiclesExpected)
      ? Math.max(0, Math.round(plan.kpis.privateVehiclesExpected)).toLocaleString()
      : '–';

  const rawSaturation = plan?.kpis?.peakRoadSaturation;
  const displaySaturation =
    rawSaturation != null && !isNaN(rawSaturation)
      ? `${Math.max(0, Math.min(300, Math.round(rawSaturation)))}%`
      : '–';

  const displayHotspots =
    plan?.kpis?.hotspotsCount != null && !isNaN(plan.kpis.hotspotsCount)
      ? Math.max(0, plan.kpis.hotspotsCount)
      : '–';

  const displayMinutesSaved =
    plan?.kpis?.estimatedMinutesSaved != null && !isNaN(plan.kpis.estimatedMinutesSaved)
      ? `${Math.max(0, Math.round(plan.kpis.estimatedMinutesSaved))} min`
      : '–';

  const evaluatedRoutes = plan?.routeScoring?.evaluatedRoutes || [];
  const selectedRouteId = plan?.routeScoring?.selectedRouteId;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 text-[#1F2933]">
      {/* Header and Approval Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#1F2933]">
              Recommended plan
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              Revision {plan?.version != null ? plan.version : '–'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Traffic diversion and crowd dispersal proposal for police operator approval
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {isApproved ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-lg">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Plan approved and active</span>
            </div>
          ) : isRejected ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">
              <X className="w-4 h-4 text-slate-500" />
              <span>Plan rejected</span>
            </div>
          ) : isAwaiting ? (
            <div className="flex items-center gap-2.5">
              {onReject && (
                <button
                  onClick={onReject}
                  disabled={isAgentRunning}
                  aria-label="Reject plan"
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  Reject
                </button>
              )}
              <button
                onClick={onApprove}
                disabled={isAgentRunning}
                aria-label="Approve plan"
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Approve plan</span>
              </button>
            </div>
          ) : (
            <span className="text-sm text-slate-400">
              {isAgentRunning ? 'Agent calculating...' : 'Awaiting agent analysis'}
            </span>
          )}
        </div>
      </div>

      {/* Rain / Re-plan Mismatch Banner if plan changed */}
      {isUpdatedPlan && previousPlan && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <span>Adaptive Re-Plan Active (Revision {plan?.version})</span>
          </div>
          <p className="text-xs text-amber-800">
            Environmental condition changed. Low-lying underpass depressions ruled out. Traffic diverted via flood-safe elevated corridor.
          </p>
        </div>
      )}

      {/* 4 Big Key Numbers (28px font) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">
            Vehicles expected
          </span>
          <div className="text-[28px] font-bold text-[#1F2933] mt-1 leading-tight">
            {displayVehicles}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {plan ? 'Arrival surge window' : 'No plan active'}
          </span>
        </div>

        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">
            Peak saturation
          </span>
          <div className="text-[28px] font-bold text-[#EF4444] mt-1 leading-tight">
            {displaySaturation}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {plan?.kpis?.peakRoadSaturation && plan.kpis.peakRoadSaturation > 90 ? 'Jammed chokepoints' : plan ? 'Optimal flow' : 'No plan active'}
          </span>
        </div>

        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">
            Jammed roads
          </span>
          <div className="text-[28px] font-bold text-[#1F2933] mt-1 leading-tight">
            {displayHotspots}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Exceeding 90% capacity
          </span>
        </div>

        <div className="p-4 bg-[#F5F6F8] rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">
            Minutes saved per commuter
          </span>
          <div className="text-[28px] font-bold text-[#10B981] mt-1 leading-tight">
            {displayMinutesSaved}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Delay reduction vs direct
          </span>
        </div>
      </div>

      {/* Plan Summary in Plain Language */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#1F2933]">
          Why this route was chosen
        </h3>

        {/* Previous plan struck through if updated */}
        {previousPlan && isUpdatedPlan && (
          <div className="text-sm text-slate-400 line-through p-3 bg-slate-50 rounded border border-slate-200">
            <strong>Previous Plan (Rev {previousPlan.version}): </strong>
            {previousPlan.summary}
          </div>
        )}

        <p className="text-sm text-slate-700 leading-relaxed bg-[#F5F6F8] p-4 rounded-lg border border-slate-100">
          {plan?.summary ||
            'Awaiting agent analysis. Click "Start demo" or run the agent to observe traffic build-up, identify chokepoints, and generate an actionable diversion plan.'}
        </p>
      </div>

      {/* Prominently Placed Comparison Card: Without vs With EventFlow */}
      {plan?.comparison && (
        <ComparisonCard comparison={plan.comparison} />
      )}

      {/* Route Comparison Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1F2933]">
            Evaluated diversion routes
          </h3>
          {plan?.spreadingSplits && (
            <span className="text-xs text-slate-500">
              Multi-route load spreading active
            </span>
          )}
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F6F8] border-b border-slate-200 text-xs font-medium text-slate-600">
              <tr>
                <th className="py-2.5 px-4">Route</th>
                <th className="py-2.5 px-4">Distance</th>
                <th className="py-2.5 px-4">Estimated time</th>
                <th className="py-2.5 px-4">Cost score</th>
                <th className="py-2.5 px-4">Allocation</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {evaluatedRoutes.length > 0 ? (
                evaluatedRoutes.map((r, idx) => {
                  const isSelected = r.id === selectedRouteId;
                  // Look up spreading split for this route
                  const splitMatch = plan?.spreadingSplits?.find(s => s.type === 'route' && (s.name.includes(r.name) || r.name.includes(s.name.split(':')[0])));
                  const fallbackPct = isSelected ? (plan?.spreadingSplits?.[0]?.percentage || 45) : (idx === 1 ? (plan?.spreadingSplits?.[1]?.percentage || 25) : 0);
                  const displayAllocation = splitMatch ? splitMatch.percentage : fallbackPct;

                  return (
                    <tr key={r.id} className={isSelected ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-4 text-[#1F2933]">
                        {r.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.distanceKm != null ? `${r.distanceKm.toFixed(1)} km` : '–'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.travelTimeMins != null ? `${r.travelTimeMins} mins` : '–'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {r.score != null ? r.score : '–'}
                      </td>
                      <td className="py-3 px-4">
                        {displayAllocation > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-[#2563EB]">
                            {displayAllocation}% load
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0%</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isSelected ? (
                          <span className="inline-block bg-[#2563EB] text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                            Primary
                          </span>
                        ) : displayAllocation > 0 ? (
                          <span className="inline-block bg-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded">
                            Secondary
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Rejected (Score {r.score})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-slate-500">
                    No diversion routes evaluated yet. Run agent to calculate alternate corridors.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personnel Deployment & Metro Request */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 border border-slate-200 rounded-lg bg-white">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Personnel deployment
          </span>
          {plan ? (
            <>
              <p className="text-sm text-slate-700 font-medium">
                {plan.personnelCount} traffic officers deployed across {plan.personnelDeployment?.length || 4} junctions:
              </p>
              <ul className="text-xs text-slate-600 mt-2 space-y-1">
                {plan.personnelDeployment && plan.personnelDeployment.length > 0 ? (
                  plan.personnelDeployment.map((d, i) => (
                    <li key={i}>• {d.junction}: {d.officers} officers</li>
                  ))
                ) : (
                  <li>• Personnel allocation active</li>
                )}
              </ul>
            </>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Personnel deployment is formulated once traffic saturation is evaluated.</p>
          )}
        </div>

        {/* Metro Active Lever: Recommendation to BMRCL with Math */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#2563EB] block">
              BMRCL Metro Active Lever (Inter-Agency Recommendation)
            </span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              Advisory only
            </span>
          </div>

          {plan?.metroLever ? (
            <div className="space-y-2.5 mt-2">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {plan.metroLever.recommendationText}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white p-2 rounded border border-blue-100 text-xs">
                  <span className="text-[10px] text-slate-500 block">Headway cut</span>
                  <div className="font-bold text-[#2563EB] text-sm">
                    {plan.metroLever.normalHeadwayMins}m → {plan.metroLever.recommendedHeadwayMins}m
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 text-xs">
                  <span className="text-[10px] text-slate-500 block">Extra trains</span>
                  <div className="font-bold text-[#1F2933] text-sm">
                    +{plan.metroLever.additionalTrainsNeeded} rakes
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 text-xs">
                  <span className="text-[10px] text-slate-500 block">Capacity added</span>
                  <div className="font-bold text-[#1F2933] text-sm">
                    +{plan.metroLever.peakHourCapacityAdded.toLocaleString()} pax/h
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 text-xs">
                  <span className="text-[10px] text-slate-500 block">Cars removed</span>
                  <div className="font-bold text-emerald-600 text-sm">
                    ~{plan.metroLever.vehiclesRemoved.toLocaleString()} vehicles
                  </div>
                </div>
              </div>
            </div>
          ) : plan?.metroRequest ? (
            <>
              <p className="text-sm text-slate-700 font-medium">
                BMRCL {plan.metroRequest.line} recommendation:
              </p>
              <ul className="text-xs text-slate-600 mt-2 space-y-1">
                <li>• Recommends headway: <strong>{plan.metroRequest.headway}</strong></li>
                <li>• Duration: {plan.metroRequest.duration}</li>
              </ul>
            </>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Transit surge recommendation is calculated once modal split is observed.</p>
          )}
        </div>
      </div>

      {/* Phase 2: Staggered Exit Plan (3-4 Waves) */}
      {plan?.exitPlan && (
        <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-sm font-semibold text-[#1F2933]">
                Staggered Exit Plan (Post-Event Egress Waves)
              </h4>
              <p className="text-xs text-slate-500">
                Prevents sudden post-match crowd gridlock by releasing attendees in 8-10 minute zoned waves.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {plan.exitPlan.peakReductionPct}% peak reduction
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-[#F5F6F8] rounded text-xs text-slate-700">
            <strong>Egress Dynamics: </strong>
            <span>{plan.exitPlan.summary}</span>
          </div>

          {/* Waves Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plan.exitPlan.waves.map((w) => (
              <div key={w.waveNumber} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2933]">
                    Wave {w.waveNumber}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#2563EB]">
                    {w.timeWindow}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium truncate">
                  {w.gateScope}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>~{w.attendeeVolume.toLocaleString()} attendees</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    w.priorityMode === 'metro_priority'
                      ? 'bg-purple-100 text-purple-700'
                      : w.priorityMode === 'bus_shuttle'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {w.priorityMode === 'metro_priority' ? 'Metro Priority' : w.priorityMode === 'bus_shuttle' ? 'BMTC Shuttles' : 'Cab / Car Bay'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                  <span>Projected exit saturation:</span>
                  <span className="font-semibold text-slate-800">{w.projectedPeakSaturationPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 4: Emergency Green Corridor Protected Status */}
      {plan?.emergencyCorridorStatus && (
        <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          plan.emergencyCorridorStatus.saturationPct > 70
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-emerald-50/40 border-emerald-200 text-slate-800'
        }`}>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block"></span>
              <h4 className="text-sm font-semibold">
                {plan.emergencyCorridorStatus.name}
              </h4>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                Protected Green Route
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {plan.emergencyCorridorStatus.protectedRoute} → <strong>{plan.emergencyCorridorStatus.destination}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Corridor load</span>
              <span className={`text-base font-bold ${
                plan.emergencyCorridorStatus.saturationPct > 70 ? 'text-rose-600' : 'text-emerald-700'
              }`}>
                {plan.emergencyCorridorStatus.saturationPct}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Diversion isolation</span>
              <span className="text-emerald-700 font-semibold text-xs">
                100% Excluded from Spreading
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
