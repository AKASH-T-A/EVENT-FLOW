import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import {
  AgentActionLog,
  AgentReasoning,
  WeatherSeverity,
  PolicePlan,
  OperatingMode,
  AssumptionsConfig
} from '../src/types';
import * as toolsImpl from './tools';

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_event_details',
    description: 'Retrieves structural details for a Bengaluru event including venue coordinates, start/end times, expected attendee crowd size, nearby road capacities, and metro stations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: {
          type: Type.STRING,
          description: 'Unique event identifier, e.g. "chinnaswamy_ipl", "palace_grounds_concert", or "lalbagh_festival".'
        }
      },
      required: ['event_id']
    }
  },
  {
    name: 'get_event_status',
    description: 'Checks current event lifecycle state (upcoming, arrival_phase, live, exit_phase, finished) based on simulation time, including any match delay or rain hold.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: {
          type: Type.STRING,
          description: 'Unique event identifier.'
        },
        now: {
          type: Type.STRING,
          description: 'Simulated clock time, e.g. "17:30", "18:00".'
        }
      },
      required: ['event_id']
    }
  },
  {
    name: 'get_weather',
    description: 'Fetches real hourly precipitation and rain intensity (mm/h) from the Open-Meteo weather API for Bengaluru coordinates, returning a severity level of clear, possible, moderate, or heavy.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lat: {
          type: Type.NUMBER,
          description: 'Latitude of the venue.'
        },
        lon: {
          type: Type.NUMBER,
          description: 'Longitude of the venue.'
        },
        time: {
          type: Type.STRING,
          description: 'Optional target time string.'
        }
      },
      required: ['lat', 'lon']
    }
  },
  {
    name: 'estimate_crowd_flow',
    description: 'Calculates heuristic crowd distribution, modal split (metro, bus, cab, private vehicle), private vehicle surge count, road saturation percentages, and flags road segments exceeding 80% as critical hotspots.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: {
          type: Type.STRING,
          description: 'Unique event identifier.'
        },
        severity: {
          type: Type.STRING,
          description: 'Weather severity: "clear", "possible", "moderate", or "heavy".'
        }
      },
      required: ['event_id', 'severity']
    }
  },
  {
    name: 'find_alternate_routes',
    description: 'Finds candidate diversion bypass routes avoiding a congested road segment near the venue, including travel distance, base travel time, closed road status, and flood susceptibility.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        segment_id: {
          type: Type.STRING,
          description: 'The road segment identifier experiencing congestion.'
        }
      },
      required: ['segment_id']
    }
  },
  {
    name: 'score_routes',
    description: 'Scores alternate route candidates using the formula: score = travel_time + 15 * hotspot_segments + (20 if uses_closed_road) + 0.5 * distance_km + (10 * low_lying_segments in heavy rain). Selects the lowest score route and returns explainable cost breakdown.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        routes: {
          type: Type.ARRAY,
          description: 'List of candidate route objects to evaluate.',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              distanceKm: { type: Type.NUMBER },
              travelTimeMins: { type: Type.NUMBER },
              hotspotSegmentsCrossed: { type: Type.NUMBER },
              usesClosedRoad: { type: Type.BOOLEAN },
              lowLyingSegments: { type: Type.NUMBER }
            },
            required: ['id', 'name', 'distanceKm', 'travelTimeMins']
          }
        },
        severity: {
          type: Type.STRING,
          description: 'Current weather severity: "clear", "possible", "moderate", or "heavy".'
        }
      },
      required: ['routes', 'severity']
    }
  },
  {
    name: 'get_transit_options',
    description: 'Retrieves Namma Metro transit frequency, requested surge headway reductions (e.g. 7m to 3.5m), and BMTC feeder bus services for the event venue.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: {
          type: Type.STRING,
          description: 'Unique event identifier.'
        }
      },
      required: ['event_id']
    }
  },
  {
    name: 'create_police_plan',
    description: 'Compiles and registers the Bengaluru Traffic Police operational plan with status "awaiting approval", including road closures, traffic diversions, deployed personnel counts, metro frequency requests, and KPIs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: { type: Type.STRING },
        summary: { type: Type.STRING },
        closures: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        diversions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fromRoad: { type: Type.STRING },
              divertVia: { type: Type.STRING },
              routeId: { type: Type.STRING }
            },
            required: ['fromRoad', 'divertVia', 'routeId']
          }
        },
        personnel_count: { type: Type.NUMBER }
      },
      required: ['event_id', 'summary', 'closures', 'diversions', 'personnel_count']
    }
  },
  {
    name: 'send_alert',
    description: 'Dispatches targeted advisories to commuter groups (ticket holders, metro riders, general public, police units) shown on the Telegram phone panel.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        group: {
          type: Type.STRING,
          description: '"all", "commuters", "ticket_holders", "metro_riders", or "police_officers".'
        },
        message: { type: Type.STRING }
      },
      required: ['group', 'message']
    }
  },
  {
    name: 'monitor',
    description: 'Runs watchdog check against live weather telemetry and event schedule to detect forecast mismatches and trigger dynamic re-planning.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: {
          type: Type.STRING,
          description: 'Unique event identifier to monitor.'
        }
      },
      required: ['event_id']
    }
  }
];

