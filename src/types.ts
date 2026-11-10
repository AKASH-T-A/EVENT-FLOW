export type WeatherSeverity = 'clear' | 'possible' | 'moderate' | 'heavy';

export type EventStatus = 'upcoming' | 'arrival_phase' | 'live' | 'exit_phase' | 'finished';

export type SupportedLanguage = 'en' | 'kn' | 'hi';

export type OperatingMode = 'demo' | 'live_ai';

export type ScenarioState =
  | 'idle'
  | 'predicting'
  | 'planning'
  | 'awaiting_approval'
  | 'approved'
  | 'replanning'
  | 'awaiting_approval_rev2'
  | 'complete';

export interface RoadSegment {
  id: string;
  name: string;
  baselineVehicles: number;
  capacity: number;
  isLowLying: boolean;
  latLngs: [number, number][]; // coordinates for Leaflet polyline
}

export interface MetroStation {
  id: string;
  name: string;
  line: 'Purple Line' | 'Green Line' | 'Yellow Line';
  distanceMeters: number;
  lat: number;
  lon: number;
}

export interface EventData {
  id: string;
  name: string;
  type: 'sports' | 'concert' | 'cultural';
  venue: string;
  lat: number;
  lon: number;
  startTime: string; // e.g. "19:30"
  endTime: string;   // e.g. "23:15"
  attendees: number;
  description: string;
  nearbyRoads: RoadSegment[];
  nearbyMetro: MetroStation[];
}

export interface WeatherInfo {
  temperatureC: number;
  rainMmPerHr: number;
  severity: WeatherSeverity;
  isSimulatedOverride: boolean;
  conditionDescription: string;
  source: string;
  checkedAt: string;
}

export interface RoadSaturationResult {
  segmentId: string;
  roadName: string;
  baselineVehicles: number;
  addedVehicles: number;
  totalVehicles: number;
  capacity: number;
  saturationPct: number;
  isHotspot: boolean;
  isLowLying: boolean;
}

export interface CrowdFlowPrediction {
  eventId: string;
  weatherSeverity: WeatherSeverity;
  modeSplit: {
    metroPct: number;
    busPct: number;
    cabPct: number;
    privatePct: number;
  };
  privateVehicles: number;
  arrivalPeakWindow: string;
  exitPeakWindow: string;
  roadSaturations: RoadSaturationResult[];
  hotspotCount: number;
  peakSaturationPct: number;
}

export interface CandidateRoute {
  id: string;
  segmentId: string;
  name: string;
  description: string;
  distanceKm: number;
  travelTimeMins: number;
  hotspotSegmentsCrossed: number;
  usesClosedRoad: boolean;
  lowLyingSegments: number;
  waypoints: [number, number][];
  score?: number;
  scoreBreakdown?: {
    travelTime: number;
    hotspotPenalty: number;
    closedRoadPenalty: number;
    distanceFactor: number;
    rainLowLyingPenalty: number;
    total: number;
  };
}

export interface RouteScoringResult {
  segmentId: string;
  evaluatedRoutes: CandidateRoute[];
  selectedRouteId: string;
  selectedRoute: CandidateRoute;
  reasoning: string;
}

export interface TransitPlan {
  metroLine: string;
  normalHeadwayMins: number;
  recommendedHeadwayMins: number;
  additionalTrains: number;
  feederBusCount: number;
  pickupDropZones: string[];
}

export interface ExitWave {
  waveNumber: number;
  timeWindow: string; // e.g. "23:00 - 23:10"
  gateScope: string;  // e.g. "Gates 1 to 4 (North & East Stands)"
  attendeeVolume: number;
  priorityMode: 'metro_priority' | 'bus_shuttle' | 'private_cab';
  projectedPeakSaturationPct: number;
}

export interface StaggeredExitPlan {
  waves: ExitWave[];
  singleSpikePeakSaturationPct: number; // e.g. 138%
  staggeredPeakSaturationPct: number;   // e.g. 78%
  peakReductionPct: number;             // e.g. 43%
  summary: string;
}

export interface MetroLeverRecommendation {
  line: string;
  normalHeadwayMins: number;
  recommendedHeadwayMins: number;
  trainCapacity: number; // 1,200 passengers
  additionalTrainsNeeded: number;
  peakHourCapacityAdded: number; // e.g. 7,200 passengers
  vehiclesRemoved: number;        // passengers / 2.5
  saturationReliefPct: number;    // estimated relief on MG/Cubbon Road
  bmtcFeederBuses: number;
  recommendationText: string;
}

export interface EmergencyCorridorStatus {
  name: string;
  protectedRoute: string;
  isExcludedFromDiversions: boolean;
  saturationPct: number;
  isOverCapacity: boolean; // >70% alarm
  destination: string;
}

