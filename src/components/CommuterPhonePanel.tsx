/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CommuterAlert, SupportedLanguage } from '../types';

interface CommuterPhonePanelProps {
  alerts: CommuterAlert[];
  isPlanApproved: boolean;
  selectedLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
}

export const CommuterPhonePanel: React.FC<CommuterPhonePanelProps> = ({
  alerts,
  isPlanApproved,
  selectedLanguage,
  onChangeLanguage
}) => {
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [telegramStatus, setTelegramStatus] = React.useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle');

  // Filter alerts based on role
  const filteredAlerts = alerts.filter(a => {
    if (selectedRole === 'all') return true;
    if (selectedRole === 'attendees') return a.group === 'ticket_holders';
    if (selectedRole === 'commuters') return a.group === 'commuters' || a.group === 'all';
    if (selectedRole === 'residents') return a.group === 'residents';
    if (selectedRole === 'taxi_drivers') return a.group === 'taxi_drivers';
    return true;
  });

  const handleTelegramDispatch = async () => {
    setTelegramStatus('sending');
    try {
      const res = await fetch('/api/agent/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alerts: alerts.slice(0, 3),
          role: selectedRole,
          language: selectedLanguage
        })
      });
      if (res.ok) {
        setTelegramStatus('sent');
      } else {
        setTelegramStatus('fallback');
      }
    } catch {
      setTelegramStatus('fallback');
    }
    setTimeout(() => setTelegramStatus('idle'), 4000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 text-[#1F2933]">
      {/* Header and Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#1F2933]">
              Role-Based Alerts & Telegram Dispatch
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Targeted notifications segmented by audience in English, Kannada, and Hindi
          </p>
        </div>

        {/* Clean Language Selector */}
        <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => onChangeLanguage('en')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              selectedLanguage === 'en'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onChangeLanguage('kn')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              selectedLanguage === 'kn'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => onChangeLanguage('hi')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              selectedLanguage === 'hi'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Phase 5: Role-based Filter Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All alerts' },
            { id: 'attendees', label: 'Ticket holders' },
            { id: 'commuters', label: 'Through-traffic' },
            { id: 'residents', label: 'Local residents' },
            { id: 'taxi_drivers', label: 'Taxis & Autos' }
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedRole === role.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-[#F5F6F8] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Phase 8: Optional Telegram Dispatch Button */}
        <button
          onClick={handleTelegramDispatch}
          disabled={alerts.length === 0 || telegramStatus === 'sending'}
          className={`px-3 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
            telegramStatus === 'sent'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : telegramStatus === 'fallback'
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
          }`}
          title="Dispatches to Telegram channel via Bot API (or displays interactive in-app preview)"
        >
          <span>✈️</span>
          <span>
            {telegramStatus === 'sending'
              ? 'Sending...'
              : telegramStatus === 'sent'
              ? 'Sent to Telegram ✓'
              : telegramStatus === 'fallback'
              ? 'Preview logged (No API key needed)'
              : 'Dispatch to Telegram'}
          </span>
        </button>
      </div>

      {/* Message List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-[#F5F6F8] rounded-lg border border-slate-100">
            <p className="text-sm font-medium text-slate-700">
              No alerts for {selectedRole.replace('_', ' ')}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Alerts are automatically dispatched to audience groups once the police operator approves the recommended plan.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const titleText =
              typeof alert.title === 'object'
                ? alert.title[selectedLanguage] || alert.title.en
                : alert.title;
            const messageText =
              typeof alert.message === 'object'
                ? alert.message[selectedLanguage] || alert.message.en
                : alert.message;

            const groupLabel =
              alert.group === 'ticket_holders'
                ? 'Ticket Holders & Attendees'
                : alert.group === 'metro_riders'
                ? 'Metro Riders'
                : alert.group === 'residents'
                ? 'Local Residents'
                : alert.group === 'taxi_drivers'
                ? 'Taxis & Auto-Rickshaws'
                : 'General Commuters';

            const badgeColor =
              alert.group === 'ticket_holders'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : alert.group === 'residents'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : alert.group === 'taxi_drivers'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200';

            return (
              <div
                key={alert.id}
                className="bg-[#F5F6F8] border border-slate-200 rounded-lg p-4 space-y-2 animate-fadeInItem"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                    To: {groupLabel}
                  </span>
                  <span className="text-slate-400">
                    {alert.timestamp}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-[#1F2933]">
                  {titleText}
                </h4>

                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {messageText}
                </p>

                {alert.savingsMinutes && (
                  <div className="pt-1.5 text-xs text-emerald-700 font-medium">
                    Estimated delay savings: ~{alert.savingsMinutes} mins vs direct chokepoint
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Operator Review & Translation Transparency Notice */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
        <span>AI-generated translation. Operator reviews before sending.</span>
        <span>Sample data. Estimates from stated assumptions.</span>
      </div>
    </div>
  );
};