export type ToolStreamCallback = (log: AgentActionLog) => void;

/**
 * Execute a named tool with provided arguments
 */
export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case 'get_event_details':
      return await toolsImpl.get_event_details(args as { event_id: string });
    case 'get_event_status':
      return await toolsImpl.get_event_status(args as { event_id: string; now?: string });
    case 'get_weather':
      return await toolsImpl.get_weather(args as { lat: number; lon: number; time?: string });
    case 'estimate_crowd_flow':
      return await toolsImpl.estimate_crowd_flow(args as { event_id: string; severity: WeatherSeverity });
    case 'find_alternate_routes':
      return await toolsImpl.find_alternate_routes(args as { segment_id: string });
    case 'score_routes':
      return await toolsImpl.score_routes(args as any);
    case 'get_transit_options':
      return await toolsImpl.get_transit_options(args as { event_id: string });
    case 'create_police_plan':
      return await toolsImpl.create_police_plan(args as any);
    case 'send_alert':
      return await toolsImpl.send_alert(args as any);
    case 'monitor':
      return await toolsImpl.monitor(args as { event_id: string });
    default:
      throw new Error(`Unknown tool: '${name}'`);
  }
}

function getPhaseForTool(name: string): AgentActionLog['phase'] {
  if (name === 'get_event_details' || name === 'get_event_status' || name === 'get_weather') {
    return 'observe';
  }
  if (name === 'estimate_crowd_flow') {
    return 'predict';
  }
  if (name === 'find_alternate_routes' || name === 'score_routes' || name === 'get_transit_options' || name === 'create_police_plan') {
    return 'plan';
  }
  if (name === 'send_alert') {
    return 'act';
  }
  return 'monitor';
}

/**
 * Run the Agent workflow in either 'live_ai' or deterministic 'demo' mode
 */
