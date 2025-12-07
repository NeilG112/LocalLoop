// MatchItem Component - Display a match in the list

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Match, User } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { Avatar, Badge } from './ui';

interface MatchItemProps {
    match: Match;
    otherUser: User;
    onPress: () => void;
}

export function MatchItem({ match, otherUser, onPress }: MatchItemProps) {
    // Format the time
    const formatTime = (date?: Date) => {
        if (!date) return '';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Avatar
                source={otherUser.photos[0]}
                name={otherUser.name}
                size="lg"
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {otherUser.name}
                    </Text>
                    <Badge
                        label={otherUser.role === 'host' ? '🏠' : '✈️'}
                        variant={otherUser.role as 'host' | 'visitor'}
                        size="sm"
                    />
                </View>

                <Text style={styles.location} numberOfLines={1}>
                    {otherUser.location.city}, {otherUser.location.country}
                </Text>

                {match.lastMessage ? (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {match.lastMessage}
                    </Text>
                ) : (
                    <Text style={styles.newMatch}>New match! Say hello 👋</Text>
                )}
            </View>

            <View style={styles.timeContainer}>
                <Text style={styles.time}>
                    {formatTime(match.lastMessageAt || match.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    content: {
        flex: 1,
        marginLeft: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 2,
    },
    name: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    location: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    lastMessage: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
    },
    newMatch: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    time: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },
});

export default MatchItem;
