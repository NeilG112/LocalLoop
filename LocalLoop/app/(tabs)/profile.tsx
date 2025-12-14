// Profile Screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Badge, Button } from '../../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => router.push('/edit-profile')}>
                    <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
            </View>

            {/* Photo Gallery */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.photoGallery}
            >
                {user.photos.length > 0 ? (
                    user.photos.map((photo, index) => (
                        <Image
                            key={index}
                            source={{ uri: photo }}
                            style={styles.photo}
                            resizeMode="cover"
                        />
                    ))
                ) : (
                    <View style={styles.noPhoto}>
                        <Text style={styles.noPhotoText}>{user.name[0]}</Text>
                        <Text style={styles.noPhotoHint}>Tap Edit to add photos</Text>
                    </View>
                )}
            </ScrollView>

            {/* Photo Indicators */}
            {user.photos.length > 1 && (
                <View style={styles.indicators}>
                    {user.photos.map((_, index) => (
                        <View key={index} style={styles.indicator} />
                    ))}
                </View>
            )}

            {/* Profile Info */}
            <View style={styles.info}>
                {/* Name & Role */}
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{user.name}, {user.age}</Text>
                    <Badge
                        label={user.role === 'host' ? '🏠 Host' : '✈️ Visitor'}
                        variant={user.role as 'host' | 'visitor'}
                    />
                </View>

                <Text style={styles.location}>
                    📍 {user.location.city}, {user.location.country}
                </Text>

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bio}>{user.bio || 'No bio yet'}</Text>
                </View>

                {/* Languages Spoken */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🗣️ Languages I Speak</Text>
                    <View style={styles.tags}>
                        {user.languagesSpoken.length > 0 ? (
                            user.languagesSpoken.map((lang, index) => (
                                <Badge key={index} label={`${lang.language} (${lang.level})`} variant="primary" />
                            ))
                        ) : (
                            <Text style={styles.empty}>No languages specified</Text>
                        )}
                    </View>
                </View>

                {/* Languages to Learn */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📚 Languages I Want to Learn</Text>
                    <View style={styles.tags}>
                        {user.languagesToLearn.length > 0 ? (
                            user.languagesToLearn.map((lang, index) => (
                                <Badge key={index} label={`${lang.language} (${lang.level})`} variant="secondary" />
                            ))
                        ) : (
                            <Text style={styles.empty}>No languages specified</Text>
                        )}
                    </View>
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>❤️ Interests</Text>
                    <View style={styles.tags}>
                        {user.interests.length > 0 ? (
                            user.interests.map((interest, index) => (
                                <Badge key={index} label={interest} variant="secondary" />
                            ))
                        ) : (
                            <Text style={styles.empty}>No interests specified</Text>
                        )}
                    </View>
                </View>

                {/* Preferences Preview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚙️ Preferences</Text>
                    <View style={styles.prefRow}>
                        <Text style={styles.prefLabel}>Looking for:</Text>
                        <Text style={styles.prefValue}>
                            {user.preferences.genderPreference === 'any' ? 'Anyone' : user.preferences.genderPreference}
                        </Text>
                    </View>
                    <View style={styles.prefRow}>
                        <Text style={styles.prefLabel}>Age range:</Text>
                        <Text style={styles.prefValue}>
                            {user.preferences.agePreference.min} - {user.preferences.agePreference.max}
                        </Text>
                    </View>
                    <View style={styles.prefRow}>
                        <Text style={styles.prefLabel}>Max distance:</Text>
                        <Text style={styles.prefValue}>
                            {user.preferences.radiusPreference}km
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
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
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    editButton: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: '600',
    },
    photoGallery: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.8,
    },
    photo: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.8,
    },
    noPhoto: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.8,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPhotoText: {
        fontSize: 80,
        color: colors.white,
        fontWeight: 'bold',
    },
    noPhotoHint: {
        fontSize: typography.fontSize.base,
        color: colors.white,
        opacity: 0.8,
        marginTop: spacing.sm,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        opacity: 0.5,
    },
    info: {
        padding: spacing.xl,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    location: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    bio: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    empty: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    prefRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    prefLabel: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    prefValue: {
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
        fontWeight: '500',
    },
});
