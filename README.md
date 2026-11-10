# EventFlow: Smart Mobility & Infrastructure Traffic Planning Agent

EventFlow is an autonomous AI agent designed for Bengaluru Traffic Police (BTP) and Bangalore Metro Rail Corporation (BMRCL) to forecast crowd-driven traffic surges around major urban events, formulate human-in-the-loop road diversion and transit surge plans, and dispatch timely multilingual alerts to commuters.

---

## Architecture Overview

EventFlow executes a closed decision loop:
1. **Observe**: Gathers event parameters, attendee volume, ingress schedule, and real-time precipitation.
2. **Predict**: Calculates crowd modal split, private vehicular volume, and corridor road saturations to pinpoint chokepoints.
3. **Plan**: Evaluates alternate bypass routes using a deterministic cost-scoring model (accounting for baseline traffic, distance, capacity, and flood-prone underpasses). Recommends personnel allocations and Metro frequency increases.
4. **Act**: Prompts the traffic police operator for single-click approval. Upon authorization, dispatches targeted alerts in English, Kannada, and Hindi.
5. **Monitor & Re-plan**: Detects unexpected environmental shifts (such as sudden heavy rain or match delays), re-scores corridors, and adapts diversions.

---

## Operating Modes: Demo Mode vs Live Mode

| Capability | Demo Mode (Scripted) | Live AI Mode |
| :--- | :--- | :--- |
| **Execution Engine** | Deterministic mathematical simulation | Google Gen AI SDK agent loop with function calling |
| **Model** | None (pure local calculation) | `gemini-2.5-flash` |
| **API Key Required** | No API key required | Requires `GEMINI_API_KEY` |
| **Weather Source** | Simulated weather (deterministic, 0 latency) | Open-Meteo live API |
| **Network Calls** | None (except standard OpenStreetMap tiles) | Open-Meteo API & Google Gemini API |
| **Fallback Behavior** | Always available as fail-safe default | Auto-switches to Demo mode with user notice if API is unavailable |

---

## Environment Variables

EventFlow runs out of the box in Demo mode without any environment variables. For Live AI mode, configure the following variables in `.env`:

```env
# GEMINI_API_KEY: API key for Google Gemini model calls.
# Required only for Live AI mode. Demo mode operates with zero keys.
GEMINI_API_KEY="your-gemini-api-key"

# GEMINI_MODEL: Specifies the Google Gemini model identifier.
# Defaults to gemini-2.5-flash if not provided.
GEMINI_MODEL="gemini-2.5-flash"

# PORT: Local web server port (defaults to 3000).
PORT=3000
```

---

## Sample Data and Limitations

EventFlow is an operational planning prototype built with real spatial geography and explicit mobility assumptions:

- **Real Geographic Data**:
  - Exact coordinates for venues: M. Chinnaswamy Stadium (`12.9788, 77.5996`), Palace Grounds (`13.0034, 77.5891`), and Lalbagh Botanical Garden (`12.9507, 77.5848`).
  - OpenStreetMap street geometries for surrounding arterial roads (MG Road, Cubbon Road, Kasturba Road, Residency Road, Queens Road, Jayamahal Road, etc.).
  - Real Namma Metro station locations (Cubbon Park, MG Road, Vidhana Soudha, Mantri Square, Lalbagh).

- **Assumed / Modeled Parameters**:
  - **Road Capacities & Baseline Flow**: Road capacities and baseline vehicle volumes are engineering assumptions rather than real-time sensor measurements.
  - **Candidate Routes**: Alternate corridor designations (e.g. Infantry Road bypass corridors) are illustrative routing paths for demonstration.
  - **Modal Split**: Standard assumption is 30% Metro, 15% BMTC Bus, 20% Cabs/Autos, 35% Private Personal Vehicles (at 2.5 persons per vehicle).
  - **Weather Penalty**: Heavy rain (≥7 mm/h) imposes an assumed 15% road capacity cut and penalizes low-lying underpasses by +10 cost score points.
  - **Minutes Saved Metric**: Defined strictly as:
    $$\text{Minutes Saved} = (\text{Direct Congested Travel Time}) - (\text{Chosen Route Travel Time})$$

---

## Phased Features & Mobility Capabilities

EventFlow provides a comprehensive suite of decision-support features:

1. **Without vs With EventFlow Comparison & Load Spreading**:
   - Compares an uncoordinated single-corridor surge (100% of diverted traffic cascades into the shortest bypass, reaching 185% saturation, 4 jammed roads, ~43 min delay) against multi-channel load spreading.
   - Discrete 50-vehicle packet iterative allocation distributes vehicles across candidate routes, high-frequency Metro, and Park-and-Ride shuttles to cap road saturations under 85%.
   - Dynamic comparison sentence: *"Without spreading, the bypass reaches 185%. With spreading, every road stays under 84%."*

2. **Staggered Exit Plan (Post-Event Egress Waves)**:
   - Divides stadium attendees into 3 egress waves spaced at 8-10 minute intervals by gate zone (North/East stands, Concourse/Members, South/West tiers).
   - Prioritizes Metro concourse in Wave 1.
   - Reduces post-event exit spike from 142% to 82% (42% peak congestion reduction).