export interface PolicePlan {
  id: string;
  eventId: string;
  version: number;
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'superseded';
  createdAt: string;
  approvedAt?: string;
  triggerReason?: string;
  summary: string;
  closures: string[];
  diversions: {
    fromRoad: string;
    divertVia: string;
    routeId: string;
    waypoints: [number, number][];
  }[];
  personnelCount: number;
  personnelDeployment: { junction: string; officers: number }[];
  metroRequest: {
    line: string;
    headway: string;
    duration: string;
  };
  emergencyCorridors: string[];
  emergencyCorridorStatus?: EmergencyCorridorStatus;
  routeScoring?: RouteScoringResult;
  spreadingSplits?: LoadSpreadingSplit[];
  comparison?: ComparisonScenarioResult;
  exitPlan?: StaggeredExitPlan;
  metroLever?: MetroLeverRecommendation;
  kpis: {
    privateVehiclesExpected: number;
    peakRoadSaturation: number;
    hotspotsCount: number;
    vehiclesDiverted: number;
    estimatedMinutesSaved: number;
    alertsSent: number;
  };
}

export interface LoadSpreadingSplit {
  name: string;
  type: 'route' | 'metro' | 'park_and_ride';
  percentage: number;
  assignedVehicles: number;
  resultingSaturationPct?: number;
}

export interface ComparisonRoadMetric {
  roadName: string;
  withoutSaturationPct: number;
  withSaturationPct: number;
}

export interface ComparisonScenarioResult {
  busiestRoadSaturationPct: {
    without: number;
    with: number;
  };
  jammedRoadsCount: {
    without: number;
    with: number;
  };
  avgDelayMinutes: {
    without: number;
    with: number;
  };
  metroSharePct: {
    without: number;
    with: number;
  };
  roadComparisons: ComparisonRoadMetric[];
  spreadingSplits: LoadSpreadingSplit[];
  summarySentence: string;
}

export interface MultilingualText {
  en: string;
  kn: string;
  hi: string;
}

export interface CommuterAlert {
  id: string;
  timestamp: string;
  group: 'all' | 'commuters' | 'ticket_holders' | 'metro_riders' | 'police_officers' | 'residents' | 'taxi_drivers';
  title: MultilingualText;
  message: MultilingualText;
  urgency: 'normal' | 'high' | 'critical';
  isUpdate?: boolean;
  suggestedAction?: string;
  savingsMinutes?: number;
}

export interface AgentActionLog {
  id: string;
  timestamp: string;
  phase: 'observe' | 'predict' | 'plan' | 'act' | 'monitor';
  toolName: string;
  status: 'running' | 'done' | 'failed';
  triggerReason?: string;
  args: Record<string, unknown>;
  resultPreview: string;
  fullResult?: unknown;
  durationMs?: number;
}

export interface AgentReasoning {
  overview: string;
  routeSelectionRationale: string;
  weatherRiskAssessment: string;
  transitMitigation: string;
  triggerBadge?: string;
}

export interface AssumptionsConfig {
  metroSplitPct: number;
  busSplitPct: number;
  cabSplitPct: number;
  privateSplitPct: number;
  vehicleOccupancy: number;
  rainCapacityCutPct: number;
  hotspotWeight: number;
  closedRoadWeight: number;
  distanceWeight: number;
  rainLowLyingWeight: number;
}

export interface LiveScenarioStatus {
  isActive: boolean;
  isPaused: boolean;
  speedMultiplier: number; // 1x, 2x, 4x
  stageIndex: number;
  stageTitle: string;
  simulatedTime: string; // e.g. "17:30"
  progressPct: number; // 0 to 100
}

export interface SimulationState {
  currentEventId: string;
  eventStatus: EventStatus;
  operatingMode: OperatingMode;
  isSimulatedRain: boolean;
  isSimulatedDelay: boolean;
  matchDelayMins: number;
  weather: WeatherInfo;
  crowdFlow?: CrowdFlowPrediction;
  routeScoring?: RouteScoringResult[];
  transitOptions?: TransitPlan;
  activePlan?: PolicePlan;
  previousPlan?: PolicePlan; // Struck-through / superseded plan after re-plan
  alerts: CommuterAlert[];
  actionLogs: AgentActionLog[];
  reasoning?: AgentReasoning;
  agentRunning: boolean;
  lastMonitoringCheck?: string;
  assumptions: AssumptionsConfig;
  liveScenario: LiveScenarioStatus;
  selectedLanguage: SupportedLanguage;
}

export interface JudgeMilestone {
  id: number;
  timeSec: number;
  title: string;
  subtitle: string;
  narration: string;
  highlightCardId?: 'map' | 'logs' | 'plan' | 'alerts' | 'sandbox' | 'learning';
  actionTrigger?: 'observe' | 'predict' | 'plan' | 'approve' | 'rain' | 'replan' | 'after_action';
}

export interface JudgeDemoState {
  isActive: boolean;
  isPaused: boolean;
  currentMilestoneIndex: number;
  progressPct: number;
  speed: 1 | 1.5 | 2;
  isVoiceMuted: boolean;
}