export async function runAgentWorkflow(
  eventId: string,
  triggerReason: string = 'Operator trigger',
  mode: OperatingMode = 'demo',
  onToolLog?: ToolStreamCallback
): Promise<{
  logs: AgentActionLog[];
  reasoning: AgentReasoning;
  plan?: PolicePlan;
  switchedToDemo?: boolean;
}> {
  const logs: AgentActionLog[] = [];

  const logWrapper = async (toolName: string, args: Record<string, any>): Promise<any> => {
    const logId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();
    const phase = getPhaseForTool(toolName);

    const initialLog: AgentActionLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      phase,
      toolName,
      status: 'running',
      triggerReason: triggerReason.includes('Trigger:') ? triggerReason : undefined,
      args,
      resultPreview: 'Executing...'
    };

    logs.push(initialLog);
    if (onToolLog) onToolLog({ ...initialLog });

    try {
      const result = await executeTool(toolName, args);
      const durationMs = Date.now() - startTime;

      let resultPreview = '';
      if (typeof result === 'object' && result !== null) {
        if ('severity' in result) {
          resultPreview = `Weather: ${result.severity.toUpperCase()} (${result.rainMmPerHr} mm/h) - ${result.conditionDescription}`;
        } else if ('peakSaturationPct' in result) {
          resultPreview = `Peak Saturation: ${result.peakSaturationPct}%, Hotspots: ${result.hotspotCount}, Private Vehicles: ${result.privateVehicles}`;
        } else if ('selectedRoute' in result) {
          resultPreview = `Selected: ${result.selectedRoute.name} (Score: ${result.selectedRoute.score})`;
        } else if ('status' in result && (result.status === 'awaiting_approval' || result.status === 'approved')) {
          resultPreview = `Plan v${result.version}: ${result.closures?.length || 0} closures, ${result.diversions?.length || 0} diversions, ${result.personnelCount} officers`;
        } else if ('message' in result) {
          const msg = typeof result.message === 'object' ? result.message.en : String(result.message);
          resultPreview = `Alert to [${result.group}]: "${msg.substring(0, 50)}..."`;
        } else {
          resultPreview = JSON.stringify(result).substring(0, 80) + '...';
        }
      } else {
        resultPreview = String(result);
      }

      initialLog.status = 'done';
      initialLog.durationMs = durationMs;
      initialLog.resultPreview = resultPreview;
      initialLog.fullResult = result;

      if (onToolLog) onToolLog({ ...initialLog });
      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      initialLog.status = 'failed';
      initialLog.durationMs = durationMs;
      initialLog.resultPreview = `Error: ${err.message || 'Execution failed'}`;
      if (onToolLog) onToolLog({ ...initialLog });
      throw err;
    }
  };

  const apiKey = process.env.GEMINI_API_KEY;
  let switchedToDemo = false;

  // If Live AI mode is requested, try Gemini with GEMINI_MODEL; if key missing, switch to Demo mode
  if (mode === 'live_ai') {
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      switchedToDemo = true;
    } else {
      try {
        const ai = new GoogleGenAI({
          apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemPrompt = `You are "EventFlow", an autonomous AI Traffic Management Agent for Bengaluru Traffic Police (BTP) & Namma Metro.
Your mission is to predict traffic impact from major urban events and formulate an actionable mitigation plan.

MANDATORY PROCEDURE:
1. OBSERVE:
   - Call get_event_details for '${eventId}'
   - Call get_event_status for '${eventId}'
   - Call get_weather using the venue coordinates
2. PREDICT:
   - Call estimate_crowd_flow with event_id and observed severity
3. PLAN:
   - For identified hotspot road segments, call find_alternate_routes
   - Call score_routes on candidate routes with severity
   - Call get_transit_options to coordinate BMRCL Metro and BMTC buses
   - Call create_police_plan to register the operational plan with status 'awaiting_approval'
4. EXPLAIN:
   - Clearly explain why the chosen route beat alternatives quoting the exact scores.

Trigger: ${triggerReason}.`;

      let contents: any[] = [
        {
          role: 'user',
          parts: [{ text: `Analyze event '${eventId}' and formulate the BTP police diversion plan.` }]
        }
      ];

      let turns = 0;
      const MAX_TURNS = 12;
      let finalReasoningText = '';

      while (turns < MAX_TURNS) {
        turns++;
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction: systemPrompt,
            tools: [{ functionDeclarations: toolDeclarations }]
          }
        });

        const candidate = response.candidates?.[0];
        if (!candidate) break;

        contents.push(candidate.content);
        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          finalReasoningText = response.text || '';
          break;
        }

        const functionResponseParts: any[] = [];
        for (const fc of functionCalls) {
          if (!fc.name) continue;
          try {
            const toolResult = await logWrapper(fc.name, (fc.args || {}) as Record<string, any>);
            functionResponseParts.push({
              functionResponse: {
                id: fc.id || 'call_0',
                name: fc.name,
                response: { output: toolResult }
              }
            });
          } catch (e: any) {
            functionResponseParts.push({
              functionResponse: {
                id: fc.id || 'call_0',
                name: fc.name,
                response: { error: e.message }
              }
            });
          }
        }

        contents.push({
          role: 'user',
          parts: functionResponseParts
        });
      }

      const activePlan = toolsImpl.getStoredPlan() ?? undefined;
      const rainInfo = toolsImpl.getSimulatedRain();
      const reasoning: AgentReasoning = {
        overview: finalReasoningText || `Agent synthesized crowd surge dynamics for ${eventId}. Formulated traffic diversions with police deployment and BMRCL headway surge.`,
        routeSelectionRationale: `Infantry Road Elevated Bypass selected over direct Queens Road route due to lower congestion score and flood-safe drainage profile.`,
        weatherRiskAssessment: rainInfo.active ? `Torrential rain (${rainInfo.rate} mm/h) active. Road capacities slashed by 15%, low-lying underpasses heavily penalized.` : `Weather conditions optimal; baseline road capacities sustained.`,
        transitMitigation: `Purple Line Metro headways reduced to 3.5 minutes to absorb 30% modal share and prevent central arterial gridlock.`,
        triggerBadge: triggerReason.includes('Trigger:') ? triggerReason : undefined
      };

        return { logs, reasoning, plan: activePlan, switchedToDemo: false };
      } catch (apiError) {
        console.warn('Gemini API call failed, falling back to fail-safe Demo orchestrator:', apiError);
        switchedToDemo = true;
      }
    }
  }

  // Deterministic Demo Mode (Fail-safe, 0 latency, guaranteed never to break)
  // Step 1: OBSERVE
  const eventDetails = await logWrapper('get_event_details', { event_id: eventId });
  const eventStatus = await logWrapper('get_event_status', { event_id: eventId });
  const weather = await logWrapper('get_weather', { lat: eventDetails.lat, lon: eventDetails.lon });

  // Step 2: PREDICT
  const crowdFlow = await logWrapper('estimate_crowd_flow', {
    event_id: eventId,
    severity: weather.severity
  });

  // Step 3: PLAN
  const primaryHotspot = crowdFlow.roadSaturations.find((r: any) => r.isHotspot) || crowdFlow.roadSaturations[0];
  const candidateRoutesResult = await logWrapper('find_alternate_routes', { segment_id: primaryHotspot.segmentId });

  const scoringResult = await logWrapper('score_routes', {
    routes: candidateRoutesResult.routes,
    severity: weather.severity
  });

  const transitOptions = await logWrapper('get_transit_options', { event_id: eventId });

  const rainInfo = toolsImpl.getSimulatedRain();
  const isRain = weather.severity === 'heavy' || weather.severity === 'moderate';

  const vehiclesDiverted = crowdFlow.roadSaturations
    .filter((r: any) => r.isHotspot)
    .reduce((sum: number, r: any) => sum + r.addedVehicles, 0) || primaryHotspot.addedVehicles;

  const directBaseTime = 20;
  const chosenRouteTime = scoringResult.selectedRoute.travelTimeMins || 14;
  const minutesSaved = toolsImpl.calculateMinutesSaved(
    directBaseTime,
    crowdFlow.peakSaturationPct,
    chosenRouteTime,
    isRain
  );

  const comparisonResult = toolsImpl.computeLoadSpreadingComparison({
    roadSaturations: crowdFlow.roadSaturations,
    candidateRoutes: scoringResult.evaluatedRoutes,
    divertedVehiclesCount: vehiclesDiverted,
    baseMetroSharePct: crowdFlow.modeSplit.metroPct,
    isRain
  });

  const exitPlan = toolsImpl.computeStaggeredExitPlan({
    attendees: eventDetails.attendees,
    endTime: eventStatus.effectiveEndTime || eventDetails.endTime,
    isDelayed: eventStatus.isDelayed
  });

  const metroLever = toolsImpl.computeMetroLeverRecommendation({
    attendees: eventDetails.attendees,
    metroLine: transitOptions.metroLine,
    isRain
  });

  const plan = await logWrapper('create_police_plan', {
    event_id: eventId,
    trigger_reason: triggerReason.includes('Trigger:') ? triggerReason : undefined,
    summary: isRain
      ? `BTP Emergency Monsoon Plan for ${eventDetails.name}: Diversion via ${scoringResult.selectedRoute.name}`
      : `BTP Standard Surge Plan for ${eventDetails.name}: Diversion via ${scoringResult.selectedRoute.name}`,
    closures: [primaryHotspot.roadName + ' (Restricted to Emergency & Mass Transit)'],
    diversions: [
      {
        fromRoad: primaryHotspot.segmentId,
        divertVia: scoringResult.selectedRoute.name,
        routeId: scoringResult.selectedRoute.id
      }
    ],
    personnel_count: eventId === 'chinnaswamy_ipl' ? (isRain ? 48 : 42) : 32,
    route_scoring: scoringResult,
    spreading_splits: comparisonResult.spreadingSplits,
    comparison: comparisonResult,
    exit_plan: exitPlan,
    metro_lever: metroLever,
    emergency_corridors: [
      'Bowring Hospital Ambulance Green Corridor (via Raj Bhavan Rd)',
      'Fire & Rescue Standby at Gate 2'
    ],
    emergency_corridor_status: {
      name: 'Bowring Hospital Ambulance Green Corridor',
      protectedRoute: 'Raj Bhavan Rd -> Lady Curzon Rd -> ER Entrance',
      isExcludedFromDiversions: true,
      saturationPct: isRain ? 52 : 44,
      isOverCapacity: false,
      destination: 'Bowring & Lady Curzon Hospital'
    },
    kpis: {
      private_vehicles_expected: crowdFlow.privateVehicles,
      peak_road_saturation: crowdFlow.peakSaturationPct,
      hotspots_count: crowdFlow.hotspotCount,
      vehicles_diverted: vehiclesDiverted,
      estimated_minutes_saved: minutesSaved
    }
  });

  const reasoning: AgentReasoning = {
    overview: isRain
      ? `EMERGENCY MONSOON RE-PLAN: Rainfall accelerated to ${weather.rainMmPerHr} mm/h. Model re-computed saturated road network and detected critical waterlogging danger at Queens Road underpass. Capacity cut by 15%.`
      : `Agent synthesized ingress dynamics of ${eventDetails.attendees.toLocaleString()} attendees for ${eventDetails.name}. Model predicted peak saturation of ${crowdFlow.peakSaturationPct}% on ${primaryHotspot.roadName}.`,
    routeSelectionRationale: scoringResult.reasoning,
    weatherRiskAssessment: isRain
      ? `Flash monsoon storm (${weather.rainMmPerHr} mm/h) detected. Underpass depressions penalized by +${scoringResult.evaluatedRoutes[scoringResult.evaluatedRoutes.length - 1]?.scoreBreakdown?.rainLowLyingPenalty || 10} cost points, ruling out flood traps.`
      : `Weather is clear (${weather.rainMmPerHr} mm/h). Road friction nominal; normal arterial throughput maintained.`,
    transitMitigation: `Directing BMRCL to operate ${transitOptions.metroLine} at ${transitOptions.recommendedHeadwayMins}-minute headways, absorbing ~${crowdFlow.modeSplit.metroPct}% of crowd rush and bypassing surface chokepoints.`,
    triggerBadge: triggerReason.includes('Trigger:') ? triggerReason : undefined
  };

  return { logs, reasoning, plan, switchedToDemo };
}

