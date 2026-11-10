/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { MapStage } from './components/MapStage';
import { AgentActionLogComponent } from './components/AgentActionLog';
import { PoliceDashboard } from './components/PoliceDashboard';
import { CommuterPhonePanel } from './components/CommuterPhonePanel';
import { AssumptionsDrawer } from './components/AssumptionsDrawer';
import { HowThisWorksFooter } from './components/HowThisWorksFooter';
import { AddEventModal } from './components/AddEventModal';
import { WhatIfSandbox } from './components/WhatIfSandbox';
import { AfterActionReportModal } from './components/AfterActionReportModal';
import { JudgeDemoController, JUDGE_MILESTONES } from './components/JudgeDemoController';
import {
  EventData,
  PolicePlan,
  CommuterAlert,
  AgentActionLog,
  AgentReasoning,
  WeatherInfo,
  CrowdFlowPrediction,
  OperatingMode,
  AssumptionsConfig,
  LiveScenarioStatus,
  SupportedLanguage,
  ScenarioState,
  JudgeDemoState
} from './types';

// Default initial events in Bengaluru
const INITIAL_EVENTS: EventData[] = [
  {
    id: 'chinnaswamy_ipl',
    name: 'IPL match: RCB vs CSK',
    type: 'sports',
    venue: 'M. Chinnaswamy Stadium, MG Road',
    lat: 12.9788,
    lon: 77.5996,
    startTime: '19:30',
    endTime: '23:15',
    attendees: 35000,
    description: 'High-voltage IPL match in central Bengaluru.',
    nearbyRoads: [
      {
        id: 'road_queens_rd',
        name: 'Queens Road (Balekundri - Stadium)',
        baselineVehicles: 1550,
        capacity: 2000,
        isLowLying: true,
        latLngs: [[12.9865, 77.5985], [12.9825, 77.5990], [12.9772, 77.5980]]
      },
      {
        id: 'road_cubbon_rd',
        name: 'Cubbon Road (BRV - Manipal)',
        baselineVehicles: 1800,
        capacity: 2400,
        isLowLying: false,
        latLngs: [[12.9772, 77.5950], [12.9785, 77.6010], [12.9798, 77.6080]]
      },
      {
        id: 'road_mg_rd',
        name: 'Mahatma Gandhi (MG) Road',
        baselineVehicles: 2200,
        capacity: 2800,
        isLowLying: false,
        latLngs: [[12.9750, 77.6015], [12.9745, 77.6075], [12.9730, 77.6200]]
      },
      {
        id: 'road_kasturba_rd',
        name: 'Kasturba Road (Museum - Stadium)',
        baselineVehicles: 1400,
        capacity: 1900,
        isLowLying: false,
        latLngs: [[12.9715, 77.5945], [12.9755, 77.5965], [12.9772, 77.5980]]
      },
      {
        id: 'road_residency_rd',
        name: 'Residency Road (Field Marshal Cariappa Rd)',
        baselineVehicles: 1650,
        capacity: 2200,
        isLowLying: false,
        latLngs: [[12.9650, 77.5990], [12.9710, 77.6080], [12.9725, 77.6130]]
      },
      {
        id: 'road_lavelle_rd',
        name: 'Lavelle Road (Richmond - UB City)',
        baselineVehicles: 1100,
        capacity: 1600,
        isLowLying: false,
        latLngs: [[12.9660, 77.5975], [12.9715, 77.5965], [12.9735, 77.5960]]
      }
    ],
    nearbyMetro: [
      {
        id: 'metro_cubbon_park',
        name: 'Cubbon Park Metro',
        line: 'Purple Line',
        distanceMeters: 400,
        lat: 12.9810,
        lon: 77.5968
      },
      {
        id: 'metro_mg_road',
        name: 'MG Road Metro',
        line: 'Purple Line',
        distanceMeters: 700,
        lat: 12.9756,
        lon: 77.6066
      },
      {
        id: 'metro_vidhana_soudha',
        name: 'Vidhana Soudha Metro',
        line: 'Purple Line',
        distanceMeters: 900,
        lat: 12.9797,
        lon: 77.5913
      }
    ]
  },
  {
    id: 'palace_grounds_concert',
    name: 'Concert: Palace Grounds',
    type: 'concert',
    venue: 'Palace Grounds (Tripuravasini), Bellary Road',
    lat: 13.0034,
    lon: 77.5891,
    startTime: '18:00',
    endTime: '21:30',
    attendees: 20000,
    description: 'Mega musical concert attracting music lovers across the city.',
    nearbyRoads: [
      {
        id: 'road_mehkri_circle',
        name: 'Mehkri Circle Underpass / Bellary Rd',
        baselineVehicles: 2300,
        capacity: 2700,
        isLowLying: true,
        latLngs: [[13.0130, 77.5840], [13.0080, 77.5865], [13.0020, 77.5890]]
      },
      {
        id: 'road_jayamahal_rd',
        name: 'Jayamahal Main Road',
        baselineVehicles: 1350,
        capacity: 1800,
        isLowLying: false,
        latLngs: [[13.0020, 77.5895], [12.9985, 77.5960], [12.9930, 77.6015]]
      },
      {
        id: 'road_sankey_rd',
        name: 'Sankey Road / Windsor Square',
        baselineVehicles: 1600,
        capacity: 2100,
        isLowLying: false,
        latLngs: [[12.9990, 77.5800], [12.9940, 77.5835], [12.9890, 77.5870]]
      }
    ],
    nearbyMetro: [
      {
        id: 'metro_mantri_square',
        name: 'Mantri Square Sampige Road Metro',
        line: 'Green Line',
        distanceMeters: 1400,
        lat: 12.9908,
        lon: 77.5714
      }
    ]
  },
  {
    id: 'lalbagh_festival',
    name: 'Flower Show: Lalbagh',
    type: 'cultural',
    venue: 'Lalbagh Botanical Garden (West Gate)',
    lat: 12.9507,
    lon: 77.5848,
    startTime: '16:00',
    endTime: '20:00',
    attendees: 10000,
    description: 'Annual Republic Day Flower Show drawing visitors across south Bengaluru.',
    nearbyRoads: [
      {
        id: 'road_kr_rd',
        name: 'K.R. Road (National College - Lalbagh)',
        baselineVehicles: 1400,
        capacity: 1800,
        isLowLying: false,
        latLngs: [[12.9460, 77.5750], [12.9490, 77.5780], [12.9520, 77.5815]]
      },
      {
        id: 'road_hosur_rd',
        name: 'Hosur Main Road (Dairy Circle)',
        baselineVehicles: 1950,
        capacity: 2400,
        isLowLying: false,
        latLngs: [[12.9400, 77.5950], [12.9440, 77.5920], [12.9480, 77.5890]]
      },
      {
        id: 'road_rv_rd',
        name: 'Rashtriya Vidyalaya (RV) Road',
        baselineVehicles: 1200,
        capacity: 1600,
        isLowLying: false,
        latLngs: [[12.9400, 77.5800], [12.9450, 77.5800], [12.9500, 77.5800]]
      }
    ],
    nearbyMetro: [
      {
        id: 'metro_lalbagh',
        name: 'Lalbagh Metro',
        line: 'Green Line',
        distanceMeters: 200,
        lat: 12.9502,
        lon: 77.5835
      },
      {
        id: 'metro_south_end',
        name: 'South End Circle Metro',
        line: 'Green Line',
        distanceMeters: 650,
        lat: 12.9388,
        lon: 77.5801
      }
    ]
  }
];

