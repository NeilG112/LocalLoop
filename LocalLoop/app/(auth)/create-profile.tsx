// Create Profile Screen - Multi-step profile creation

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { LocationPicker } from '../../src/components/LocationPicker';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { Button, Input, Badge } from '../../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';
import { Gender, UserRole, CreateUserData, Location as UserLocation, LanguageWithLevel } from '../../src/types';

const INTERESTS = ['Art', 'Music', 'Food', 'Sports', 'Travel', 'History', 'Nature', 'Photography', 'Movies', 'Tech', 'Fashion', 'Nightlife'];

export default function CreateProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ userId: string; role: UserRole }>();
    const { createUserProfile, firebaseUser, isLoading } = useAuth();

    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender | null>(null);
    const [bio, setBio] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [languagesSpoken, setLanguagesSpoken] = useState<LanguageWithLevel[]>([]);
    const [languagesToLearn, setLanguagesToLearn] = useState<LanguageWithLevel[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [durationOfStay, setDurationOfStay] = useState('');

    const isHost = params.role === 'host';

    const toggleInterest = (interest: string) => {
        setInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotos(prev => [...prev, result.assets[0].uri]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleComplete = async () => {
        const userId = params.userId || firebaseUser?.uid;
        if (!userId || !gender || !location) {
            Alert.alert('Missing Information', 'Please complete all required fields including location.');
            return;
        }

        try {
            const profileData: CreateUserData = {
                email: firebaseUser?.email || '',
                name: name.trim(),
                age: parseInt(age, 10),
                gender,
                bio: bio.trim(),
                languagesSpoken,
                languagesToLearn: isHost ? languagesToLearn : [],
                interests,
                photos, // In production, these would be uploaded to Firebase Storage first
                role: params.role || 'visitor',
                location,
                durationOfStay: !isHost ? durationOfStay : undefined,
                preferences: {
                    radiusPreference: 50,
                    genderPreference: 'any',
                    agePreference: { min: 18, max: 60 },
                },
            };

            await createUserProfile(userId, profileData);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create profile.');
        }
    };

    const canContinue = () => {
        switch (step) {
            case 1: return name.trim().length >= 2 && age && parseInt(age, 10) >= 18 && gender;
            case 2: return bio.trim().length >= 10;
            case 3: return photos.length >= 1;
            case 4: return languagesSpoken.length >= 1;
            case 5: return isHost ? languagesToLearn.length >= 1 : durationOfStay.length >= 2;
            case 6: return interests.length >= 1;
            case 7: return location !== null;
            default: return false;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Basic Info</Text>
                        <Input
                            label="Your Name"
                            placeholder="What should we call you?"
                            value={name}
                            onChangeText={setName}
                        />
                        <Input
                            label="Age"
                            placeholder="Your age"
                            keyboardType="number-pad"
                            value={age}
                            onChangeText={setAge}
                        />
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderOptions}>
                            {(['male', 'female', 'other'] as Gender[]).map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.genderOption, gender === g && styles.genderSelected]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>About You</Text>
                        <Text style={styles.stepSubtitle}>
                            Write a short bio to introduce yourself
                        </Text>
                        <Input
                            label="Bio"
                            placeholder="Tell others about yourself, what you enjoy, and what you're looking for..."
                            multiline
                            numberOfLines={5}
                            style={styles.bioInput}
                            value={bio}
                            onChangeText={setBio}
                        />
                        <Text style={styles.charCount}>{bio.length}/500</Text>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Add Photos</Text>
                        <Text style={styles.stepSubtitle}>
                            Add at least one photo
                        </Text>
                        <View style={styles.photosGrid}>
                            {photos.map((photo, index) => (
                                <View key={index} style={styles.photoContainer}>
                                    <Image source={{ uri: photo }} style={styles.photo} />
                                    <TouchableOpacity
                                        style={styles.removePhoto}
                                        onPress={() => removePhoto(index)}
                                    >
                                        <Text style={styles.removePhotoText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {photos.length < 6 && (
                                <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                                    <Text style={styles.addPhotoText}>+</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Languages You Speak</Text>
                        <Text style={styles.stepSubtitle}>
                            Add languages you speak and your proficiency level
                        </Text>
                        <LanguageSelector
                            selectedLanguages={languagesSpoken}
                            onLanguagesChange={setLanguagesSpoken}
                            label="Languages Spoken"
                            subtitle="Select at least one language"
                        />
                    </View>
                );

            case 5:
                if (isHost) {
                    return (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Languages to Learn</Text>
                            <Text style={styles.stepSubtitle}>
                                Add languages you want to learn and your target level
                            </Text>
                            <LanguageSelector
                                selectedLanguages={languagesToLearn}
                                onLanguagesChange={setLanguagesToLearn}
                                label="Languages to Learn"
                                subtitle="Select at least one language"
                            />
                        </View>
                    );
                } else {
                    return (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>How long are you staying?</Text>
                            <Text style={styles.stepSubtitle}>
                                Let locals know how long you'll be around
                            </Text>
                            <Input
                                label="Duration of Stay"
                                placeholder="e.g. 2 weeks, 3 days, Just visiting..."
                                value={durationOfStay}
                                onChangeText={setDurationOfStay}
                            />
                        </View>
                    );
                }

            case 6:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Interests</Text>
                        <Text style={styles.stepSubtitle}>
                            What are you into?
                        </Text>
                        <View style={styles.tags}>
                            {INTERESTS.map((interest) => (
                                <TouchableOpacity
                                    key={interest}
                                    style={[styles.tag, interests.includes(interest) && styles.tagSelected]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    <Text style={[styles.tagText, interests.includes(interest) && styles.tagTextSelected]}>
                                        {interest}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 7:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Your Location</Text>
                        <Text style={styles.stepSubtitle}>
                            We'll use this to show you people nearby
                        </Text>
                        <LocationPicker
                            onLocationSelected={setLocation}
                            initialLocation={location || undefined}
                        />
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <View
                        key={s}
                        style={[styles.progressStep, s <= step && styles.progressStepActive]}
                    />
                ))}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {renderStep()}
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
                {step > 1 && (
                    <Button
                        title="Back"
                        variant="outline"
                        onPress={() => setStep(step - 1)}
                        style={styles.navButton}
                    />
                )}
                {step < 7 ? (
                    <Button
                        title="Continue"
                        onPress={() => setStep(step + 1)}
                        disabled={!canContinue()}
                        style={step === 1 ? [styles.navButton, styles.navButtonFull] : styles.navButton}
                    />
                ) : (
                    <Button
                        title="Complete Profile"
                        onPress={handleComplete}
                        loading={isLoading}
                        disabled={!canContinue()}
                        style={styles.navButton}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing.base,
    },
    progressStep: {
        flex: 1,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
    },
    progressStepActive: {
        backgroundColor: colors.primary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['2xl'],
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    stepSubtitle: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    genderOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    genderOption: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
    },
    genderSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    genderText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    genderTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    bioInput: {
        height: 150,
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        color: colors.textMuted,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    photoContainer: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    removePhoto: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removePhotoText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    addPhoto: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    addPhotoText: {
        fontSize: 32,
        color: colors.textMuted,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tag: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    tagSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    tagText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    tagTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    navigation: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
    },
    navButton: {
        flex: 1,
    },
    navButtonFull: {
        flex: 1,
    },
});
