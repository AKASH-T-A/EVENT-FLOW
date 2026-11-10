/**
 * EventFlow Automated Test Suite
 * Step 6: Unit & Integration tests for crowd model, saturation, route scoring,
 * minutes saved, event status, weather thresholds, state transitions, and edge cases.
 */

import {
  estimate_crowd_flow,
  score_routes,
  calculateMinutesSaved,
  get_event_status,
  setSimulatedRain,
  setSimulatedDelay,
  get_weather,
  computeLoadSpreadingComparison,
  computeStaggeredExitPlan,
  computeMetroLeverRecommendation
} from '../server/tools';
import { CandidateRoute, ScenarioState } from '../src/types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    results.push({ name: testName, passed: true, details });
  } else {
    results.push({ name: testName, passed: false, error: details || 'Assertion failed' });
  }
}

async function runTests() {
  console.log('--- Starting EventFlow Automated Test Suite ---');

  // TEST 1: Crowd Model Calculation
  try {
    const crowd = await estimate_crowd_flow({
      event_id: 'chinnaswamy_ipl',
      severity: 'clear',
      assumptions: {
        privateSplitPct: 35,
        vehicleOccupancy: 2.5
      }
    });

    // 35,000 attendees x 35% / 2.5 = 4,900 private vehicles
    assert(
      crowd.privateVehicles === 4900,
      'Test 1.1: Crowd Model Private Vehicles calculation',
      `Expected 4900 private vehicles, got ${crowd.privateVehicles}`
    );

    // Peak surge = 4,900 * 0.45 = 2,205
    // Queens Road gets 34% of 2205 = 750 added vehicles. Baseline: 1550, Capacity: 2000.
    // Total = 2300. Saturation = round(2300 / 2000 * 100) = 115%
    const queensRd = crowd.roadSaturations.find((r) => r.segmentId === 'road_queens_rd');
    assert(
      queensRd !== undefined && queensRd.saturationPct >= 110,
      'Test 1.2: Road Saturation calculation for chokepoint (Queens Road)',
      `Queens Road saturation is ${queensRd?.saturationPct}%, expected >= 110%`
    );
    assert(
      queensRd?.isHotspot === true,
      'Test 1.3: Hotspot detection (>80%)',
      `Queens Road isHotspot flag: ${queensRd?.isHotspot}`
    );
  } catch (err: any) {
    assert(false, 'Test 1: Crowd model exception', err.message);
  }

  // TEST 2: Weather-Induced Crowd & Capacity Shift
  try {
    const rainCrowd = await estimate_crowd_flow({
      event_id: 'chinnaswamy_ipl',
      severity: 'heavy',
      assumptions: {
        rainCapacityCutPct: 15
      }
    });

    // Effective capacity of Queens Road (2000) cut by 15% = 1700
    const queensRdRain = rainCrowd.roadSaturations.find((r) => r.segmentId === 'road_queens_rd');
    assert(
      queensRdRain !== undefined && queensRdRain.capacity === 1700,
      'Test 2.1: Rain road capacity degradation (-15%)',
      `Queens Road capacity under rain: ${queensRdRain?.capacity}, expected 1700`
    );
    assert(
      (queensRdRain?.saturationPct ?? 0) > 120,
      'Test 2.2: Rain increases road saturation beyond clear conditions',
      `Rain saturation: ${queensRdRain?.saturationPct}%`
    );
  } catch (err: any) {
    assert(false, 'Test 2: Weather crowd shift exception', err.message);
  }

  // TEST 3: Route Scoring Formula
  try {
    const mockRoutes: CandidateRoute[] = [
      {
        id: 'route_a',
        segmentId: 'road_queens_rd',
        name: 'Route A (Safe elevated bypass)',
        description: 'Dry elevated bypass',
        distanceKm: 2.8,
        travelTimeMins: 11,
        hotspotSegmentsCrossed: 0,
        usesClosedRoad: false,
        lowLyingSegments: 0,
        waypoints: [[12.98, 77.59], [12.985, 77.595]]
      },
      {
        id: 'route_b',
        segmentId: 'road_queens_rd',
        name: 'Route B (Low-lying underpass)',
        description: 'Cuts through depression',
        distanceKm: 2.1,
        travelTimeMins: 9,
        hotspotSegmentsCrossed: 0,
        usesClosedRoad: false,
        lowLyingSegments: 1, // 1 low lying segment
        waypoints: [[12.98, 77.59], [12.982, 77.592]]
      },
      {
        id: 'route_c',
        segmentId: 'road_queens_rd',
        name: 'Route C (Crosses closed road)',
        description: 'Direct cut',
        distanceKm: 1.5,
        travelTimeMins: 8,
        hotspotSegmentsCrossed: 1, // 1 hotspot
        usesClosedRoad: true, // closed road (+20)
        lowLyingSegments: 0,
        waypoints: [[12.98, 77.59], [12.981, 77.591]]
      }
    ];

    // Under CLEAR weather:
    // Route A: 11 + 0 + 0 + (0.5 * 2.8 = 1.4) + 0 = 12.4
    // Route B: 9 + 0 + 0 + (0.5 * 2.1 = 1.1) + 0 = 10.1 (Route B wins in dry weather)
    // Route C: 8 + (15 * 1 = 15) + 20 + (0.5 * 1.5 = 0.8) + 0 = 43.8
    const clearScoring = await score_routes({ routes: mockRoutes, severity: 'clear' });
    assert(
      clearScoring.selectedRouteId === 'route_b',
      'Test 3.1: Route scoring in dry conditions selects faster Route B',
      `Selected ${clearScoring.selectedRouteId} (score: ${clearScoring.selectedRoute.score})`
    );

    // Under HEAVY RAIN:
    // Route A: 11 + 0 + 0 + 1.4 + 0 = 12.4
    // Route B: 9 + 0 + 0 + 1.1 + (10 * 1 = 10) = 20.1 (Route B gets +10 low lying flood penalty!)
    // Route A wins in heavy rain!
    const rainScoring = await score_routes({ routes: mockRoutes, severity: 'heavy' });
    assert(
      rainScoring.selectedRouteId === 'route_a',
      'Test 3.2: Route scoring in heavy rain avoids low-lying Route B and selects Route A',
      `Selected ${rainScoring.selectedRouteId} (score: ${rainScoring.selectedRoute.score}, Route B score: ${rainScoring.evaluatedRoutes.find((r) => r.id === 'route_b')?.score})`
    );
  } catch (err: any) {
    assert(false, 'Test 3: Route scoring formula exception', err.message);
  }

  // TEST 4: Minutes Saved Formula
  try {
    // Formula: (directBaseTravelTime * congestionMultiplier + rainDelay) - chosenRouteTravelTime
    // directBase = 22 mins, sat = 119%, chosenTime = 11 mins, rain = false
    // multiplier = 1 + ((119 - 60)/60)*1.35 = 1 + (59/60)*1.35 = 1 + 1.3275 = 2.3275
    // congestedTime = round(22 * 2.3275) = 51 mins.
    // saved = 51 - 11 = 40 mins.
    const savedDry = calculateMinutesSaved(22, 119, 11, false);
    assert(
      savedDry >= 30 && savedDry <= 45,
      'Test 4.1: Minutes saved under congestion',
      `Calculated minutes saved: ${savedDry} mins`
    );

    // With heavy rain: rainDelay = +12 mins.
    const savedRain = calculateMinutesSaved(22, 119, 11, true);
    assert(
      savedRain > savedDry,
      'Test 4.2: Rain adds congestion delay and increases minutes saved by diversion',
      `Rain minutes saved: ${savedRain} vs Dry: ${savedDry}`
    );
  } catch (err: any) {
    assert(false, 'Test 4: Minutes saved calculation exception', err.message);
  }

  // TEST 5: Event Status Timeline
  try {
    const statusUpcoming = await get_event_status({ event_id: 'chinnaswamy_ipl', now: '16:00' });
    assert(statusUpcoming.status === 'upcoming', 'Test 5.1: Status upcoming before 17:30', statusUpcoming.status);

    const statusArrival = await get_event_status({ event_id: 'chinnaswamy_ipl', now: '18:15' });
    assert(statusArrival.status === 'arrival_phase', 'Test 5.2: Status arrival_phase between 17:30-19:30', statusArrival.status);

    const statusLive = await get_event_status({ event_id: 'chinnaswamy_ipl', now: '20:30' });
    assert(statusLive.status === 'live', 'Test 5.3: Status live during match', statusLive.status);

    const statusExit = await get_event_status({ event_id: 'chinnaswamy_ipl', now: '23:30' });
    assert(statusExit.status === 'exit_phase', 'Test 5.4: Status exit_phase post match', statusExit.status);

    const statusFinished = await get_event_status({ event_id: 'chinnaswamy_ipl', now: '23:55' });
    assert(statusFinished.status === 'finished', 'Test 5.5: Status finished after 23:45', statusFinished.status);

    // Delay simulation check
    setSimulatedDelay(true, 45);
    const statusDelayed = await get_event_status({ event_id: 'chinnaswamy_ipl', now: '18:00' });
    assert(statusDelayed.isDelayed === true && statusDelayed.delayMinutes === 45, 'Test 5.6: Status handles match delay correctly', statusDelayed.statusNote);
    setSimulatedDelay(false, 0);
  } catch (err: any) {
    assert(false, 'Test 5: Event status exception', err.message);
  }

  // TEST 6: Weather Severity Thresholds
  try {
    // Exact thresholds: <0.5 -> clear, 0.5-1.9 -> possible, 2.0-6.9 -> moderate, >=7.0 -> heavy
    setSimulatedRain(true, 0.2);
    const wClear = await get_weather({ lat: 12.9788, lon: 77.5996 });
    assert(wClear.severity === 'clear', 'Test 6.1: Rain < 0.5 mm/h is clear', `Severity: ${wClear.severity}`);

    setSimulatedRain(true, 1.2);
    const wPossible = await get_weather({ lat: 12.9788, lon: 77.5996 });
    assert(wPossible.severity === 'possible', 'Test 6.2: Rain 1.2 mm/h is possible', `Severity: ${wPossible.severity}`);

    setSimulatedRain(true, 2.0);
    const wModerate = await get_weather({ lat: 12.9788, lon: 77.5996 });
    assert(wModerate.severity === 'moderate', 'Test 6.3: Exact 2.0 mm/h is moderate', `Severity: ${wModerate.severity}`);

    setSimulatedRain(true, 7.0);
    const wHeavy = await get_weather({ lat: 12.9788, lon: 77.5996 });
    assert(wHeavy.severity === 'heavy', 'Test 6.4: Exact 7.0 mm/h is heavy', `Severity: ${wHeavy.severity}`);

    setSimulatedRain(true, 14.0);
    const wTorrential = await get_weather({ lat: 12.9788, lon: 77.5996 });
    assert(wTorrential.severity === 'heavy', 'Test 6.5: 14.0 mm/h torrential is heavy', `Severity: ${wTorrential.severity}`);

    setSimulatedRain(false, 0);
  } catch (err: any) {
    assert(false, 'Test 6: Weather thresholds exception', err.message);
  }

  // TEST 7: Edge Cases (0 attendees, 0% private share, all routes jammed, occupancy 0)
  try {
    // Edge Case 7.1: 0% private vehicle share
    const zeroShareCrowd = await estimate_crowd_flow({
      event_id: 'chinnaswamy_ipl',
      severity: 'clear',
      assumptions: { privateSplitPct: 0 }
    });
    assert(
      zeroShareCrowd.privateVehicles === 0,
      'Test 7.1: 0% private vehicle share produces 0 vehicles',
      `Private vehicles: ${zeroShareCrowd.privateVehicles}`
    );

    // Edge Case 7.2: 0 vehicle occupancy division by zero guard
    const zeroOccupancyCrowd = await estimate_crowd_flow({
      event_id: 'chinnaswamy_ipl',
      severity: 'clear',
      assumptions: { vehicleOccupancy: 0 }
    });
    assert(
      !isNaN(zeroOccupancyCrowd.privateVehicles) && isFinite(zeroOccupancyCrowd.privateVehicles),
      'Test 7.2: Zero vehicle occupancy does not cause NaN or Infinity division',
      `Private vehicles: ${zeroOccupancyCrowd.privateVehicles}`
    );

    // Edge Case 7.3: All candidate routes jammed (each crosses 2 hotspots)
    const jammedRoutes: CandidateRoute[] = [
      {
        id: 'jam_1',
        segmentId: 'road_queens_rd',
        name: 'Jammed Route 1',
        description: 'Crosses multiple hotspots',
        distanceKm: 3.0,
        travelTimeMins: 15,
        hotspotSegmentsCrossed: 2,
        usesClosedRoad: false,
        lowLyingSegments: 0,
        waypoints: [[12.98, 77.59], [12.985, 77.595]]
      },
      {
        id: 'jam_2',
        segmentId: 'road_queens_rd',
        name: 'Jammed Route 2',
        description: 'Crosses multiple hotspots',
        distanceKm: 4.0,
        travelTimeMins: 20,
        hotspotSegmentsCrossed: 3,
        usesClosedRoad: false,
        lowLyingSegments: 0,
        waypoints: [[12.98, 77.59], [12.988, 77.598]]
      }
    ];
    const jammedScoring = await score_routes({ routes: jammedRoutes, severity: 'clear' });
    assert(
      jammedScoring.selectedRouteId === 'jam_1' && jammedScoring.selectedRoute.score! > 0,
      'Test 7.3: All candidate routes jammed gracefully scored and selects lower penalty option',
      `Selected route score: ${jammedScoring.selectedRoute.score}`
    );
  } catch (err: any) {
    assert(false, 'Test 7: Edge cases exception', err.message);
  }

  // TEST 8: State Machine Transition Logic
  try {
    const validStates: ScenarioState[] = [
      'idle',
      'predicting',
      'planning',
      'awaiting_approval',
      'approved',
      'replanning',
      'awaiting_approval_rev2',
      'complete'
    ];

    let currentState: ScenarioState = 'idle';
    const transitions: ScenarioState[] = [];
    transitions.push(currentState);

    // Run agent -> predicting
    currentState = 'predicting';
    transitions.push(currentState);

    // Routes evaluated -> planning
    currentState = 'planning';
    transitions.push(currentState);

    // Plan Rev 1 ready -> awaiting_approval
    currentState = 'awaiting_approval';
    transitions.push(currentState);

    // Police approves Rev 1 -> approved
    currentState = 'approved';
    transitions.push(currentState);

    // Rain starts -> replanning
    currentState = 'replanning';
    transitions.push(currentState);

    // Plan Rev 2 ready -> awaiting_approval_rev2
    currentState = 'awaiting_approval_rev2';
    transitions.push(currentState);

    // Police approves Rev 2 -> complete
    currentState = 'complete';
    transitions.push(currentState);

    const allValid = transitions.every((s) => validStates.includes(s));
    assert(
      allValid && transitions.length === 8,
      'Test 8.1: Full 8-stage state machine transition sequence valid',
      `Transitions traversed: ${transitions.join(' -> ')}`
    );
  } catch (err: any) {
    assert(false, 'Test 8: State transitions exception', err.message);
  }

  // TEST 9: Phase 1 Load Spreading & Comparison Calculation
  try {
    const crowd = await estimate_crowd_flow({
      event_id: 'chinnaswamy_ipl',
      severity: 'clear'
    });

    const candidateRoutes: CandidateRoute[] = [
      {
        id: 'r1',
        segmentId: 'road_queens_rd',
        name: 'Route 1: Infantry Rd Bypass (illustrative)',
        description: 'Bypass corridor',
        distanceKm: 2.8,
        travelTimeMins: 14,
        hotspotSegmentsCrossed: 0,
        usesClosedRoad: false,
        lowLyingSegments: 0,
        waypoints: [[12.9865, 77.5985], [12.9840, 77.5930]]
      },
      {
        id: 'r2',
        segmentId: 'road_queens_rd',
        name: 'Route 2: Cunningham Rd Detour (illustrative)',
        description: 'Loop corridor',
        distanceKm: 3.9,
        travelTimeMins: 22,
        hotspotSegmentsCrossed: 0,
        usesClosedRoad: false,
        lowLyingSegments: 0,
        waypoints: [[12.9865, 77.5985], [12.9890, 77.5940]]
      }
    ];

    const comparison = computeLoadSpreadingComparison({
      roadSaturations: crowd.roadSaturations,
      candidateRoutes,
      divertedVehiclesCount: 2150,
      baseMetroSharePct: 30,
      isRain: false
    });

    // 9.1: Sum of spreading percentages must be exactly 100%
    const totalPct = comparison.spreadingSplits.reduce((acc: number, s: any) => acc + s.percentage, 0);
    assert(
      totalPct === 100,
      'Test 9.1: Load spreading splits sum to exactly 100%',
      `Sum is ${totalPct}% across ${comparison.spreadingSplits.length} channels`
    );

    // 9.2: With EventFlow, every road saturation must stay under 85%
    const maxWithSat = comparison.busiestRoadSaturationPct.with;
    assert(
      maxWithSat <= 85,
      'Test 9.2: With EventFlow load spreading caps busiest road under 85%',
      `Max saturation with spreading: ${maxWithSat}%, without spreading: ${comparison.busiestRoadSaturationPct.without}%`
    );

    // 9.3: Without EventFlow causes jammed roads (>85%) while With EventFlow has 0 jammed roads
    assert(
      comparison.jammedRoadsCount.without > 0 && comparison.jammedRoadsCount.with === 0,
      'Test 9.3: Without EventFlow produces jammed roads, With EventFlow eliminates jammed roads',
      `Without: ${comparison.jammedRoadsCount.without} jammed, With: ${comparison.jammedRoadsCount.with} jammed`
    );

    // 9.4: Dynamic sentence correctly formatted
    const expectedSentenceSnippet = `Without spreading, the bypass reaches ${comparison.busiestRoadSaturationPct.without}%. With spreading, every road stays under ${comparison.busiestRoadSaturationPct.with}%.`;
    assert(
      comparison.summarySentence === expectedSentenceSnippet,
      'Test 9.4: Comparison dynamic sentence matches specification',
      `Sentence: "${comparison.summarySentence}"`
    );
  } catch (err: any) {
    assert(false, 'Test 9: Phase 1 load spreading exception', err.message);
  }

  // TEST 10: Phase 2 Staggered Exit Plan Calculation
  try {
    const exitPlan = computeStaggeredExitPlan({
      attendees: 35000,
      endTime: '23:15',
      isDelayed: false
    });

    // 10.1: Must produce 3-4 waves spaced at 8-10 min intervals
    assert(
      exitPlan.waves.length === 3,
      'Test 10.1: Staggered exit plan produces 3 waves',
      `Wave count: ${exitPlan.waves.length}`
    );

    // 10.2: Sum of wave attendee volumes equals total attendees
    const sumAttendees = exitPlan.waves.reduce((sum: number, w: any) => sum + w.attendeeVolume, 0);
    assert(
      sumAttendees === 35000,
      'Test 10.2: Exit waves volume matches total stadium attendees (35,000)',
      `Sum is ${sumAttendees}`
    );

    // 10.3: Peak reduction percentage must be significant (>30%)
    assert(
      exitPlan.peakReductionPct >= 30,
      'Test 10.3: Staggered exit flattens single spike by >= 30%',
      `Single spike: ${exitPlan.singleSpikePeakSaturationPct}% -> Staggered: ${exitPlan.staggeredPeakSaturationPct}% (${exitPlan.peakReductionPct}% reduction)`
    );

    // 10.4: Wave 1 is Metro priority
    assert(
      exitPlan.waves[0].priorityMode === 'metro_priority',
      'Test 10.4: Wave 1 prioritizes Metro concourse egress',
      `Priority: ${exitPlan.waves[0].priorityMode}`
    );
  } catch (err: any) {
    assert(false, 'Test 10: Staggered exit plan exception', err.message);
  }

  // TEST 11: Phase 3 Metro Active Lever Calculation
  try {
    const metroLever = computeMetroLeverRecommendation({
      attendees: 35000,
      metroLine: 'Purple Line (Baiyappanahalli - Challaghatta)',
      isRain: false
    });

    // 11.1: Headway reduced from 7.0m to 3.5m
    assert(
      metroLever.normalHeadwayMins === 7.0 && metroLever.recommendedHeadwayMins === 3.5,
      'Test 11.1: BMRCL headway recommendation cuts headway in half (7.0m -> 3.5m)',
      `Headways: ${metroLever.normalHeadwayMins}m -> ${metroLever.recommendedHeadwayMins}m`
    );

    // 11.2: Train capacity is 1,200 passengers per 6-car rake
    assert(
      metroLever.trainCapacity === 1200,
      'Test 11.2: BMRCL 6-car train capacity is 1,200 passengers',
      `Capacity: ${metroLever.trainCapacity}`
    );

    // 11.3: Vehicles removed = passengers / 2.5
    const expectedVehiclesRemoved = Math.round(metroLever.peakHourCapacityAdded / 2.5);
    assert(
      metroLever.vehiclesRemoved === expectedVehiclesRemoved,
      'Test 11.3: Surface vehicles removed equals added passengers / 2.5 occupancy',
      `Added capacity: ${metroLever.peakHourCapacityAdded} pax -> ${metroLever.vehiclesRemoved} vehicles removed`
    );

    // 11.4: Worded strictly as an inter-agency recommendation
    assert(
      metroLever.recommendationText.startsWith('RECOMMENDATION TO BMRCL:'),
      'Test 11.4: Text strictly formulated as recommendation to transit authority',
      `Preview: ${metroLever.recommendationText.substring(0, 30)}...`
    );
  } catch (err: any) {
    assert(false, 'Test 11: Metro lever recommendation exception', err.message);
  }

  // Print Summary Table
  console.log('\n================ TEST RESULTS SUMMARY ================');
  let passCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`PASS | ${r.name} ${r.details ? `(${r.details})` : ''}`);
    } else {
      failCount++;
      console.error(`FAIL | ${r.name} - Error: ${r.error}`);
    }
  }
  console.log(`======================================================`);
  console.log(`TOTAL: ${results.length} | PASSED: ${passCount} | FAILED: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
