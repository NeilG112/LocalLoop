// Location Hook - Expo Location integration

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates, Location as UserLocation } from '../types';
import { encodeGeohash } from '../utils/geohash';

interface UseLocationResult {
    location: Coordinates | null;
    address: { city: string; country: string } | null;
    loading: boolean;
    error: string | null;
    requestPermission: () => Promise<boolean>;
    refreshLocation: () => Promise<void>;
    getLocationWithGeohash: () => Promise<UserLocation | null>;
}

export function useLocation(): UseLocationResult {
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [address, setAddress] = useState<{ city: string; country: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Location permission denied');
                return false;
            }
            return true;
        } catch (err) {
            setError('Failed to request location permission');
            return false;
        }
    }, []);

    const refreshLocation = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const hasPermission = await requestPermission();
            if (!hasPermission) {
                setLoading(false);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coords: Coordinates = {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude,
            };
            setLocation(coords);

            // Reverse geocode to get city/country
            try {
                const [reverseGeocode] = await Location.reverseGeocodeAsync({
                    latitude: coords.lat,
                    longitude: coords.lng,
                });

                if (reverseGeocode) {
                    setAddress({
                        city: reverseGeocode.city || reverseGeocode.subregion || 'Unknown',
                        country: reverseGeocode.country || 'Unknown',
                    });
                }
            } catch (geoError) {
                console.warn('Reverse geocoding failed:', geoError);
                setAddress({ city: 'Unknown', country: 'Unknown' });
            }
        } catch (err) {
            setError('Failed to get current location');
            console.error('Location error:', err);
        } finally {
            setLoading(false);
        }
    }, [requestPermission]);

    const getLocationWithGeohash = useCallback(async (): Promise<UserLocation | null> => {
        await refreshLocation();

        if (!location || !address) return null;

        return {
            coordinates: location,
            city: address.city,
            country: address.country,
            geohash: encodeGeohash(location.lat, location.lng),
        };
    }, [location, address, refreshLocation]);

    // Request location on mount
    useEffect(() => {
        refreshLocation();
    }, []);

    return {
        location,
        address,
        loading,
        error,
        requestPermission,
        refreshLocation,
        getLocationWithGeohash,
    };
}

export default useLocation;
