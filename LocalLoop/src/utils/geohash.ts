// Geohash Utilities for location-based queries
// Based on geofire-common patterns for Firestore optimization

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode coordinates to a geohash string
 */
export function encodeGeohash(lat: number, lng: number, precision: number = 9): string {
    let hash = '';
    let minLat = -90, maxLat = 90;
    let minLng = -180, maxLng = 180;
    let isLng = true;
    let bits = 0;
    let charIndex = 0;

    while (hash.length < precision) {
        if (isLng) {
            const mid = (minLng + maxLng) / 2;
            if (lng >= mid) {
                charIndex = charIndex * 2 + 1;
                minLng = mid;
            } else {
                charIndex = charIndex * 2;
                maxLng = mid;
            }
        } else {
            const mid = (minLat + maxLat) / 2;
            if (lat >= mid) {
                charIndex = charIndex * 2 + 1;
                minLat = mid;
            } else {
                charIndex = charIndex * 2;
                maxLat = mid;
            }
        }

        isLng = !isLng;
        bits++;

        if (bits === 5) {
            hash += BASE32[charIndex];
            bits = 0;
            charIndex = 0;
        }
    }

    return hash;
}

/**
 * Get geohash bounds for neighbor calculation
 */
function getNeighborBounds(
    lat: number,
    lng: number,
    radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    const latDelta = radiusKm / 110.574;
    const lngDelta = radiusKm / (111.320 * Math.cos(lat * Math.PI / 180));

    return {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
    };
}

/**
 * Get geohash query bounds for a radius search
 * Returns array of [start, end] geohash strings to query
 */
export function getGeohashRange(
    lat: number,
    lng: number,
    radiusKm: number
): { lower: string; upper: string }[] {
    // For simplicity, we'll use a single range based on precision
    // A production app would use multiple ranges for accuracy

    const precision = radiusKm > 50 ? 4 : radiusKm > 10 ? 5 : 6;
    const centerHash = encodeGeohash(lat, lng, precision);

    // Get the range by using the hash prefix
    const lower = centerHash;
    const upper = centerHash.slice(0, -1) + String.fromCharCode(centerHash.charCodeAt(centerHash.length - 1) + 1);

    return [{ lower, upper }];
}

/**
 * Calculate geohash precision based on radius
 */
export function getPrecisionForRadius(radiusKm: number): number {
    if (radiusKm <= 0.5) return 8;
    if (radiusKm <= 2) return 7;
    if (radiusKm <= 10) return 6;
    if (radiusKm <= 40) return 5;
    if (radiusKm <= 150) return 4;
    if (radiusKm <= 600) return 3;
    return 2;
}
