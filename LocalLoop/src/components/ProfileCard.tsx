// ProfileCard Component - Detailed profile view

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { User } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { Avatar, Badge } from './ui';
import { formatDistance } from '../utils/distance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileCardProps {
    user: User;
    distance?: number;
    isCurrentUser?: boolean;
}

export function ProfileCard({ user, distance, isCurrentUser = false }: ProfileCardProps) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{user.name}, {user.age}</Text>
                        <Badge
                            label={user.role === 'host' ? '🏠 Host' : '✈️ Visitor'}
                            variant={user.role as 'host' | 'visitor'}
                        />
                    </View>

                    <View style={styles.locationRow}>
                        <Text style={styles.location}>
                            📍 {user.location.city}, {user.location.country}
                        </Text>
                        {distance !== undefined && !isCurrentUser && (
                            <Text style={styles.distance}>• {formatDistance(distance)}</Text>
                        )}
                    </View>

                    {user.durationOfStay && (
                        <Text style={styles.duration}>🗓️ Staying for: {user.durationOfStay}</Text>
                    )}
                </View>

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

                {/* Languages to Learn - Host Only or if populated */}
                {(user.role === 'host' || (user.languagesToLearn && user.languagesToLearn.length > 0)) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📚 Languages to Learn</Text>
                        <View style={styles.tags}>
                            {user.languagesToLearn && user.languagesToLearn.length > 0 ? (
                                user.languagesToLearn.map((lang, index) => (
                                    <Badge key={index} label={`${lang.language} (${lang.level})`} variant="secondary" />
                                ))
                            ) : (
                                <Text style={styles.empty}>No languages specified</Text>
                            )}
                        </View>
                    </View>
                )}

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

                {/* Gender */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gender</Text>
                    <Badge
                        label={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                    />
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
    photoGallery: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
    },
    photo: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
    },
    noPhoto: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPhotoText: {
        fontSize: 100,
        color: colors.white,
        fontWeight: 'bold',
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
        padding: spacing.base,
    },
    header: {
        marginBottom: spacing.lg,
    },
    nameContainer: {
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
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    location: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    distance: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
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
    duration: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        marginTop: spacing.xs,
        fontWeight: '500',
    },
});

export default ProfileCard;
