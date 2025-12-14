// SwipeCard Component - Tinder-style swipeable profile card

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';
import { User } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { Badge } from './ui';
import { formatDistance } from '../utils/distance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing['2xl'] * 2;

interface SwipeCardProps {
    user: User;
    distance?: number;
    hasLikedYou?: boolean;
}

export function SwipeCard({ user, distance, hasLikedYou }: SwipeCardProps) {
    const mainPhoto = user.photos[0];

    return (
        <View style={styles.container}>
            {/* Main Photo */}
            <View style={styles.photoContainer}>
                {mainPhoto ? (
                    <Image
                        source={{ uri: mainPhoto }}
                        style={styles.photo}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.noPhoto}>
                        <Text style={styles.noPhotoText}>{user.name[0]}</Text>
                    </View>
                )}

                {/* Gradient Overlay */}
                <View style={styles.gradient} />

                {/* Liked You Badge */}
                {hasLikedYou && (
                    <View style={styles.likedBadge}>
                        <Text style={styles.likedBadgeText}>💚 Liked you!</Text>
                    </View>
                )}

                {/* Basic Info */}
                <View style={styles.infoOverlay}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{user.name}, {user.age}</Text>
                        <Badge
                            label={user.role === 'host' ? '🏠 Host' : '✈️ Visitor'}
                            variant={user.role as 'host' | 'visitor'}
                            size="sm"
                        />
                    </View>

                    {distance !== undefined && (
                        <Text style={styles.distance}>{formatDistance(distance)}</Text>
                    )}

                    <Text style={styles.location}>
                        📍 {user.location.city}, {user.location.country}
                    </Text>
                </View>
            </View>

            {/* Details */}
            <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
                {/* Bio */}
                <Text style={styles.bio}>{user.bio}</Text>

                {/* Languages Spoken */}
                {user.languagesSpoken.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🗣️ Speaks</Text>
                        <View style={styles.tags}>
                            {user.languagesSpoken.map((lang, index) => (
                                <Badge key={index} label={`${lang.language} (${lang.level})`} variant="primary" size="sm" />
                            ))}
                        </View>
                    </View>
                )}

                {/* Languages to Learn */}
                {user.languagesToLearn.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📚 Learning</Text>
                        <View style={styles.tags}>
                            {user.languagesToLearn.map((lang, index) => (
                                <Badge key={index} label={`${lang.language} (${lang.level})`} variant="secondary" size="sm" />
                            ))}
                        </View>
                    </View>
                )}

                {/* Interests */}
                {user.interests.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>❤️ Interests</Text>
                        <View style={styles.tags}>
                            {user.interests.map((interest, index) => (
                                <Badge key={index} label={interest} variant="secondary" size="sm" />
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: colors.white,
        borderRadius: borderRadius['2xl'],
        overflow: 'hidden',
        ...shadows.card,
    },
    photoContainer: {
        width: '100%',
        height: CARD_WIDTH * 1.1,
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    noPhoto: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPhotoText: {
        fontSize: 80,
        color: colors.white,
        fontWeight: 'bold',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    likedBadge: {
        position: 'absolute',
        top: spacing.base,
        right: spacing.base,
        backgroundColor: colors.like + 'ee',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    likedBadgeText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: typography.fontSize.sm,
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.base,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.white,
    },
    distance: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    location: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        opacity: 0.9,
    },
    details: {
        padding: spacing.base,
        maxHeight: 180,
    },
    bio: {
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
        lineHeight: 22,
        marginBottom: spacing.base,
    },
    section: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
});

export default SwipeCard;
