// Edit Profile Screen - Comprehensive profile editing

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/contexts/AuthContext';
import { LocationPicker } from '../src/components/LocationPicker';
import { LanguageSelector } from '../src/components/LanguageSelector';
import { Button, Input, Badge } from '../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../src/config/theme';
import { Gender, Location as UserLocation, LanguageWithLevel } from '../src/types';

const INTERESTS = ['Art', 'Music', 'Food', 'Sports', 'Travel', 'History', 'Nature', 'Photography', 'Movies', 'Tech', 'Fashion', 'Nightlife'];

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateUserProfile, isLoading } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [age, setAge] = useState(user?.age.toString() || '');
    const [gender, setGender] = useState<Gender | null>(user?.gender || null);
    const [bio, setBio] = useState(user?.bio || '');
    const [photos, setPhotos] = useState<string[]>(user?.photos || []);
    const [languagesSpoken, setLanguagesSpoken] = useState<LanguageWithLevel[]>(user?.languagesSpoken || []);
    const [languagesToLearn, setLanguagesToLearn] = useState<LanguageWithLevel[]>(user?.languagesToLearn || []);
    const [interests, setInterests] = useState<string[]>(user?.interests || []);
    const [location, setLocation] = useState<UserLocation | null>(user?.location || null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setAge(user.age.toString());
            setGender(user.gender);
            setBio(user.bio);
            setPhotos(user.photos);
            setLanguagesSpoken(user.languagesSpoken);
            setLanguagesToLearn(user.languagesToLearn);
            setInterests(user.interests);
            setLocation(user.location);
        }
    }, [user]);

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

    const handleSave = async () => {
        if (!name.trim() || !age || !gender || !location) {
            Alert.alert('Missing Information', 'Please fill in all required fields.');
            return;
        }

        if (photos.length === 0) {
            Alert.alert('Missing Photos', 'Please add at least one photo.');
            return;
        }

        setSaving(true);
        try {
            await updateUserProfile({
                name: name.trim(),
                age: parseInt(age, 10),
                gender,
                bio: bio.trim(),
                photos,
                languagesSpoken,
                languagesToLearn,
                interests,
                location,
            });

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
                        {saving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.photosRow}>
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
                    </ScrollView>
                </View>

                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Info</Text>
                    <Input
                        label="Name"
                        placeholder="Your name"
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

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About You</Text>
                    <Input
                        label="Bio"
                        placeholder="Tell others about yourself..."
                        multiline
                        numberOfLines={5}
                        style={styles.bioInput}
                        value={bio}
                        onChangeText={setBio}
                    />
                    <Text style={styles.charCount}>{bio.length}/500</Text>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    {!showLocationPicker && location ? (
                        <View style={styles.locationDisplay}>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationCity}>{location.city}</Text>
                                <Text style={styles.locationCountry}>{location.country}</Text>
                            </View>
                            <Button
                                title="Change"
                                variant="outline"
                                size="sm"
                                onPress={() => setShowLocationPicker(true)}
                            />
                        </View>
                    ) : (
                        <LocationPicker
                            onLocationSelected={(loc) => {
                                setLocation(loc);
                                setShowLocationPicker(false);
                            }}
                            initialLocation={location || undefined}
                        />
                    )}
                </View>

                {/* Languages Spoken */}
                <View style={styles.section}>
                    <LanguageSelector
                        selectedLanguages={languagesSpoken}
                        onLanguagesChange={setLanguagesSpoken}
                        label="Languages You Speak"
                        subtitle="Add languages you speak with proficiency levels"
                    />
                </View>

                {/* Languages to Learn */}
                <View style={styles.section}>
                    <LanguageSelector
                        selectedLanguages={languagesToLearn}
                        onLanguagesChange={setLanguagesToLearn}
                        label="Languages to Learn"
                        subtitle="Add languages you want to learn with target levels"
                    />
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests</Text>
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing['3xl'],
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    cancelButton: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    saveButton: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: '600',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.base,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    photosRow: {
        flexDirection: 'row',
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
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    genderOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.base,
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
        height: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        color: colors.textMuted,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
    },
    locationDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        padding: spacing.base,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    locationInfo: {
        flex: 1,
    },
    locationCity: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    locationCountry: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
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
});
