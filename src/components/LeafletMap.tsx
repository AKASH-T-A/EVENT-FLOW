/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventData, PolicePlan, CrowdFlowPrediction } from '../types';
import { getCachedGeometry, Coordinate } from '../services/geometryService';

interface LeafletMapProps {
  event: EventData;
  crowdFlow?: CrowdFlowPrediction;
  activePlan?: PolicePlan;
  isRaining: boolean;
  rainRate?: number;
  timeScrubHour?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  event,
  crowdFlow,
  activePlan,
  isRaining,
  rainRate = 14,
  timeScrubHour
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Separate layer groups so routes, roads, and markers can update independently
  const roadsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Keep references to road polylines to update colors live without refetching geometry
  const roadPolylinesRef = useRef<
    Map<
      string,
      {
        polyline: L.Polyline;
        name: string;
        baselineVehicles: number;
        capacity: number;
        isApproximate: boolean;
      }
    >
  >(new Map());

  const lastFittedPlanKeyRef = useRef<string | null>(null);
  const [tileError, setTileError] = useState(false);
  const [hasApproximateGeometry, setHasApproximateGeometry] = useState(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = event.lat || 12.9788;
    const initialLon = event.lon || 77.5996;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    const osmTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    osmTileLayer.on('tileerror', () => {
      setTileError(true);
    });

    // Layer order: roads on bottom, routes in middle, markers on top
    roadsLayerGroupRef.current = L.layerGroup().addTo(map);
    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Build Road Polylines & Markers when Event changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const roadsGroup = roadsLayerGroupRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !roadsGroup || !markersGroup) return;

    roadsGroup.clearLayers();
    markersGroup.clearLayers();
    roadPolylinesRef.current.clear();

    let anyApproximate = false;

    // Center map on event if no active plan
    if (!activePlan) {
      map.setView([event.lat, event.lon], 15, { animate: true });
    }
    map.invalidateSize();

    // 2a. Venue Marker
    const venueIconHtml = `
      <div style="display:flex; align-items:center; justify-content:center; flex-direction:column; width:36px; height:36px;">
        <div style="background:#2563EB; color:#FFFFFF; width:32px; height:32px; border-radius:50%; border:2px solid #FFFFFF; box-shadow:0 1px 3px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;">
          🏟️
        </div>
        <div style="background:#FFFFFF; color:#1F2933; border:1px solid #E5E7EB; font-size:11px; font-weight:600; padding:1px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          ${event.venue.split(',')[0]}
        </div>
      </div>
    `;

    const venueIcon = L.divIcon({
      html: venueIconHtml,
      className: 'custom-venue-icon',
      iconSize: [36, 48],
      iconAnchor: [18, 20]
    });

    const venueMarker = L.marker([event.lat, event.lon], { icon: venueIcon }).addTo(markersGroup);
    venueMarker.bindPopup(`
      <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1F2933; line-height: 1.4;">
        <strong style="font-size: 14px; color: #1F2933;">${event.name}</strong><br/>
        <span style="color: #6B7280; font-size: 12px;">${event.venue}</span>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E5E7EB; font-size: 12px;">
          Expected attendees: <strong>${event.attendees.toLocaleString()}</strong><br/>
          Timing: <strong>${event.startTime} - ${event.endTime}</strong>
        </div>
      </div>
    `);

