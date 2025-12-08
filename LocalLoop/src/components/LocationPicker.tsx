// LocationPicker Component - Manual location entry with automatic fallback

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { Input, Button } from './ui';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { Location as UserLocation } from '../types';
import { encodeGeohash } from '../utils/geohash';

interface LocationPickerProps {
    onLocationSelected: (location: UserLocation) => void;
    initialLocation?: UserLocation;
}

export function LocationPicker({ onLocationSelected, initialLocation }: LocationPickerProps) {
    const { location, address, loading, error, refreshLocation } = useLocation();
    const [manualMode, setManualMode] = useState(false);
    const [manualCity, setManualCity] = useState(initialLocation?.city || '');
    const [manualCountry, setManualCountry] = useState(initialLocation?.country || '');

    // Auto-select location when it becomes available
    useEffect(() => {
        if (location && address && !manualMode) {
            const userLocation: UserLocation = {
                coordinates: location,
                city: address.city,
                country: address.country,
                geohash: encodeGeohash(location.lat, location.lng),
            };
            onLocationSelected(userLocation);
        }
    }, [location, address, manualMode]);

    // Handle error by switching to manual mode
    useEffect(() => {
        if (error) {
            setManualMode(true);
        }
    }, [error]);

    const handleUseCurrentLocation = async () => {
        setManualMode(false);
        await refreshLocation();
    };

    const handleManualSubmit = () => {
        if (!manualCity.trim() || !manualCountry.trim()) {
            Alert.alert('Missing Information', 'Please enter both city and country.');
            return;
        }

        // Use approximate coordinates for the country capital or center
        // In production, you'd use a geocoding service
        const approximateCoords = {
            lat: 0,
            lng: 0,
        };

        const userLocation: UserLocation = {
            coordinates: approximateCoords,
            city: manualCity.trim(),
            country: manualCountry.trim(),
            geohash: encodeGeohash(approximateCoords.lat, approximateCoords.lng),
        };

        onLocationSelected(userLocation);
    };

    if (loading && !manualMode) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Getting your location...</Text>
                <Button
                    title="Enter Manually Instead"
                    variant="outline"
                    onPress={() => setManualMode(true)}
                    style={styles.switchButton}
                />
            </View>
        );
    }

    if (manualMode) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Enter Your Location</Text>
                <Text style={styles.subtitle}>
                    We need your location to show you people nearby
                </Text>

                <Input
                    label="City"
                    placeholder="e.g., Berlin"
                    value={manualCity}
                    onChangeText={setManualCity}
                    autoCapitalize="words"
                />

                <Input
                    label="Country"
                    placeholder="e.g., Germany"
                    value={manualCountry}
                    onChangeText={setManualCountry}
                    autoCapitalize="words"
                />

                <Button
                    title="Confirm Location"
                    onPress={handleManualSubmit}
                    disabled={!manualCity.trim() || !manualCountry.trim()}
                />

                <TouchableOpacity
                    style={styles.switchModeButton}
                    onPress={handleUseCurrentLocation}
                >
                    <Text style={styles.switchModeText}>
                        📍 Use my current location instead
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (location && address) {
        return (
            <View style={styles.container}>
                <View style={styles.locationCard}>
                    <Text style={styles.locationEmoji}>📍</Text>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationCity}>{address.city}</Text>
                        <Text style={styles.locationCountry}>{address.country}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Refresh Location"
                        variant="outline"
                        onPress={refreshLocation}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Enter Manually"
                        variant="outline"
                        onPress={() => setManualMode(true)}
                        style={styles.actionButton}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.errorText}>
                {error || 'Unable to get location'}
            </Text>
            <Button
                title="Enter Location Manually"
                onPress={() => setManualMode(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    loadingText: {
        marginTop: spacing.base,
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    switchButton: {
        marginTop: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.base,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        marginBottom: spacing.base,
    },
    locationEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    locationInfo: {
        flex: 1,
    },
    locationCity: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    locationCountry: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
    },
    switchModeButton: {
        marginTop: spacing.base,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    switchModeText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    errorText: {
        fontSize: typography.fontSize.base,
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.base,
    },
});

export default LocationPicker;
