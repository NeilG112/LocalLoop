// LocationPicker Component - Manual-first location input with validation

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useGeocoding } from '../hooks/useGeocoding';
import { Input, Button } from './ui';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { Location as UserLocation } from '../types';

interface LocationPickerProps {
    onLocationSelected: (location: UserLocation) => void;
    initialLocation?: UserLocation;
}

export function LocationPicker({ onLocationSelected, initialLocation }: LocationPickerProps) {
    const { getCurrentLocation, createLocationFromInput, loading } = useGeocoding();

    const [city, setCity] = useState(initialLocation?.city || '');
    const [country, setCountry] = useState(initialLocation?.country || '');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // Update fields when initialLocation changes
    useEffect(() => {
        if (initialLocation) {
            setCity(initialLocation.city);
            setCountry(initialLocation.country);
        }
    }, [initialLocation]);

    const handleUseCurrentLocation = async () => {
        const location = await getCurrentLocation();

        if (!location) {
            Alert.alert(
                'Location Unavailable',
                'Unable to get your current location. Please enter it manually or check your location permissions.'
            );
            return;
        }

        setCity(location.city);
        setCountry(location.country);
        onLocationSelected(location);
    };

    const handleValidateAndConfirm = async () => {
        if (!city.trim() || !country.trim()) {
            setValidationError('Please enter both city and country');
            return;
        }

        setIsValidating(true);
        setValidationError(null);

        const location = await createLocationFromInput(city.trim(), country.trim());

        setIsValidating(false);

        if (!location) {
            setValidationError('Location not found. Please check the spelling and try again.');
            return;
        }

        // Update fields with validated values (in case geocoding corrected them)
        setCity(location.city);
        setCountry(location.country);

        onLocationSelected(location);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Location</Text>
            <Text style={styles.subtitle}>
                Enter your city and country, or use your current location
            </Text>

            {/* Manual Input Fields */}
            <View style={styles.inputContainer}>
                <Input
                    label="City"
                    placeholder="e.g., Berlin, London, New York"
                    value={city}
                    onChangeText={(text) => {
                        setCity(text);
                        setValidationError(null);
                    }}
                    autoCapitalize="words"
                    editable={!loading && !isValidating}
                />

                <Input
                    label="Country"
                    placeholder="e.g., Germany, United Kingdom, USA"
                    value={country}
                    onChangeText={(text) => {
                        setCountry(text);
                        setValidationError(null);
                    }}
                    autoCapitalize="words"
                    editable={!loading && !isValidating}
                />

                {validationError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {validationError}</Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <Button
                    title={isValidating ? "Validating..." : "Confirm Location"}
                    onPress={handleValidateAndConfirm}
                    disabled={!city.trim() || !country.trim() || loading || isValidating}
                    loading={isValidating}
                    style={styles.confirmButton}
                />

                <TouchableOpacity
                    style={styles.useLocationButton}
                    onPress={handleUseCurrentLocation}
                    disabled={loading || isValidating}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <>
                            <Text style={styles.useLocationIcon}>📍</Text>
                            <Text style={styles.useLocationText}>Use My Current Location</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Info Text */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    💡 We'll validate your location to ensure it's correct
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.base,
    },
    inputContainer: {
        marginBottom: spacing.base,
    },
    errorContainer: {
        backgroundColor: colors.error + '10',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
        marginTop: spacing.sm,
    },
    errorText: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
    },
    actions: {
        gap: spacing.md,
    },
    confirmButton: {
        width: '100%',
    },
    useLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        gap: spacing.sm,
    },
    useLocationIcon: {
        fontSize: 20,
    },
    useLocationText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    infoContainer: {
        marginTop: spacing.base,
        padding: spacing.sm,
        backgroundColor: colors.primary + '10',
        borderRadius: borderRadius.md,
    },
    infoText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default LocationPicker;