/**
 * Execute Action Phase: Approve Plan and Dispatch Multilingual Alerts
 */
export async function executeApproveWorkflow(planId: string): Promise<{
  plan: PolicePlan;
  dispatchedAlerts: any[];
  logs: AgentActionLog[];
}> {
  const storedPlan = toolsImpl.getStoredPlan();
  if (!storedPlan) throw new Error('No active plan found to approve.');

  storedPlan.status = 'approved';
  storedPlan.approvedAt = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const event = await toolsImpl.get_event_details({ event_id: storedPlan.eventId });
  const weather = await toolsImpl.get_weather({ lat: event.lat, lon: event.lon });

  const logs: AgentActionLog[] = [];
  const logWrapper = async (toolName: string, args: Record<string, any>): Promise<any> => {
    const logId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();
    const res = await toolsImpl.send_alert(args as any);
    const durationMs = Date.now() - startTime;
    const log: AgentActionLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      phase: 'act',
      toolName,
      status: 'done',
      args,
      resultPreview: `Dispatched multilingual alert to [${args.group}]`,
      fullResult: res,
      durationMs
    };
    logs.push(log);
    return res;
  };

  const dispatchedAlerts: any[] = [];
  const isRain = weather.severity === 'moderate' || weather.severity === 'heavy';
  const minutesSaved = storedPlan.kpis.estimatedMinutesSaved || 35;
  const isUpdate = storedPlan.version > 1;

  // 1. Commuter traffic diversion alert
  const alert1 = await logWrapper('send_alert', {
    group: 'commuters',
    title: {
      en: isUpdate ? '🚨 UPDATE: BTP Traffic Diversion' : '🚨 Traffic Diversion Notice - BTP',
      kn: isUpdate ? '🚨 ನವೀಕರಣ: ಬಿಟಿಪಿ ಸಂಚಾರ ತಿರುವು' : '🚨 ಬಿಟಿಪಿ ಸಂಚಾರ ತಿರುವು ಸೂಚನೆ',
      hi: isUpdate ? '🚨 अपडेट: बीटीपी यातायात डायवर्जन' : '🚨 बीटीपी यातायात डायवर्जन सूचना'
    },
    message: {
      en: `Queens Road access restricted for ${event.name}. Through-traffic diverted via ${storedPlan.diversions[0]?.divertVia || 'Infantry Road'}. Saves ~${minutesSaved} mins delay.`,
      kn: `${event.name} ಗಾಗಿ ಕ್ವೀನ್ಸ್ ರಸ್ತೆ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಸಂಚಾರವನ್ನು ${storedPlan.diversions[0]?.divertVia || 'ಇನ್‌ಫೆಂಟ್ರಿ ರಸ್ತೆ'} ಮೂಲಕ ತಿರುಗಿಸಲಾಗಿದೆ. ~${minutesSaved} ನಿಮಿಷ ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
      hi: `${event.name} के लिए क्वींस रोड प्रवेश प्रतिबंधित है। यातायात को ${storedPlan.diversions[0]?.divertVia || 'इन्फैंट्री रोड'} की ओर मोड़ा गया है। लगभग ${minutesSaved} मिनट बचेंगे।`
    },
    urgency: isUpdate ? 'critical' : 'high',
    is_update: isUpdate,
    savings_minutes: minutesSaved
  });
  dispatchedAlerts.push(alert1);

  // 2. Ticket Holder Personalized Ingress Advice
  const alert2 = await logWrapper('send_alert', {
    group: 'ticket_holders',
    title: {
      en: '🏏 Attendee Advisory: Fastest Way to Venue',
      kn: '🏏 ವೀಕ್ಷಕರ ಸಲಹೆ: ಕ್ರೀಡಾಂಗಣಕ್ಕೆ ವೇಗದ ಮಾರ್ಗ',
      hi: '🏏 दर्शक सलाह: स्टेडियम पहुंचने का सबसे तेज रास्ता'
    },
    message: {
      en: `Leave by 5:15 or take the Metro from Indiranagar to MG Road, then walk 8 min. Saves about ${minutesSaved} min.`,
      kn: `ಸಂಜೆ 5:15 ಕ್ಕೆ ಹೊರಡಿ ಅಥವಾ ಇಂದಿರಾನಗರದಿಂದ ಎಂ.ಜಿ. ರಸ್ತೆಗೆ ಮೆಟ್ರೋ ತೆಗೆದುಕೊಂಡು 8 ನಿಮಿಷ ನಡೆದು ಸಾಗಿ. ಸುಮಾರು ${minutesSaved} ನಿಮಿಷ ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
      hi: `शाम 5:15 तक निकलें या इंदिरानगर से एमजी रोड तक मेट्रो लें, फिर 8 मिनट पैदल चलें। लगभग ${minutesSaved} मिनट बचेंगे।`
    },
    urgency: 'normal',
    is_update: isUpdate,
    savings_minutes: minutesSaved
  });
  dispatchedAlerts.push(alert2);

  // 3. Monsoon Flash Warning (if rain)
  if (isRain) {
    const alert3 = await logWrapper('send_alert', {
      group: 'all',
      title: {
        en: '🌧️ UPDATE: Flash Monsoon Waterlogging',
        kn: '🌧️ ನವೀಕರಣ: ಭಾರೀ ಮಳೆ ಹಾಗೂ ನೀರು ನಿಲ್ಲುವ ಎಚ್ಚರಿಕೆ',
        hi: '🌧️ अपडेट: अचानक भारी बारिश और जलभराव'
      },
      message: {
        en: `Torrential downpour (${weather.rainMmPerHr} mm/h) detected. Queens Road underpass waterlogged. Diverting to elevated corridor.`,
        kn: `ಅನಿರೀಕ್ಷಿತ ಭಾರೀ ಮಳೆ (${weather.rainMmPerHr} mm/h) ಆರಂಭವಾಗಿದೆ. ಕ್ವೀನ್ಸ್ ರಸ್ತೆ ಅಂಡರ್‌ಪಾಸ್‌ನಲ್ಲಿ ನೀರು ತುಂಬಿದೆ. ಮೇಲ್ಸೇತುವೆ ಮಾರ್ಗ ಬಳಸಲು ಕೋರಲಾಗಿದೆ.`,
        hi: `अचानक मूसलाधार बारिश (${weather.rainMmPerHr} मिमी/घंटा)। क्वींस रोड अंडरपास में जलभराव। कृपया एलिवेटेड कॉरिडोर का उपयोग करें।`
      },
      urgency: 'critical',
      is_update: true,
      savings_minutes: 25
    });
    dispatchedAlerts.push(alert3);
  }

  // 4. Metro Service Surge Notification
  const alert4 = await logWrapper('send_alert', {
    group: 'metro_riders',
    title: {
      en: '🚇 Namma Metro Surge Operations Active',
      kn: '🚇 ನಮ್ಮ ಮೆಟ್ರೋ ಹೆಚ್ಚುವರಿ ರೈಲು ಸೇವೆ ಸಕ್ರಿಯ',
      hi: '🚇 नम्मा मेट्रो अतिरिक्त ट्रेन सेवाएं सक्रिय'
    },
    message: {
      en: `BMRCL operating ${storedPlan.metroRequest.line} trains ${storedPlan.metroRequest.headway} until midnight.`,
      kn: `ಬಿಎಂಆರ್‌ಸಿಎಲ್ ${storedPlan.metroRequest.line} ನಲ್ಲಿ ಮಧ್ಯರಾತ್ರಿಯವರೆಗೆ ಪ್ರತಿ ${storedPlan.metroRequest.headway} ರೈಲುಗಳನ್ನು ಓಡಿಸುತ್ತಿದೆ.`,
      hi: `बीएमआरसीएल मध्यरात्रि तक हर ${storedPlan.metroRequest.headway} पर ट्रेनें संचालित कर रहा है।`
    },
    urgency: 'normal',
    is_update: isUpdate
  });
  dispatchedAlerts.push(alert4);

  // 5. Phase 5: Resident Access & Parking Advisory
  const alert5 = await logWrapper('send_alert', {
    group: 'residents',
    title: {
      en: '🏡 Resident Advisory: Neighborhood Pass & Access',
      kn: '🏡 ಸ್ಥಳೀಯ ನಿವಾಸಿಗಳ ಸಲಹೆ: ಪಾಸ್ ಮತ್ತು ಪ್ರವೇಶ ನಿಯಮ',
      hi: '🏡 स्थानीय निवासी सलाह: पास और प्रवेश व्यवस्था'
    },
    message: {
      en: `Vittal Mallya & Lavelle Road resident vehicle stickers permitted at barricades. Dedicated residential lane active. Commercial parking restricted until 23:45.`,
      kn: `ವಿಠಲ್ ಮಲ್ಯ ಮತ್ತು ಲ್ಯಾವೆಲ್ಲೆ ರಸ್ತೆ ನಿವಾಸಿಗಳ ವಾಹನಗಳಿಗೆ ಬ್ಯಾರಿಕೇಡ್‌ಗಳಲ್ಲಿ ಪ್ರವೇಶಾವಕಾಶವಿದೆ. ಪ್ರತ್ಯೇಕ ನಿವಾಸಿಗಳ ಲೇನ್ ಸಕ್ರಿಯವಾಗಿದೆ. 23:45 ರವರೆಗೆ ವಾಣಿಜ್ಯ ಪಾರ್ಕಿಂಗ್ ನಿಷೇಧಿಸಲಾಗಿದೆ.`,
      hi: `विट्टल माल्या और लावेल रोड निवासी स्टिकर वाले वाहनों को बैरिकेड्स पर प्रवेश की अनुमति है। 23:45 तक वाणिज्यिक पार्किंग प्रतिबंधित है।`
    },
    urgency: 'normal',
    is_update: isUpdate
  });
  dispatchedAlerts.push(alert5);

  // 6. Phase 5: Taxi & Auto Driver Dedicated Bays & Staging
  const alert6 = await logWrapper('send_alert', {
    group: 'taxi_drivers',
    title: {
      en: '🚕 Taxi & Auto Notice: Designated Pick-up/Drop Bays',
      kn: '🚕 ಟ್ಯಾಕ್ಸಿ ಮತ್ತು ಆಟೋ ಚಾಲಕರ ಸೂಚನೆ: ಗೊತ್ತುಪಡಿಸಿದ ಪಿಕ್-ಅಪ್ ಬೇಗಳು',
      hi: '🚕 टैक्सी और ऑटो सूचना: निर्धारित पिक-अप / ड्रॉप स्थल'
    },
    message: {
      en: `Gate 3 cab bay & Anil Kumble auto stand active. Strict no-stopping rule on Cubbon Road and MG Road arterials. Violators subject to towing.`,
      kn: `ಗೇಟ್ 3 ಕ್ಯಾಬ್ ಬೇ ಮತ್ತು ಅನಿಲ್ ಕುಂಬ್ಳೆ ಆಟೋ ಸ್ಟ್ಯಾಂಡ್ ಸಕ್ರಿಯವಾಗಿದೆ. ಕಬ್ಬನ್ ರಸ್ತೆ ಮತ್ತು ಎಂ.ಜಿ. ರಸ್ತೆಯಲ್ಲಿ ಯಾವುದೇ ವಾಹನ ನಿಲುಗಡೆಗೆ ಅವಕಾಶವಿಲ್ಲ.`,
      hi: `गेट 3 कैब बे और अनिल कुंबले ऑटो स्टैंड चालू हैं। कब्बन रोड और एमजी रोड पर रुकने की सख्त मनाही है।`
    },
    urgency: 'high',
    is_update: isUpdate
  });
  dispatchedAlerts.push(alert6);

  return {
    plan: storedPlan,
    dispatchedAlerts,
    logs
  };
}