    // 2b. Metro Stations
    event.nearbyMetro.forEach((metro) => {
      const metroHtml = `
        <div style="background:#FFFFFF; border:1px solid #D1D5DB; border-radius:4px; padding:2px 6px; font-size:11px; font-weight:600; color:#4B5563; display:flex; align-items:center; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.06); white-space:nowrap;">
          <span style="color:#7C3AED; font-weight:700;">M</span>
          <span>${metro.name.replace(' Metro', '')}</span>
        </div>
      `;

      const metroIcon = L.divIcon({
        html: metroHtml,
        className: 'metro-icon',
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      const m = L.marker([metro.lat, metro.lon], { icon: metroIcon }).addTo(markersGroup);
      m.bindPopup(`
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1F2933;">
          <strong>${metro.name}</strong> (${metro.line})<br/>
          Walking distance: <strong>${metro.distanceMeters} meters</strong> from venue
        </div>
      `);
    });

    // 2c. Real Road Geometry Segments
    event.nearbyRoads.forEach((road) => {
      const { coordinates: roadGeometry, isApproximate } = getCachedGeometry(road.id, road.latLngs);
      if (isApproximate) anyApproximate = true;

      // Draw with initial green smooth style; live saturation effect will recolor immediately
      const polyline = L.polyline(roadGeometry, {
        color: '#10B981',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(roadsGroup);

      roadPolylinesRef.current.set(road.id, {
        polyline,
        name: road.name,
        baselineVehicles: road.baselineVehicles,
        capacity: road.capacity,
        isApproximate
      });
    });

    setHasApproximateGeometry(anyApproximate);
  }, [event.id]);

  // 3. Live Saturation & Color Update (Runs without refetching geometry)
  useEffect(() => {
    roadPolylinesRef.current.forEach(({ polyline, name, baselineVehicles, capacity, isApproximate }, roadId) => {
      const sat = crowdFlow?.roadSaturations.find((r) => r.segmentId === roadId);
      let saturationPct = sat ? sat.saturationPct : Math.round((baselineVehicles / capacity) * 100);

      if (timeScrubHour !== undefined) {
        const distanceToPeak = Math.abs(timeScrubHour - 18.5);
        const timeFactor = Math.max(0.6, 1.2 - distanceToPeak * 0.15);
        saturationPct = Math.round(saturationPct * timeFactor);
      }

      let strokeColor = '#10B981'; // Green: Smooth (<70%)
      let statusLabel = 'Smooth';

      if (saturationPct > 90) {
        strokeColor = '#EF4444'; // Red: Jammed (>90%)
        statusLabel = 'Jammed';
      } else if (saturationPct >= 70) {
        strokeColor = '#F59E0B'; // Amber: Busy (70-90%)
        statusLabel = 'Busy';
      }

      // Update color and popup live on existing polyline instance
      polyline.setStyle({ color: strokeColor });
      polyline.setPopupContent(`
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1F2933;">
          <strong style="font-size: 14px;">${name}</strong><br/>
          Traffic status: <strong style="color: ${strokeColor};">${statusLabel} (${saturationPct}%)</strong><br/>
          Baseline flow: ${baselineVehicles} vehicles / capacity ${capacity}
          ${isApproximate ? '<br/><span style="color: #F59E0B; font-size: 11px;">(approximate geometry)</span>' : ''}
        </div>
      `);
    });
  }, [crowdFlow, timeScrubHour]);

  // 4. Diversion Routes (Recommended & Rejected) & Auto-fit Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesGroup = routesLayerGroupRef.current;
    if (!map || !routesGroup) return;

    routesGroup.clearLayers();

    if (!activePlan) {
      lastFittedPlanKeyRef.current = null;
      return;
    }

    const allRecommendedCoords: Coordinate[] = [];
    let anyApproximate = false;

    // 4a. Draw Rejected Candidate Routes (Thin grey, weight 3)
    if (activePlan.routeScoring?.evaluatedRoutes) {
      const selectedId = activePlan.routeScoring.selectedRouteId;
      const rejectedRoutes = activePlan.routeScoring.evaluatedRoutes.filter((r) => r.id !== selectedId);

      rejectedRoutes.forEach((rej) => {
        const { coordinates: rejCoords, isApproximate } = getCachedGeometry(rej.id, rej.waypoints);
        if (isApproximate) anyApproximate = true;

        const rejPoly = L.polyline(rejCoords, {
          color: '#94A3B8', // Thin grey
          weight: 3,
          opacity: 0.65,
          dashArray: '6, 6',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routesGroup);

        rejPoly.bindPopup(`
          <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1F2933;">
            <strong style="color: #64748B; font-size: 14px;">${rej.name}</strong><br/>
            Status: <strong>Alternative route (Rejected)</strong><br/>
            Cost score: <strong>${rej.score}</strong> (Score breakdown: travel ${rej.travelTimeMins}m, hotspot penalty +${rej.scoreBreakdown?.hotspotPenalty || 0})<br/>
            ${rej.description}
            ${isApproximate ? '<br/><span style="color: #F59E0B; font-size: 11px;">(approximate geometry)</span>' : ''}
          </div>
        `);
      });
    }

    // 4b. Draw Recommended Diversion Route (White outline weight 9 + solid blue weight 6)
    if (activePlan.diversions && activePlan.diversions.length > 0) {
      activePlan.diversions.forEach((div) => {
        const routeId = div.routeId || activePlan.routeScoring?.selectedRouteId || 'route_infantry_bypass';
        const { coordinates: recCoords, isApproximate } = getCachedGeometry(routeId, div.waypoints);
        if (isApproximate) anyApproximate = true;

        allRecommendedCoords.push(...recCoords);

        // Underneath: white outline (weight 9) ensures visibility on any map background
        L.polyline(recCoords, {
          color: '#FFFFFF',
          weight: 9,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routesGroup);

        // On top: solid calm blue (weight 6)
        const recPolyline = L.polyline(recCoords, {
          color: '#2563EB',
          weight: 6,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routesGroup);

        recPolyline.bindTooltip('Recommended route', {
          permanent: true,
          direction: 'center',
          className: 'bg-[#2563EB] text-white text-xs font-semibold px-2 py-0.5 rounded border border-blue-700 shadow-sm'
        });

        recPolyline.bindPopup(`
          <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1F2933;">
            <strong style="color: #2563EB; font-size: 14px;">Recommended diversion route</strong><br/>
            Bypassing: <strong>${div.fromRoad}</strong><br/>
            Diverted via: <strong>${div.divertVia}</strong>
            ${isApproximate ? '<br/><span style="color: #F59E0B; font-size: 11px;">(approximate geometry)</span>' : ''}
          </div>
        `);
      });
    }

    // 4c. Phase 4: Protected Emergency Services Green Corridor (Purple Polyline)
    if (activePlan.emergencyCorridors && activePlan.emergencyCorridors.length > 0) {
      const emergencyWaypoints: [number, number][] = [
        [12.9865, 77.5985], // Raj Bhavan Rd
        [12.9835, 77.6015], // Lady Curzon Rd
        [12.9818, 77.6052]  // Bowring Hospital ER
      ];

      // White outline underneath
      L.polyline(emergencyWaypoints, {
        color: '#FFFFFF',
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routesGroup);

      // Solid purple polyline (weight 5)
      const emergPolyline = L.polyline(emergencyWaypoints, {
        color: '#8B5CF6',
        weight: 5,
        opacity: 1.0,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routesGroup);

      emergPolyline.bindTooltip('Emergency Corridor (Ambulance)', {
        permanent: false,
        direction: 'center',
        className: 'bg-purple-700 text-white text-xs font-semibold px-2 py-0.5 rounded'
      });

      emergPolyline.bindPopup(`
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1F2933;">
          <strong style="color: #8B5CF6; font-size: 14px;">🚑 Bowring Hospital Emergency Green Corridor</strong><br/>
          Status: <strong>Protected & Excluded from Commuter Diversions</strong><br/>
          Corridor Load: <strong>${activePlan.emergencyCorridorStatus?.saturationPct ?? 44}%</strong> (Safe &lt;70%)
        </div>
      `);
    }

    if (anyApproximate) setHasApproximateGeometry(true);

    // 4d. Fit Map Bounds to Recommended Route
    if (allRecommendedCoords.length > 0) {
      const planKey = `${activePlan.id}_${activePlan.version}_${activePlan.status}`;
      if (lastFittedPlanKeyRef.current !== planKey) {
        lastFittedPlanKeyRef.current = planKey;
        const bounds = L.latLngBounds(allRecommendedCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
      }
    }
  }, [activePlan]);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

      {/* Tile error notice if OSM tiles fail */}
      {tileError && (
        <div className="absolute top-3 left-3 z-[1000] bg-white border border-slate-300 text-slate-800 text-xs px-3 py-1.5 rounded shadow-xs">
          Fallback map mode (needs no API key; vector routes rendered)
        </div>
      )}

      {/* Approximate geometry badge if fallback ever activates */}
      {hasApproximateGeometry && (
        <div className="absolute top-12 left-3 z-[1000] bg-amber-50 border border-amber-300 text-amber-800 text-xs px-2.5 py-1 rounded shadow-xs">
          approximate geometry
        </div>
      )}

      {/* Weather Indicator label */}
      {isRaining && (
        <div className="absolute top-3 right-3 z-[1000] bg-white border border-slate-300 text-slate-800 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span>Rain: {rainRate} mm/h (Road capacity -15%)</span>
        </div>
      )}

      {/* Clean Legend: Smooth, Busy, Jammed, Recommended, Rejected, and Emergency */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white border border-slate-200 rounded p-2.5 text-xs text-slate-700 flex flex-wrap items-center gap-3.5 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#10B981] inline-block"></span>
          <span>Smooth (&lt;70%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#F59E0B] inline-block"></span>
          <span>Busy (70–90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#EF4444] inline-block"></span>
          <span>Jammed (&gt;90%)</span>
        </div>
        {activePlan && (
          <>
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="w-4 h-1.5 bg-[#2563EB] inline-block rounded-xs"></span>
              <span className="text-blue-700 font-semibold">Recommended</span>
            </div>
            {activePlan.routeScoring?.evaluatedRoutes && activePlan.routeScoring.evaluatedRoutes.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-[#94A3B8] inline-block border-t border-dashed border-[#64748B]"></span>
                <span className="text-slate-500">Rejected</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#8B5CF6] inline-block rounded-xs border-b border-purple-400"></span>
              <span className="text-purple-700 font-semibold">Emergency corridor</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
