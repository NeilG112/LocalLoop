// Home/Discover Screen - Swipe View

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    PanResponder,
    Alert,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useSwipeablUsers, useSwipes } from '../../src/hooks/useFirestore';
import { SwipeCard } from '../../src/components/SwipeCard';
import { calculateDistance } from '../../src/utils/distance';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';
import { User, FeedFilters } from '../../src/types';
import { FilterModal } from '../../src/components/FilterModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function HomeScreen() {
    const { user } = useAuth();
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FeedFilters | undefined>(undefined);

    // Initial load of filters from user preferences
    React.useEffect(() => {
        if (user && !activeFilters) {
            setActiveFilters({
                ageRange: user.preferences?.agePreference || { min: 18, max: 99 },
                maxDistance: user.preferences?.radiusPreference || 50,
                gender: user.preferences?.genderPreference || 'any',
                languages: [],
            });
        }
    }, [user]);

    const { users, loading, refetch } = useSwipeablUsers(user, activeFilters);
    const { recordSwipe, checkIfLikedBy, loading: swipeLoading } = useSwipes(user?.id);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedByMap, setLikedByMap] = useState<Record<string, boolean>>({});
    const position = useRef(new Animated.ValueXY()).current;

    const currentUser = users[currentIndex];

    // Check if current user has liked you
    React.useEffect(() => {
        const checkLikes = async () => {
            if (!currentUser || likedByMap[currentUser.id] !== undefined) return;
            const hasLiked = await checkIfLikedBy(currentUser.id);
            setLikedByMap(prev => ({ ...prev, [currentUser.id]: hasLiked }));
        };
        checkLikes();
    }, [currentUser?.id]);

    const handleApplyFilters = (filters: FeedFilters) => {
        setActiveFilters(filters);
        setCurrentIndex(0); // Reset stack when filters change
        // Users will be refetched automatically due to hook dependency on activeFilters
    };

    // ... (panResponder, gesture handlers remain same)

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    swipeRight();
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    swipeLeft();
                } else {
                    resetPosition();
                }
            },
        })
    ).current;

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    const swipeOut = (direction: 'left' | 'right') => {
        const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const swipeRight = async () => {
        if (!currentUser || swipeLoading) return;

        try {
            swipeOut('right');
            const result = await recordSwipe(currentUser.id, 'like');

            // Wait for animation to complete before advancing
            setTimeout(() => {
                position.setValue({ x: 0, y: 0 });
                setCurrentIndex(prev => prev + 1);
            }, 250);

            if (result.matched) {
                // TODO: Show match animation
                console.log('Match created!', result.matchId);
                Alert.alert('🎉 It\'s a Match!', 'You both liked each other!');
            }
        } catch (error) {
            console.error('Error recording swipe:', error);
            Alert.alert('Error', 'Failed to record swipe. Please try again.');
            resetPosition();
        }
    };

    const swipeLeft = async () => {
        if (!currentUser || swipeLoading) return;

        try {
            swipeOut('left');
            await recordSwipe(currentUser.id, 'dislike');

            // Wait for animation to complete before advancing
            setTimeout(() => {
                position.setValue({ x: 0, y: 0 });
                setCurrentIndex(prev => prev + 1);
            }, 250);
        } catch (error) {
            console.error('Error recording swipe:', error);
            Alert.alert('Error', 'Failed to record swipe. Please try again.');
            resetPosition();
        }
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-20deg', '0deg', '20deg'],
        });

        return {
            transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
            ],
        };
    };

    const getLikeOpacity = () => {
        return position.x.interpolate({
            inputRange: [0, SWIPE_THRESHOLD],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });
    };

    const getDislikeOpacity = () => {
        return position.x.interpolate({
            inputRange: [-SWIPE_THRESHOLD, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Finding people near you...</Text>
            </View>
        );
    }

    // Moved check below to render FilterModal even if empty for "Adjust filters" scenario
    const showEmptyState = !currentUser || currentIndex >= users.length;

    const distance = user?.location && currentUser?.location
        ? calculateDistance(user.location.coordinates, currentUser.location.coordinates)
        : undefined;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeftPlaceholder} />
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>LocalLoop</Text>
                    <Text style={styles.headerSubtitle}>
                        {user?.role === 'host' ? '🏠 Host Mode' : '✈️ Visitor Mode'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Text style={styles.filterButtonText}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            {activeFilters && (
                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    onApply={handleApplyFilters}
                    currentFilters={activeFilters}
                />
            )}

            {showEmptyState ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyEmoji}>🔍</Text>
                    <Text style={styles.emptyTitle}>No more profiles</Text>
                    <Text style={styles.emptySubtitle}>
                        Check back later or adjust your filters
                    </Text>
                    <View style={styles.emptyActions}>
                        <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.refreshButton, styles.filterActionButton]}
                            onPress={() => setFilterModalVisible(true)}
                        >
                            <Text style={styles.refreshButtonText}>Adjust Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    {/* Card Stack */}
                    <View style={styles.cardContainer}>
                        {/* Next card preview */}
                        {users[currentIndex + 1] && (
                            <View style={styles.nextCard}>
                                <SwipeCard user={users[currentIndex + 1]} />
                            </View>
                        )}

                        {/* Current card */}
                        <Animated.View
                            style={[styles.card, getCardStyle()]}
                            {...panResponder.panHandlers}
                        >
                            <SwipeCard
                                user={currentUser}
                                distance={distance} // using calculated distance from closure
                                hasLikedYou={likedByMap[currentUser.id]}
                            />

                            {/* Like/Dislike indicators */}
                            <Animated.View style={[styles.likeLabel, { opacity: getLikeOpacity() }]}>
                                <Text style={styles.likeLabelText}>LIKE</Text>
                            </Animated.View>
                            <Animated.View style={[styles.dislikeLabel, { opacity: getDislikeOpacity() }]}>
                                <Text style={styles.dislikeLabelText}>NOPE</Text>
                            </Animated.View>
                        </Animated.View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.dislikeButton]}
                            onPress={swipeLeft}
                            disabled={swipeLoading}
                        >
                            <Text style={styles.actionButtonText}>✕</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.likeButton]}
                            onPress={swipeRight}
                            disabled={swipeLoading}
                        >
                            <Text style={styles.actionButtonText}>♥</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
        backgroundColor: colors.background,
        padding: spacing.xl,
    },
    header: {
        paddingTop: spacing['3xl'],
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.base,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.primary,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        position: 'absolute',
    },
    nextCard: {
        transform: [{ scale: 0.95 }],
        opacity: 0.8,
    },
    likeLabel: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: spacing.md,
        borderWidth: 4,
        borderColor: colors.like,
        borderRadius: borderRadius.md,
        transform: [{ rotate: '-20deg' }],
    },
    likeLabelText: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.like,
    },
    dislikeLabel: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: spacing.md,
        borderWidth: 4,
        borderColor: colors.dislike,
        borderRadius: borderRadius.md,
        transform: [{ rotate: '20deg' }],
    },
    dislikeLabelText: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.dislike,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing['3xl'],
        paddingVertical: spacing.xl,
        paddingBottom: spacing['2xl'],
    },
    actionButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
    },
    dislikeButton: {
        backgroundColor: colors.white,
    },
    likeButton: {
        backgroundColor: colors.like,
    },
    actionButtonText: {
        fontSize: 28,
    },
    loadingText: {
        marginTop: spacing.base,
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
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
        marginBottom: spacing.xl,
    },
    refreshButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
    },
    refreshButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: typography.fontSize.base,
    },
    headerLeftPlaceholder: {
        width: 44,
    },
    headerCenter: {
        alignItems: 'center',
    },
    filterButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        ...shadows.sm,
    },
    filterButtonText: {
        fontSize: 24,
    },
    emptyActions: {
        gap: spacing.md,
        alignItems: 'center',
    },
    filterActionButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
});
