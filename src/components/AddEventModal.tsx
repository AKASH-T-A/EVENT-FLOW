import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { EventData } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventData) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [attendees, setAttendees] = useState(15000);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('21:00');
  const [type, setType] = useState('festival');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const loadAcharyaSample = () => {
    setName('Acharya Habba Annual Cultural Fest (Campus Pilot)');
    setVenue('Acharya Institute of Technology, Soladevanahalli, Hesaraghatta Main Rd');
    setAttendees(18000);
    setStartTime('16:30');
    setEndTime('22:00');
    setType('festival');
    setDescription('Flagship Bengaluru college festival with large inter-collegiate crowd influx, live bands, and heavy arterial congestion on Hesaraghatta Road.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !venue || !attendees) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          venue,
          attendees,
          startTime,
          endTime,
          type,
          description,
          lat: 13.0827,
          lon: 77.4847
        })
      });

      if (res.ok) {
        const data = await res.json();
        onEventCreated(data.event);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#1F2933]">
              Add New Event (Traffic Police Form)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Fill Button: Acharya Fest */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#2563EB] block">
              Sample Campus Pilot Event
            </span>
            <span className="text-[11px] text-slate-600 block">
              Acharya Institute annual fest (Soladevanahalli, 18,000 attendees)
            </span>
          </div>
          <button
            type="button"
            onClick={loadAcharyaSample}
            className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Load sample</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Event title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bengaluru Marathon / Annual College Fest"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-[#1F2933] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Venue / Stadium *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Acharya Institute of Technology / Kanteerava Stadium"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-[#1F2933] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Expected attendees *
              </label>
              <input
                type="number"
                min="500"
                max="100000"
                step="500"
                required
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-[#1F2933] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Start time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="17:00"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-[#1F2933] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                End time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="21:30"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-[#1F2933] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Event description & context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key roads affected, anticipated crowd characteristics..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-[#1F2933] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Sample data. Estimates from stated assumptions.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name || !venue}
                className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Registering...' : 'Register event'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