3. **BMRCL Metro as an Active Lever**:
   - Mathematical inter-agency recommendation:
     - 6-car rake capacity: 1,200 passengers.
     - Headway cut from 7.0m to 3.5m (+6 extra trains/hour = +7,200 passengers/hour capacity).
     - Vehicles removed formula: $\text{Vehicles Removed} = \frac{\text{Added Passenger Capacity}}{2.5\text{ avg occupancy}} = 2,880\text{ vehicles}$.
     - Worded strictly as an inter-agency recommendation to BMRCL.

4. **Emergency Services Green Corridor**:
   - Bowring Hospital Ambulance Green Corridor (Raj Bhavan Rd -> Lady Curzon Rd -> ER Entrance) rendered as a distinct purple polyline on the Leaflet map with a dedicated map legend entry.
   - 100% excluded from commuter diversions and load spreading.
   - Dedicated dashboard status tile with an alert if corridor saturation exceeds 70%.

5. **Segmented Multilingual Role-Based Alerts**:
   - 4 audience groups: Match Attendees (Gate advice & metro tips), Through-Traffic (Bypass directions), Local Residents (Neighborhood access stickers & parking rules), and Taxis/Autos (Dedicated staging bays & towing warnings).
   - Complete translations in English, Kannada, and Hindi with operator review notice.

6. **Traffic Officer Event Form & What-If Sandbox**:
   - "+ Add Event" modal allowing officers to register custom venues and crowd sizes with an instant one-click preset for the campus pilot: *Acharya Habba Annual Cultural Fest (18,000 attendees)*.
   - Interactive "What-If Sandbox" drawer with live sliders for attendee volume, precipitation intensity (0-25 mm/h), private vehicle share (10-60%), and police deployments (15-80 officers).

7. **After-Action Learning Report**:
   - Post-event evaluation modal comparing predicted vehicles vs simulated ground loop detector telemetry.
   - Demonstrates adaptive model parameter learning: arterial ingress damping coefficient auto-calibrates from 1.05x to 1.02x based on observed ground truth.

8. **Telegram Bot API Dispatch**:
   - Direct integration with Telegram Bot API via `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
   - In-app interactive preview fallback ensures 100% functionality with zero external API keys in demo mode.

---

## Phased Implementation Summary Table

| Phase | Feature | Status | Tests Run | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Without vs With EventFlow & Load Spreading | **Complete** | 4 unit tests (Test 9.1-9.4), 12 scenario passes | Caps all road saturations under 85%; eliminates jammed roads (4 → 0); splits load across Route A, Route B, Metro, and Park-and-Ride |
| **Phase 2** | Staggered Exit Plan (3-4 Waves) | **Complete** | 4 unit tests (Test 10.1-10.4), 12 scenario passes | 3 waves at 8-10 min intervals; Metro priority wave 1; 42% exit peak reduction |
| **Phase 3** | BMRCL Metro as an Active Lever | **Complete** | 4 unit tests (Test 11.1-11.4), 12 scenario passes | Headway cut (7m → 3.5m); 1,200 pax/train; removes ~2,880 vehicles at 2.5 occupancy |
| **Phase 4** | Emergency Services Green Corridor | **Complete** | Visual polyline verification, 12 scenario passes | Bowring Hospital corridor drawn as purple polyline on Leaflet; 100% excluded from diversions |
| **Phase 5** | Role-Based Segmented Alerts | **Complete** | Multilingual text verification, 12 scenario passes | 4 groups (Attendees, Commuters, Residents, Taxis) in English, Kannada, and Hindi |
| **Phase 6** | Officer "Add Event" & What-If Sandbox | **Complete** | API endpoint test, reactive slider calculation verification | Supports custom events with Acharya Fest preset; live reactive sliders for crowd, rain, private share |
| **Phase 7** | After-Action Learning Report | **Complete** | Report API verification, telemetry accuracy check | Compares predictions vs actual ground truth (96% match); self-calibrates model factor (1.05x → 1.02x) |
| **Phase 8** | Telegram Bot API Dispatch | **Complete** | API dispatch test with in-app preview fallback | Interactive UI dispatch with zero-key fallback |

---

## Planned Future Integrations (Not Built Yet)

The following external integrations represent production roadmap milestones and are marked as not built yet:
1. **Bengaluru Traffic Police ITMS (Adaptive Traffic Control)**: Real-time ANPR and loop detector camera feeds for live volume counts. *(Status: Not built yet / Mocked in prototype)*
2. **BMRCL AFC Ticketing Data**: Live smart card and QR gate tap-ins at Cubbon Park and MG Road stations for real-time crowd exit counts. *(Status: Not built yet / Modeled via assumptions)*
3. **BMTC ITS GPS Stream**: Real-time vehicle location system feeds for Bengaluru city bus positions and bus lane speeds. *(Status: Not built yet / Modeled via assumptions)*
4. **TomTom / Google Traffic APIs**: Commercial live probe vehicle telemetry for live arterial travel times. *(Status: Not built yet / Replaced by OpenStreetMap geometries and capacity formulas)*
