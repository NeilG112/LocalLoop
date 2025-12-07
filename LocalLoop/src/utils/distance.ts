// Distance Calculation Utilities
// Uses Haversine formula for accurate distance calculation

import { Coordinates } from '../types';

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates
): number {
    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);
    const deltaLat = toRadians(coord2.lat - coord1.lat);
    const deltaLng = toRadians(coord2.lng - coord1.lng);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m away`;
    }
    if (km < 10) {
        return `${km.toFixed(1)}km away`;
    }
    return `${Math.round(km)}km away`;
}

/**
 * Check if a coordinate is within a radius of another
 */
export function isWithinRadius(
    center: Coordinates,
    point: Coordinates,
    radiusKm: number
): boolean {
    return calculateDistance(center, point) <= radiusKm;
}
