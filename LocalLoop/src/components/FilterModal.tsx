import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Button, Badge } from './ui';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { FeedFilters, GenderPreference } from '../types';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FeedFilters) => void;
    currentFilters: FeedFilters;
}

const LANGUAGES_LIST = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'];

export function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
    const [ageMin, setAgeMin] = useState(currentFilters.ageRange.min);
    const [ageMax, setAgeMax] = useState(currentFilters.ageRange.max);
    const [distance, setDistance] = useState(currentFilters.maxDistance);

    const [gender, setGender] = useState<GenderPreference>(currentFilters.gender);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(currentFilters.languages || []);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(currentFilters.interests || []);

    const INTERESTS_LIST = ['Art', 'Music', 'Food', 'Sports', 'Travel', 'History', 'Nature', 'Photography', 'Movies', 'Tech', 'Fashion', 'Nightlife'];

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setAgeMin(currentFilters.ageRange.min);
            setAgeMax(currentFilters.ageRange.max);
            setDistance(currentFilters.maxDistance);
            setGender(currentFilters.gender);
            setSelectedLanguages(currentFilters.languages || []);
            setSelectedInterests(currentFilters.interests || []);
        }
    }, [visible, currentFilters]);

    const handleApply = () => {
        onApply({
            ageRange: { min: ageMin, max: ageMax },
            maxDistance: distance,
            gender: gender,
            languages: selectedLanguages,
            interests: selectedInterests,
        });
        onClose();
    };

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev =>
            prev.includes(lang)
                ? prev.filter(l => l !== lang)
                : [...prev, lang]
        );
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
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
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Filters</Text>
                    <TouchableOpacity onPress={() => {
                        // Reset to defaults (could be passed as props or just standard defaults)
                        setAgeMin(18);
                        setAgeMax(50);
                        setDistance(100);
                        setGender('any');
                        setSelectedLanguages([]);
                        setSelectedInterests([]);
                    }}>
                        <Text style={styles.resetText}>Reset</Text>
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
                            maximumValue={200}
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

                        <View style={styles.sliderRow}>
                            <Text style={styles.sliderLabel}>Min</Text>
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
                        </View>

                        <View style={styles.sliderRow}>
                            <Text style={styles.sliderLabel}>Max</Text>
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
                    </View>

                    {/* Languages Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <Text style={styles.sectionSubtitle}>Show people who speak:</Text>
                        <View style={styles.tags}>
                            {LANGUAGES_LIST.map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    style={[
                                        styles.tag,
                                        selectedLanguages.includes(lang) && styles.tagSelected
                                    ]}
                                    onPress={() => toggleLanguage(lang)}
                                >
                                    <Text style={[
                                        styles.tagText,
                                        selectedLanguages.includes(lang) && styles.tagTextSelected
                                    ]}>
                                        {lang}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Interests Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Interests</Text>
                        <Text style={styles.sectionSubtitle}>Show people interested in:</Text>
                        <View style={styles.tags}>
                            {INTERESTS_LIST.map((interest) => (
                                <TouchableOpacity
                                    key={interest}
                                    style={[
                                        styles.tag,
                                        selectedInterests.includes(interest) && styles.tagSelected
                                    ]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    <Text style={[
                                        styles.tagText,
                                        selectedInterests.includes(interest) && styles.tagTextSelected
                                    ]}>
                                        {interest}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button title="Apply Filters" onPress={handleApply} size="lg" />
                </View>
            </SafeAreaView>
        </Modal>
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
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: spacing.xs,
    },
    closeButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    resetText: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
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
    sectionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    valueText: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: '600',
    },
    slider: {
        flex: 1,
        height: 40,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sliderLabel: {
        width: 30,
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    genderOption: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
    },
    genderOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
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
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tagText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    tagTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
    },
});
