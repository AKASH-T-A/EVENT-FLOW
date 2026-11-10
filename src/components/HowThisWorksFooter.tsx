/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const HowThisWorksFooter: React.FC = () => {
  const steps = [
    {
      step: '1. Observe',
      title: 'Context & Weather',
      description: 'Reads event schedule, attendee capacity, and real-time precipitation via Open-Meteo.'
    },
    {
      step: '2. Predict',
      title: 'Crowd Traffic Impact',
      description: 'Estimates travel mode split (30% Metro, 15% Bus, 20% Cab, 35% Private) and identifies jammed corridors.'
    },
    {
      step: '3. Plan',
      title: 'Route Diversions',
      description: 'Scores alternate bypass routes based on travel time, chokepoints avoided, and flood risks.'
    },
    {
      step: '4. Act',
      title: 'Police Authorization',
      description: 'Requires officer approval to enforce road diversions and send commuter notifications.'
    },
    {
      step: '5. Monitor',
      title: 'Continuous Tracking',
      description: 'Detects unexpected downpours or schedule delays and automatically recalculates alternate routes.'
    }
  ];

  return (
    <footer className="bg-white border border-slate-200 rounded-lg p-5 text-[#1F2933]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1F2933]">
            System methodology
          </h3>
          <p className="text-xs text-slate-500">
            Autonomous decision workflow and human-in-the-loop verification
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Bengaluru Traffic Police & Namma Metro
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((st, i) => (
          <div key={i} className="p-3 bg-[#F5F6F8] rounded border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-blue-700 block">
              {st.step}
            </span>
            <h4 className="font-semibold text-xs text-[#1F2933]">
              {st.title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {st.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-500">
        <span>EventFlow Traffic Management Prototype</span>
        <span>Sample data. Estimates from stated assumptions.</span>
      </div>
    </footer>
  );
};
