import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useAuth } from '../src/contexts/AuthContext';
import { Button } from '../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../src/config/theme';
import { GenderPreference } from '../src/types';

export default function EditPreferencesScreen() {
    const router = useRouter();
    const { user, updateUserProfile } = useAuth();
    const [saving, setSaving] = useState(false);

    // Local state for preferences
    const [ageMin, setAgeMin] = useState(user?.preferences.agePreference.min || 18);
    const [ageMax, setAgeMax] = useState(user?.preferences.agePreference.max || 50);
    const [distance, setDistance] = useState(user?.preferences.radiusPreference || 50);
    const [gender, setGender] = useState<GenderPreference>(user?.preferences.genderPreference || 'any');

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateUserProfile({
                preferences: {
                    agePreference: { min: ageMin, max: ageMax },
                    radiusPreference: distance,
                    genderPreference: gender,
                }
            });
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const GenderOption = ({ value, label }: { value: GenderPreference, label: string }) => (
        <TouchableOpacity
            style={[
                styles.genderOption,
                gender === value && styles.genderOptionSelected
            ]}
            onPress={() => setGender(value)}
        >
            <Text style={[
                styles.genderText,
                gender === value && styles.genderTextSelected
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Discovery Preferences</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <Text style={[styles.saveButton, saving && styles.disabledText]}>
                        Save
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Distance Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Maximum Distance</Text>
                        <Text style={styles.valueText}>{distance} km</Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={distance}
                        onValueChange={setDistance}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />
                </View>

                {/* Gender Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Show Me</Text>
                    <View style={styles.genderContainer}>
                        <GenderOption value="any" label="Everyone" />
                        <GenderOption value="male" label="Men" />
                        <GenderOption value="female" label="Women" />
                    </View>
                </View>

                {/* Age Range Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Age Range</Text>
                        <Text style={styles.valueText}>{ageMin} - {ageMax}</Text>
                    </View>

                    <Text style={styles.subLabel}>Minimum Age: {ageMin}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={18}
                        maximumValue={100}
                        step={1}
                        value={ageMin}
                        onValueChange={(val) => {
                            setAgeMin(val);
                            if (val > ageMax) setAgeMax(val);
                        }}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />

                    <Text style={styles.subLabel}>Maximum Age: {ageMax}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={18}
                        maximumValue={100}
                        step={1}
                        value={ageMax}
                        onValueChange={(val) => {
                            setAgeMax(val);
                            if (val < ageMin) setAgeMin(val);
                        }}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />
                </View>

                <Text style={styles.disclaimer}>
                    LocalLoop uses these preferences to suggest people nearby.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    backButton: {
        padding: spacing.xs,
    },
    backButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    saveButton: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.primary,
    },
    disabledText: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
    },
    section: {
        marginBottom: spacing['2xl'],
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    valueText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    subLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    genderOption: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
    },
    genderOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10', // 10% opacity
    },
    genderText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    genderTextSelected: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    disclaimer: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
});
