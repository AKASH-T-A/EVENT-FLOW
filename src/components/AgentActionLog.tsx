/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AgentActionLog, AgentReasoning } from '../types';
import { ChevronDown, ChevronRight, Check, Clock } from 'lucide-react';

interface AgentActionLogProps {
  logs: AgentActionLog[];
  reasoning?: AgentReasoning;
  isRunning: boolean;
  triggerBadge?: string;
}

// Convert internal tool calls into clear plain English for a traffic police officer
function getPlainEnglishDescription(log: AgentActionLog): string {
  switch (log.toolName) {
    case 'get_event_details':
      return 'Loaded event schedule and venue capacity (35,000 attendees)';
    case 'get_event_status':
      return 'Checked event phase: Spectator arrival window active';
    case 'get_weather': {
      const rain = (log.args as any)?.rain_mm_per_hr || (log.fullResult as any)?.rainMmPerHr;
      if (rain && rain > 0) {
        return `Checked weather: Rain reported at ${rain} mm/h (road capacity reduced by 15%)`;
      }
      return 'Checked weather: Clear skies, no precipitation expected';
    }
    case 'estimate_crowd_flow':
      return 'Calculated crowd arrival flow: 4,900 private vehicles expected on nearby roads';
    case 'find_alternate_routes':
      return 'Identified 3 alternative routes avoiding saturated roads';
    case 'score_routes':
      return 'Scored candidate routes and selected the fastest diversion corridor';
    case 'get_transit_options':
      return 'Coordinated with Namma Metro: Frequency increased to every 4 minutes';
    case 'create_police_plan':
      return 'Drafted police diversion plan with 18 officers stationed at key junctions';
    case 'send_alert':
      return 'Dispatched commuter alerts in English, Kannada, and Hindi';
    case 'monitor':
      return 'Monitoring live traffic speeds and weather conditions';
    default:
      return log.resultPreview || 'Completed operational task';
  }
}

export const AgentActionLogComponent: React.FC<AgentActionLogProps> = ({
  logs,
  reasoning,
  isRunning,
  triggerBadge
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full text-[#1F2933]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div>
          <h2 className="text-base font-semibold text-[#1F2933]">
            What the agent is doing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step traffic observation, prediction, and actions
          </p>
        </div>

        {isRunning && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Agent running
          </span>
        )}
      </div>

      {/* Trigger alert if re-planning occurred */}
      {triggerBadge && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold block mb-0.5">Plan update triggered</strong>
          {triggerBadge}
        </div>
      )}

      {/* Plain action rows list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] scrollbar-thin">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <p className="font-medium text-slate-600">No actions recorded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Start the demo or run the agent to observe conditions and formulate a diversion plan.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const plainText = getPlainEnglishDescription(log);

            return (
              <div
                key={log.id}
                className="border border-slate-200 rounded p-3 text-sm transition-colors hover:border-slate-300 animate-fadeInItem"
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="mt-0.5 text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1F2933] leading-snug">
                        {plainText}
                      </p>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Clean Status Pill */}
                  <div className="flex-shrink-0">
                    {log.status === 'done' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    ) : log.status === 'running' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                        <Clock className="w-3 h-3 animate-spin" />
                        In progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium">
                        Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Technical View */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 bg-slate-50 p-2.5 rounded font-mono text-slate-700">
                    <div>
                      <span className="text-slate-400 select-none">Tool: </span>
                      <strong className="text-blue-700 font-semibold">{log.toolName}</strong>
                    </div>
                    {log.durationMs !== undefined && (
                      <div>
                        <span className="text-slate-400 select-none">Duration: </span>
                        <span>{log.durationMs}ms</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 select-none">Arguments: </span>
                      <pre className="mt-1 text-[11px] whitespace-pre-wrap break-all text-slate-600">
                        {JSON.stringify(log.args, null, 2)}
                      </pre>
                    </div>
                    {log.fullResult != null && (
                      <div>
                        <span className="text-slate-400 select-none">Output: </span>
                        <pre className="mt-1 text-[11px] whitespace-pre-wrap break-all text-slate-600 max-h-40 overflow-y-auto">
                          {typeof log.fullResult === 'object'
                            ? JSON.stringify(log.fullResult, null, 2)
                            : String(log.fullResult)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reasoning Summary */}
      {reasoning && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <h3 className="text-xs font-semibold text-slate-700 mb-1">
            Agent reasoning summary
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {reasoning.overview || reasoning.routeSelectionRationale}
          </p>
        </div>
      )}
    </div>
  );
};
