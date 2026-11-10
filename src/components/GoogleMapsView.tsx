/// <reference types="google.maps" />
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { EventData, CrowdFlowPrediction, PolicePlan } from '../types';
import { Landmark, Train, AlertTriangle, ShieldCheck, CloudRain } from 'lucide-react';
import { getCachedGeometry, Coordinate } from '../services/geometryService';

interface GoogleMapsViewProps {
  event: EventData;
  crowdFlow?: CrowdFlowPrediction;
  activePlan?: PolicePlan;
  isRaining: boolean;
  rainRate?: number;
  timeScrubHour?: number;
  apiKeyOverride?: string;
  onFallbackToLeaflet?: () => void;
}

// Dark Control-Room Map Style for Google Maps
const CONTROL_ROOM_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b1120' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#070b14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0d221c' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#081a2e' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

// Helper to overlay dynamic polylines on Google Map instance
function MapOverlays({
  event,
  crowdFlow,
  activePlan,
  timeScrubHour = 17.5
}: {
  event: EventData;
  crowdFlow?: CrowdFlowPrediction;
  activePlan?: PolicePlan;
  timeScrubHour?: number;
}) {
  const map = useMap();
  const roadPolylinesMapRef = useRef<Record<string, google.maps.Polyline>>({});
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const lastFittedPlanKeyRef = useRef<string | null>(null);

  // Calculate dynamic saturation mapping
  const roadSaturations = useMemo(() => {
    const saturations: Record<string, { pct: number; isHotspot: boolean }> = {};
    const [startH, startM] = event.startTime.split(':').map(Number);
    const eventStartDecimal = startH + startM / 60;
    const hoursToEvent = eventStartDecimal - timeScrubHour;

    let timeMultiplier = 0.5;
    if (hoursToEvent > 0 && hoursToEvent <= 2) {
      if (hoursToEvent <= 0.75 && hoursToEvent >= 0.25) {
        timeMultiplier = 1.0;
      } else {
        timeMultiplier = 0.7 + (1 - hoursToEvent / 2) * 0.3;
      }
    } else if (hoursToEvent <= 0 && hoursToEvent >= -3.5) {
      timeMultiplier = 0.4;
    } else if (hoursToEvent < -3.5 && hoursToEvent >= -4.5) {
      timeMultiplier = 1.1; // Exit surge
    }

    event.nearbyRoads.forEach((road) => {
      const pred = crowdFlow?.roadSaturations.find((r) => r.segmentId === road.id);
      let pct = pred ? pred.saturationPct : Math.round((road.baselineVehicles / road.capacity) * 100);
      pct = Math.round(pct * timeMultiplier);
      saturations[road.id] = {
        pct,
        isHotspot: pct >= 80
      };
    });
    return saturations;
  }, [event, crowdFlow, timeScrubHour]);

  // 1. Create road polylines using real OSRM cached geometry
  useEffect(() => {
    if (!map) return;

    // Clear previous road polylines
    Object.values(roadPolylinesMapRef.current).forEach((p) => p.setMap(null));
    roadPolylinesMapRef.current = {};

    event.nearbyRoads.forEach((road) => {
      const { coordinates: roadGeometry } = getCachedGeometry(road.id, road.latLngs);
      const path = roadGeometry.map(([lat, lng]) => ({ lat, lng }));

      const poly = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#10B981',
        strokeOpacity: 0.95,
        strokeWeight: 6,
        map
      });

      roadPolylinesMapRef.current[road.id] = poly;
    });

    return () => {
      Object.values(roadPolylinesMapRef.current).forEach((p) => p.setMap(null));
      roadPolylinesMapRef.current = {};
    };
  }, [map, event.id]);

  // 2. Live Color Updates without refetching geometry
  useEffect(() => {
    Object.entries(roadPolylinesMapRef.current).forEach(([roadId, poly]) => {
      const sat = roadSaturations[roadId] || { pct: 60, isHotspot: false };
      let strokeColor = '#10B981'; // Green: Smooth (<70%)

      if (sat.pct >= 90) {
        strokeColor = '#EF4444'; // Red: Jammed (>90%)
      } else if (sat.pct >= 70) {
        strokeColor = '#F59E0B'; // Amber: Busy (70-90%)
      }

      poly.setOptions({ strokeColor, strokeWeight: 6, strokeOpacity: 0.95 });
    });
  }, [roadSaturations]);

  // 3. Render Diversion Routes (Recommended: white outline 9 + blue 6; Rejected: grey 3) & Fit Bounds
  useEffect(() => {
    if (!map) return;

    // Clear previous route polylines
    routePolylinesRef.current.forEach((p) => p.setMap(null));
    routePolylinesRef.current = [];

    if (!activePlan) {
      lastFittedPlanKeyRef.current = null;
      return;
    }

    const allRecommendedCoords: Coordinate[] = [];

    // 3a. Rejected routes: thin grey, weight 3
    if (activePlan.routeScoring?.evaluatedRoutes) {
      const selectedId = activePlan.routeScoring.selectedRouteId;
      const rejectedRoutes = activePlan.routeScoring.evaluatedRoutes.filter((r) => r.id !== selectedId);

      rejectedRoutes.forEach((rej) => {
        const { coordinates: rejCoords } = getCachedGeometry(rej.id, rej.waypoints);
        const rejPath = rejCoords.map(([lat, lng]) => ({ lat, lng }));

        const rejPoly = new google.maps.Polyline({
          path: rejPath,
          geodesic: true,
          strokeColor: '#94A3B8',
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map
        });

        routePolylinesRef.current.push(rejPoly);
      });
    }

    // 3b. Recommended route: white outline underneath (weight 9) + solid blue (weight 6)
    if (activePlan.diversions && activePlan.diversions.length > 0) {
      activePlan.diversions.forEach((div) => {
        const routeId = div.routeId || activePlan.routeScoring?.selectedRouteId || 'route_infantry_bypass';
        const { coordinates: recCoords } = getCachedGeometry(routeId, div.waypoints);
        allRecommendedCoords.push(...recCoords);

        const recPath = recCoords.map(([lat, lng]) => ({ lat, lng }));

        // White outline underneath
        const outlinePoly = new google.maps.Polyline({
          path: recPath,
          geodesic: true,
          strokeColor: '#FFFFFF',
          strokeOpacity: 0.95,
          strokeWeight: 9,
          zIndex: 10,
          map
        });

        // Solid blue line on top
        const mainPoly = new google.maps.Polyline({
          path: recPath,
          geodesic: true,
          strokeColor: '#2563EB',
          strokeOpacity: 1.0,
          strokeWeight: 6,
          zIndex: 11,
          map
        });

        routePolylinesRef.current.push(outlinePoly, mainPoly);
      });
    }

    // 3c. Fit Bounds to Recommended Route
    if (allRecommendedCoords.length > 0) {
      const planKey = `${activePlan.id}_${activePlan.version}_${activePlan.status}`;
      if (lastFittedPlanKeyRef.current !== planKey) {
        lastFittedPlanKeyRef.current = planKey;
        const bounds = new google.maps.LatLngBounds();
        allRecommendedCoords.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    }

    return () => {
      routePolylinesRef.current.forEach((p) => p.setMap(null));
      routePolylinesRef.current = [];
    };
  }, [map, activePlan]);

  return null;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  event,
  crowdFlow,
  activePlan,
  isRaining,
  rainRate = 14,
  timeScrubHour = 17.5,
  apiKeyOverride,
  onFallbackToLeaflet
}) => {
  const [apiKey, setApiKey] = useState<string>(
    apiKeyOverride || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || ''
  );
  const [hasAuthError, setHasAuthError] = useState(false);

  // Fetch key from server if not set in client bundle
  useEffect(() => {
    if (!apiKey) {
      fetch('/api/config/maps-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) {
            setApiKey(data.apiKey);
          }
        })
        .catch(() => {});
    }
  }, [apiKey]);

  // Listen for Google Maps auth errors
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication failure. Falling back to Leaflet view.');
      setHasAuthError(true);
    };
    return () => {
      delete (window as any).gm_authFailure;
    };
  }, []);

  if (hasAuthError || !apiKey) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center border border-slate-800 rounded-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Google Maps Platform Key Required</h3>
        <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
          Google Maps Platform requires an active API key with Maps JavaScript API enabled.
          You can seamlessly use the built-in Leaflet OpenStreetMap view or 3D Digital Twin view with zero configuration.
        </p>
        <div className="flex items-center gap-3">
          {onFallbackToLeaflet && (
            <button
              onClick={onFallbackToLeaflet}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
            >
              Switch to Tactical Leaflet Map
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <APIProvider apiKey={apiKey}>
        <Map
          id="eventflow-google-map"
          defaultCenter={{ lat: event.lat, lng: event.lon }}
          center={{ lat: event.lat, lng: event.lon }}
          defaultZoom={15}
          zoom={15}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          styles={CONTROL_ROOM_STYLES}
          className="w-full h-full"
        >
          {/* Map Polylines for Congestion & Diversions */}
          <MapOverlays
            event={event}
            crowdFlow={crowdFlow}
            activePlan={activePlan}
            timeScrubHour={timeScrubHour}
          />

          {/* Venue Advanced Marker */}
          <AdvancedMarker position={{ lat: event.lat, lng: event.lon }} title={event.venue}>
            <div className="relative flex items-center justify-center">
              <span className="absolute -inset-3 rounded-full bg-cyan-400/30 animate-ping"></span>
              <span className="absolute -inset-1.5 rounded-full bg-cyan-500/40 animate-pulse"></span>
              <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-cyan-500/50">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
          </AdvancedMarker>

          {/* Metro Station Advanced Markers */}
          {event.nearbyMetro.map((metro) => (
            <AdvancedMarker
              key={metro.id}
              position={{ lat: metro.lat, lng: metro.lon }}
              title={`${metro.name} (${metro.line})`}
            >
              <div className="flex items-center gap-1.5 bg-slate-900/95 border border-purple-500/60 text-purple-300 px-2 py-1 rounded-full shadow-lg text-[10px] font-bold backdrop-blur-md">
                <Train className="w-3.5 h-3.5 text-purple-400" />
                <span>{metro.name.replace(' Metro', '')}</span>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Rain Simulation Overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden bg-slate-950/20">
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg">
            <CloudRain className="w-4 h-4 text-blue-400 animate-bounce" />
            <span>Precipitation: {rainRate} mm/h (Road Capacity Reduced by 15%)</span>
          </div>
        </div>
      )}

      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md text-[11px] space-y-1 shadow-xl">
        <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Google Maps Control-Room</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-400">Normal (&lt;70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-400">Moderate (70-90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-slate-400">Hotspot (&gt;90%)</span>
        </div>
        {activePlan && (
          <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400"></span>
            <span className="text-emerald-400 font-medium">Active Diversion Route</span>
          </div>
        )}
      </div>
    </div>
  );
};
