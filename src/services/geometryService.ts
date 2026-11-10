/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import roadGeometryCache from '../data/roadGeometry.json' with { type: 'json' };

export type Coordinate = [number, number]; // [lat, lng]

const cache: Record<string, Coordinate[]> = (roadGeometryCache as unknown) as Record<string, Coordinate[]>;

// In-memory runtime cache for any dynamically resolved routes
const runtimeMemoryCache = new Map<string, Coordinate[]>();

/**
 * Synchronous lookup from static pre-computed OSRM cache.
 * Guarantees zero network calls during demo playback.
 */
export function getCachedGeometry(
  id: string,
  fallbackWaypoints: Coordinate[]
): { coordinates: Coordinate[]; isApproximate: boolean } {
  if (cache[id] && cache[id].length > 0) {
    return { coordinates: cache[id], isApproximate: false };
  }
  if (runtimeMemoryCache.has(id)) {
    return { coordinates: runtimeMemoryCache.get(id)!, isApproximate: false };
  }
  return { coordinates: fallbackWaypoints, isApproximate: true };
}

/**
 * Asynchronous resolver that checks static cache first.
 * Only attempts OSRM network call if missing from cache.
 * If OSRM fails or network is blocked, falls back to waypoints and marks isApproximate = true.
 */
export async function resolveGeometry(
  id: string,
  waypoints: Coordinate[]
): Promise<{ coordinates: Coordinate[]; isApproximate: boolean }> {
  // 1. Static pre-computed cache hit
  if (cache[id] && cache[id].length > 0) {
    return { coordinates: cache[id], isApproximate: false };
  }
  if (runtimeMemoryCache.has(id)) {
    return { coordinates: runtimeMemoryCache.get(id)!, isApproximate: false };
  }

  // 2. Fallback: attempt live OSRM only if missing
  try {
    const coordString = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
      const coords: Coordinate[] = data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [Number(lat.toFixed(6)), Number(lng.toFixed(6))]
      );
      runtimeMemoryCache.set(id, coords);
      return { coordinates: coords, isApproximate: false };
    }
  } catch (err) {
    console.warn(`[Geometry] OSRM live fetch failed for ${id}, using approximate geometry fallback:`, err);
  }

  // 3. Fallback to straight waypoints
  return { coordinates: waypoints, isApproximate: true };
}

export function getAllCachedIds(): string[] {
  return Object.keys(cache);
}
