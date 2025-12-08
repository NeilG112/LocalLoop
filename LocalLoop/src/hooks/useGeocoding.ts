// Geocoding Hook - Location validation and coordinate retrieval

import { useState } from 'react';
import * as Location from 'expo-location';
import { Coordinates, Location as UserLocation } from '../types';
import { encodeGeohash } from '../utils/geohash';

interface GeocodeResult {
    coordinates: Coordinates;
    city: string;
    country: string;
    success: boolean;
    error?: string;
}

export function useGeocoding() {
    const [loading, setLoading] = useState(false);

    /**
     * Geocode a city and country to get coordinates
     * Uses Expo Location's geocoding service
     */
    const geocodeLocation = async (
        city: string,
        country: string
    ): Promise<GeocodeResult> => {
        setLoading(true);
        try {
            // Combine city and country for geocoding
            const address = `${city}, ${country}`;

            // Use Expo's geocoding to get coordinates
            const results = await Location.geocodeAsync(address);

            if (results.length === 0) {
                return {
                    coordinates: { lat: 0, lng: 0 },
                    city,
                    country,
                    success: false,
                    error: 'Location not found. Please check spelling.',
                };
            }

            // Use the first result
            const result = results[0];
            const coordinates: Coordinates = {
                lat: result.latitude,
                lng: result.longitude,
            };

            // Verify the location by reverse geocoding
            const [reverseResult] = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude,
            });

            // Use the verified city and country from reverse geocoding
            const verifiedCity = reverseResult?.city || city;
            const verifiedCountry = reverseResult?.country || country;

            return {
                coordinates,
                city: verifiedCity,
                country: verifiedCountry,
                success: true,
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                coordinates: { lat: 0, lng: 0 },
                city,
                country,
                success: false,
                error: 'Failed to validate location. Please try again.',
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get current location from GPS
     */
    const getCurrentLocation = async (): Promise<UserLocation | null> => {
        setLoading(true);
        try {
            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return null;
            }

            // Get current position
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coordinates: Coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Reverse geocode to get city/country
            const [reverseResult] = await Location.reverseGeocodeAsync({
                latitude: coordinates.lat,
                longitude: coordinates.lng,
            });

            if (!reverseResult) {
                return null;
            }

            return {
                coordinates,
                city: reverseResult.city || reverseResult.subregion || 'Unknown',
                country: reverseResult.country || 'Unknown',
                geohash: encodeGeohash(coordinates.lat, coordinates.lng),
            };
        } catch (error) {
            console.error('Get current location error:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a UserLocation object from validated city/country
     */
    const createLocationFromInput = async (
        city: string,
        country: string
    ): Promise<UserLocation | null> => {
        const result = await geocodeLocation(city, country);

        if (!result.success) {
            return null;
        }

        return {
            coordinates: result.coordinates,
            city: result.city,
            country: result.country,
            geohash: encodeGeohash(result.coordinates.lat, result.coordinates.lng),
        };
    };

    return {
        geocodeLocation,
        getCurrentLocation,
        createLocationFromInput,
        loading,
    };
}

export default useGeocoding;
