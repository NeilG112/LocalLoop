// Matches Screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMatches } from '../../src/hooks/useFirestore';
import { MatchItem } from '../../src/components/MatchItem';
import { colors, typography, spacing } from '../../src/config/theme';

export default function MatchesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { matches, matchedUsers, loading } = useMatches(user?.id);

    const handleMatchPress = (matchId: string) => {
        router.push(`/chat/${matchId}`);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (matches.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Matches</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyEmoji}>💬</Text>
                    <Text style={styles.emptyTitle}>No matches yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Keep swiping to find your first match!
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Matches</Text>
                <Text style={styles.headerCount}>{matches.length} connections</Text>
            </View>

            <FlatList
                data={matches}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const otherUserId = item.users.find(id => id !== user?.id);
                    const otherUser = otherUserId ? matchedUsers.get(otherUserId) : null;

                    if (!otherUser) return null;

                    return (
                        <MatchItem
                            match={item}
                            otherUser={otherUser}
                            onPress={() => handleMatchPress(item.id)}
                        />
                    );
                }}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
        padding: spacing.xl,
    },
    header: {
        paddingTop: spacing['3xl'],
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.base,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    headerCount: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    list: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: spacing.base,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