export default function App() {
  const [events, setEvents] = useState<EventData[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>('chinnaswamy_ipl');
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('demo');
  const [modeNotice, setModeNotice] = useState<string | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState<boolean>(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isAfterActionOpen, setIsAfterActionOpen] = useState<boolean>(false);
  const [afterActionReport, setAfterActionReport] = useState<any>(null);

  // Core Simulation States
  const [weather, setWeather] = useState<WeatherInfo>({
    temperatureC: 24.5,
    rainMmPerHr: 0.0,
    severity: 'clear',
    isSimulatedOverride: false,
    conditionDescription: 'Clear skies (Optimal transit conditions)',
    source: 'Open-Meteo',
    checkedAt: '18:00'
  });
  const [isRainSimulated, setIsRainSimulated] = useState<boolean>(false);
  const [isDelaySimulated, setIsDelaySimulated] = useState<boolean>(false);
  const [matchDelayMins, setMatchDelayMins] = useState<number>(0);
  const [currentHour, setCurrentHour] = useState<number>(18.5); // Default 6:30 PM
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);

  // Model & Plan Outputs
  const [crowdFlow, setCrowdFlow] = useState<CrowdFlowPrediction | undefined>();
  const [activePlan, setActivePlan] = useState<PolicePlan | undefined>();
  const [previousPlan, setPreviousPlan] = useState<PolicePlan | undefined>();
  const [alerts, setAlerts] = useState<CommuterAlert[]>([]);
  const [actionLogs, setActionLogs] = useState<AgentActionLog[]>([]);
  const [reasoning, setReasoning] = useState<AgentReasoning | undefined>();
  const [triggerBadge, setTriggerBadge] = useState<string | undefined>();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');

  // Assumptions Config
  const [assumptions, setAssumptions] = useState<AssumptionsConfig>({
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
  });

  // Judge Demo 90-Second Walkthrough State
  const [judgeDemoState, setJudgeDemoState] = useState<JudgeDemoState>({
    isActive: false,
    isPaused: false,
    currentMilestoneIndex: 0,
    progressPct: 0,
    speed: 1,
    isVoiceMuted: false
  });

  // Browser Speech Synthesis for Judge Voiceover Narrator
  const speakNarration = (text: string) => {
    if (judgeDemoState.isVoiceMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any existing utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05 * judgeDemoState.speed;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Scenario Status
  const [liveScenario, setLiveScenario] = useState<LiveScenarioStatus>({
    isActive: false,
    isPaused: false,
    speedMultiplier: 1,
    stageIndex: 0,
    stageTitle: 'Scenario Idle',
    simulatedTime: '17:30',
    progressPct: 0
  });

  // State Machine: idle -> predicting -> planning -> awaiting_approval -> approved -> replanning -> awaiting_approval_rev2 -> complete
  const [scenarioState, setScenarioState] = useState<ScenarioState>('idle');
  const [resetCount, setResetCount] = useState<number>(0);

  const scenarioIntervalRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  // Rapid click throttle (350ms)
  const isRapidClick = (): boolean => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 350) {
      return true;
    }
    lastClickTimeRef.current = now;
    return false;
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (scenarioIntervalRef.current) {
        clearInterval(scenarioIntervalRef.current);
        scenarioIntervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // 1. Initial State Sync
  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events && data.events.length > 0) {
          const seen = new Set<string>();
          const uniqueEvents: EventData[] = [];
          for (const ev of data.events) {
            if (!seen.has(ev.id)) {
              seen.add(ev.id);
              uniqueEvents.push(ev);
            }
          }
          setEvents(uniqueEvents);
        }
      })
      .catch(() => {});

    fetch('/api/agent/state')
      .then((res) => res.json())
      .then((state) => {
        if (state.weather) setWeather(state.weather);
        if (state.activePlan) {
          setActivePlan(state.activePlan);
          if (state.activePlan.status === 'awaiting_approval') {
            setScenarioState(state.previousPlan ? 'awaiting_approval_rev2' : 'awaiting_approval');
          } else if (state.activePlan.status === 'approved') {
            setScenarioState(state.previousPlan ? 'complete' : 'approved');
          }
        }
        if (state.previousPlan) setPreviousPlan(state.previousPlan);
        if (state.alerts) setAlerts(state.alerts);
        if (state.assumptions) setAssumptions(state.assumptions);
      })
      .catch(() => {});
  }, []);

  // 2. Run Agent Workflow
  const handleRunAgent = async (triggerReason: string = 'Manual operator trigger') => {
    if (isRapidClick()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAgentRunning(true);
    setScenarioState('predicting');

    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          triggerReason,
          mode: operatingMode
        }),
        signal: controller.signal
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'tool_log') {
                if (data.toolName === 'find_alternate_routes' || data.toolName === 'score_routes') {
                  setScenarioState('planning');
                }
                setActionLogs((prev) => {
                  const existingIndex = prev.findIndex((l) => l.id === data.id);
                  if (existingIndex >= 0) {
                    const copy = [...prev];
                    copy[existingIndex] = data;
                    return copy;
                  }
                  return [...prev, data];
                });
              } else if (currentEvent === 'complete') {
                if (data.switchedToDemo) {
                  setOperatingMode('demo');
                  setModeNotice('Live AI unavailable, switched to Demo mode');
                  setTimeout(() => setModeNotice(null), 5000);
                }
                if (data.plan) {
                  setActivePlan(data.plan);
                  if (data.previousPlan) {
                    setPreviousPlan(data.previousPlan);
                    setScenarioState('awaiting_approval_rev2');
                  } else {
                    setScenarioState('awaiting_approval');
                  }
                }
                if (data.reasoning) {
                  setReasoning(data.reasoning);
                  if (data.reasoning.triggerBadge) {
                    setTriggerBadge(data.reasoning.triggerBadge);
                  }
                }
              }
            } catch (err) {
              console.error('Error parsing SSE data:', err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Agent execution error:', err);
      if (operatingMode === 'live_ai') {
        setOperatingMode('demo');
        setModeNotice('Live AI unavailable, switched to Demo mode');
        setTimeout(() => setModeNotice(null), 5000);
      }
    } finally {
      setIsAgentRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleToggleOperatingMode = async () => {
    if (isRapidClick()) return;
    if (operatingMode === 'demo') {
      try {
        const res = await fetch('/api/agent/key-status');
        const data = await res.json();
        if (!data.hasKey) {
          setOperatingMode('demo');
          setModeNotice('Live AI unavailable, switched to Demo mode');
          setTimeout(() => setModeNotice(null), 5000);
          return;
        }
        setOperatingMode('live_ai');
        setModeNotice(null);
      } catch {
        setOperatingMode('demo');
        setModeNotice('Live AI unavailable, switched to Demo mode');
        setTimeout(() => setModeNotice(null), 5000);
      }
    } else {
      setOperatingMode('demo');
      setModeNotice(null);
    }
  };

  // 3. Approve Plan
  const handleApprovePlan = async () => {
    if (isRapidClick()) return;
    if (!activePlan) return;
    try {
      const res = await fetch('/api/agent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: activePlan.id })
      });
      const data = await res.json();
      if (data.success) {
        setActivePlan(data.plan);
        if (data.alerts) setAlerts(data.alerts);
        if (data.newLogs) {
          setActionLogs((prev) => [...prev, ...data.newLogs]);
        }
        // Transition to approved or complete
        if (scenarioState === 'awaiting_approval_rev2' || data.plan.version > 1) {
          setScenarioState('complete');
        } else {
          setScenarioState('approved');
        }
      }
    } catch (err) {
      console.error('Approve plan failed:', err);
    }
  };

  // 4. Reject Plan
  const handleRejectPlan = async () => {
    if (isRapidClick()) return;
    try {
      const res = await fetch('/api/agent/reject', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.plan) {
        setActivePlan(data.plan);
      }
    } catch (err) {
      console.error('Reject plan failed:', err);
    }
  };

  // 5. Toggle Rain
  const handleToggleRain = async (forceState?: boolean) => {
    if (isRapidClick()) return;
    try {
      const targetState = forceState !== undefined ? forceState : !isRainSimulated;
      setScenarioState('replanning');
      const res = await fetch('/api/agent/simulate-rain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: targetState, rate: 14.0 })
      });
      const data = await res.json();
      setIsRainSimulated(data.isSimulatedRain);
      if (data.weather) setWeather(data.weather);
      if (data.replanResult) {
        if (data.replanResult.plan) {
          setActivePlan(data.replanResult.plan);
          setScenarioState('awaiting_approval_rev2');
        }
        if (data.replanResult.logs) setActionLogs(data.replanResult.logs);
        if (data.replanResult.reasoning) {
          setReasoning(data.replanResult.reasoning);
          setTriggerBadge('Trigger: Forecast said clear, actual rain 14 mm/h');
        }
      } else {
        setScenarioState(activePlan ? 'approved' : 'idle');
      }
    } catch (err) {
      console.error('Toggle rain error:', err);
      setScenarioState(activePlan ? 'approved' : 'idle');
    }
  };

  // 6. Toggle Delay
  const handleToggleDelay = async () => {
    if (isRapidClick()) return;
    try {
      const targetState = !isDelaySimulated;
      setScenarioState('replanning');
      const res = await fetch('/api/agent/simulate-delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: targetState, mins: 45 })
      });
      const data = await res.json();
      setIsDelaySimulated(data.isSimulatedDelay);
      setMatchDelayMins(data.matchDelayMins || 0);
      if (data.replanResult) {
        if (data.replanResult.plan) {
          setActivePlan(data.replanResult.plan);
          setScenarioState('awaiting_approval_rev2');
        }
        if (data.replanResult.logs) setActionLogs(data.replanResult.logs);
        if (data.replanResult.reasoning) {
          setReasoning(data.replanResult.reasoning);
          setTriggerBadge('Trigger: Match delayed (+45 mins)');
        }
      } else {
        setScenarioState(activePlan ? 'approved' : 'idle');
      }
    } catch (err) {
      console.error('Toggle delay error:', err);
      setScenarioState(activePlan ? 'approved' : 'idle');
    }
  };

  // 7. Reset Simulation
  const handleReset = async () => {
    if (scenarioIntervalRef.current) {
      clearInterval(scenarioIntervalRef.current);
      scenarioIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setScenarioState('idle');
    setResetCount((c) => c + 1);

    try {
      await fetch('/api/agent/reset', { method: 'POST' });
      setActionLogs([]);
      setReasoning(undefined);
      setActivePlan(undefined);
      setPreviousPlan(undefined);
      setAlerts([]);
      setCrowdFlow(undefined);
      setIsRainSimulated(false);
      setIsDelaySimulated(false);
      setMatchDelayMins(0);
      setCurrentHour(18.5);
      setIsTimelinePlaying(false);
      setTriggerBadge(undefined);
      setLiveScenario({
        isActive: false,
        isPaused: false,
        speedMultiplier: 1,
        stageIndex: 0,
        stageTitle: 'Scenario Idle',
        simulatedTime: '17:30',
        progressPct: 0
      });
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // 8. 90-Second Demo Story
  const handleStartScenario = () => {
    if (isRapidClick()) return;

    if (liveScenario.isActive) {
      if (scenarioIntervalRef.current) {
        clearInterval(scenarioIntervalRef.current);
        scenarioIntervalRef.current = null;
      }
      setLiveScenario((prev) => ({ ...prev, isActive: false, stageTitle: 'Scenario Paused' }));
      return;
    }

    // Cleanly cancel previous interval and abort ongoing requests
    if (scenarioIntervalRef.current) {
      clearInterval(scenarioIntervalRef.current);
      scenarioIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    handleReset();
    setSelectedEventId('chinnaswamy_ipl');
    setScenarioState('predicting');

    let seconds = 0;
    const totalDurationSecs = 90;

    setLiveScenario({
      isActive: true,
      isPaused: false,
      speedMultiplier: 1,
      stageIndex: 1,
      stageTitle: '1. Observing arrival traffic build-up and weather',
      simulatedTime: '17:15',
      progressPct: 0
    });

    handleRunAgent('Demo start: Match arrival build-up');

    scenarioIntervalRef.current = setInterval(async () => {
      seconds += 1;
      const progress = Math.min(100, (seconds / totalDurationSecs) * 100);
      const mappedHour = 17.25 + (seconds / totalDurationSecs) * 1.5;
      setCurrentHour(mappedHour);

      if (seconds === 18) {
        setScenarioState('planning');
        setLiveScenario((prev) => ({
          ...prev,
          stageIndex: 2,
          stageTitle: '2. Jammed chokepoint detected (Queens Road 119%). Scoring diversion routes...',
          simulatedTime: '17:30'
        }));
        setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: 1 }));
        speakNarration(JUDGE_MILESTONES[1].narration);
      }

      if (seconds === 32) {
        setScenarioState('awaiting_approval');
        setLiveScenario((prev) => ({
          ...prev,
          stageIndex: 3,
          stageTitle: '3. Awaiting police approval for recommended plan',
          simulatedTime: '17:45'
        }));
        setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: 2 }));
        speakNarration(JUDGE_MILESTONES[2].narration);
      }

      if (seconds === 42) {
        await handleApprovePlan();
        setScenarioState('approved');
        setLiveScenario((prev) => ({
          ...prev,
          stageIndex: 4,
          stageTitle: '4. Plan authorized by police. Commuter alerts sent in 3 languages.',
          simulatedTime: '17:50'
        }));
        setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: 3 }));
        speakNarration(JUDGE_MILESTONES[3].narration);
      }

      if (seconds === 58) {
        setScenarioState('replanning');
        setLiveScenario((prev) => ({
          ...prev,
          stageIndex: 5,
          stageTitle: '5. Rain started earlier than forecast (14 mm/h). Recalculating plan...',
          simulatedTime: '18:00'
        }));
        setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: 5 }));
        speakNarration(JUDGE_MILESTONES[5].narration);
        await handleToggleRain(true);
      }

      if (seconds === 72) {
        await handleApprovePlan();
        setScenarioState('complete');
        setLiveScenario((prev) => ({
          ...prev,
          stageIndex: 6,
          stageTitle: '6. Updated plan active. Commuters rerouted away from flooded underpass.',
          simulatedTime: '18:15'
        }));
        setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: 6 }));
        speakNarration(JUDGE_MILESTONES[6].narration);
      }

      if (seconds >= totalDurationSecs) {
        if (scenarioIntervalRef.current) {
          clearInterval(scenarioIntervalRef.current);
          scenarioIntervalRef.current = null;
        }
        setScenarioState('complete');
        setLiveScenario((prev) => ({
          ...prev,
          isActive: false,
          stageIndex: 7,
          stageTitle: 'Demo scenario completed',
          simulatedTime: '18:30',
          progressPct: 100
        }));
        setJudgeDemoState((prev) => ({ ...prev, isActive: false, progressPct: 100 }));
      } else {
        setLiveScenario((prev) => ({
          ...prev,
          progressPct: progress
        }));
        setJudgeDemoState((prev) => ({
          ...prev,
          progressPct: progress
        }));
      }
    }, 1000);
  };

  // Timeline playback loop
  useEffect(() => {
    if (!isTimelinePlaying) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => {
        if (prev >= 23.5) return 15.0;
        return Math.round((prev + 0.1) * 100) / 100;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isTimelinePlaying]);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1F2933] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header, 4-step progress bar, and quiet scenario buttons */}
      <TopBar
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={(id) => {
          setSelectedEventId(id);
          setActivePlan(undefined);
          setPreviousPlan(undefined);
          setReasoning(undefined);
          setActionLogs([]);
          setCrowdFlow(undefined);
        }}
        onStartScenario={handleStartScenario}
        onRunAgent={() => handleRunAgent('Manual operator trigger')}
        onApprovePlan={handleApprovePlan}
        onToggleRain={() => handleToggleRain()}
        onToggleDelay={handleToggleDelay}
        onReset={handleReset}
        onOpenAssumptions={() => setIsAssumptionsOpen(true)}
        onOpenAddEvent={() => setIsAddEventOpen(true)}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        onOpenAfterAction={async () => {
          try {
            const res = await fetch('/api/agent/after-action');
            if (res.ok) {
              const data = await res.json();
              setAfterActionReport(data.report);
              setIsAfterActionOpen(true);
            }
          } catch (e) {
            console.error('Failed to load after-action report:', e);
          }
        }}
        operatingMode={operatingMode}
        onToggleOperatingMode={handleToggleOperatingMode}
        weatherSource={weather.source}
        modeNotice={modeNotice}
        isAgentRunning={isAgentRunning}
        scenarioState={scenarioState}
        activePlan={activePlan}
        isRainSimulated={isRainSimulated}
        isDelaySimulated={isDelaySimulated}
        matchDelayMins={matchDelayMins}
        liveScenario={liveScenario}
        currentHour={currentHour}
        onHourChange={setCurrentHour}
        isTimelinePlaying={isTimelinePlaying}
        onToggleTimelinePlay={() => setIsTimelinePlaying(!isTimelinePlaying)}
        hasAlerts={alerts.length > 0}
        hasCrowdFlow={Boolean(crowdFlow)}
      />

      {/* Presentation-Grade 90-Second Judge Demo Controller */}
      <JudgeDemoController
        demoState={judgeDemoState}
        onTogglePlay={() => {
          if (liveScenario.isActive) {
            handleStartScenario(); // Toggles pause
            setJudgeDemoState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
          } else {
            handleStartScenario();
            setJudgeDemoState((prev) => ({ ...prev, isActive: true, isPaused: false }));
            speakNarration(JUDGE_MILESTONES[0].narration);
          }
        }}
        onNextMilestone={() => {
          const nextIdx = Math.min(JUDGE_MILESTONES.length - 1, judgeDemoState.currentMilestoneIndex + 1);
          setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: nextIdx }));
          speakNarration(JUDGE_MILESTONES[nextIdx].narration);
          if (nextIdx === 2) handleRunAgent('Judge demo milestone 3: Plan diversions');
          if (nextIdx === 3) handleApprovePlan();
          if (nextIdx === 5) handleToggleRain(true);
        }}
        onPrevMilestone={() => {
          const prevIdx = Math.max(0, judgeDemoState.currentMilestoneIndex - 1);
          setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: prevIdx }));
          speakNarration(JUDGE_MILESTONES[prevIdx].narration);
        }}
        onReset={() => {
          handleReset();
          setJudgeDemoState({
            isActive: false,
            isPaused: false,
            currentMilestoneIndex: 0,
            progressPct: 0,
            speed: 1,
            isVoiceMuted: false
          });
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        }}
        onChangeSpeed={(speed) => {
          setJudgeDemoState((prev) => ({ ...prev, speed }));
        }}
        onToggleVoice={() => {
          setJudgeDemoState((prev) => {
            const nextMuted = !prev.isVoiceMuted;
            if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            return { ...prev, isVoiceMuted: nextMuted };
          });
        }}
        onSelectMilestone={(index) => {
          setJudgeDemoState((prev) => ({ ...prev, currentMilestoneIndex: index }));
          speakNarration(JUDGE_MILESTONES[index].narration);
          if (index === 2) handleRunAgent('Judge demo milestone 3: Plan diversions');
          if (index === 3) handleApprovePlan();
          if (index === 5) handleToggleRain(true);
        }}
      />

      {/* Main Guided Content Area */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6 flex flex-col">
        {/* Row 1: Map (60%) and What the agent is doing (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (60%) */}
          <div className="lg:col-span-7 h-[500px] flex flex-col">
            <MapStage
              event={selectedEvent}
              crowdFlow={crowdFlow}
              activePlan={activePlan}
              isRaining={isRainSimulated}
              rainRate={weather.rainMmPerHr || 14}
              timeScrubHour={currentHour}
              resetCount={resetCount}
            />
          </div>

          {/* Agent Action Log Column (40%) */}
          <div className="lg:col-span-5 h-[500px] flex flex-col">
            <AgentActionLogComponent
              logs={actionLogs}
              reasoning={reasoning}
              isRunning={isAgentRunning}
              triggerBadge={triggerBadge}
            />
          </div>
        </div>

        {/* Row 2: Recommended Plan (60%) and Commuter Alerts (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Recommended Plan Card */}
          <div className="lg:col-span-7">
            <PoliceDashboard
              plan={activePlan}
              previousPlan={previousPlan}
              onApprove={handleApprovePlan}
              onReject={handleRejectPlan}
              isAgentRunning={isAgentRunning}
            />
          </div>

          {/* Commuter Alerts Card */}
          <div className="lg:col-span-5">
            <CommuterPhonePanel
              alerts={alerts}
              isPlanApproved={activePlan?.status === 'approved'}
              selectedLanguage={selectedLanguage}
              onChangeLanguage={setSelectedLanguage}
            />
          </div>
        </div>

        {/* Row 3: How This Works / System Methodology Footer */}
        <HowThisWorksFooter />
      </main>

      {/* Assumptions Side Drawer */}
      <AssumptionsDrawer
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
        assumptions={assumptions}
        onApplyAssumptions={(newAssumptions) => {
          setAssumptions(newAssumptions);
          fetch('/api/agent/assumptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssumptions)
          }).catch(() => {});
        }}
      />

      {/* Phase 6: Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onEventCreated={(newEvent) => {
          setEvents((prev) => [...prev, newEvent]);
          setSelectedEventId(newEvent.id);
        }}
      />

      {/* Phase 6: What-If Sandbox Drawer */}
      <WhatIfSandbox
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        baseAttendees={selectedEvent.attendees}
        basePrivateSharePct={assumptions.privateSplitPct}
      />

      {/* Phase 7: After-Action Learning Report Modal */}
      <AfterActionReportModal
        isOpen={isAfterActionOpen}
        onClose={() => setIsAfterActionOpen(false)}
        report={afterActionReport}
      />

      {/* Persistent screen footer badge */}
      <div className="bg-white border-t border-slate-200 py-2.5 px-6 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <span>Sample data. Estimates from stated assumptions.</span>
        <span>Bengaluru Traffic Police &amp; Namma Metro AI Operations</span>
      </div>
    </div>
  );
}
