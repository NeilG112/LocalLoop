// Role Selection Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';
import { UserRole } from '../../src/types';

const { width } = Dimensions.get('window');

export default function RoleSelectScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ userId: string }>();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const handleContinue = () => {
        if (!selectedRole) return;

        router.push({
            pathname: '/(auth)/create-profile',
            params: {
                userId: params.userId,
                role: selectedRole
            },
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Who are you?</Text>
                <Text style={styles.subtitle}>
                    Choose your role to see the right profiles. You can switch anytime in settings.
                </Text>
            </View>

            {/* Role Options */}
            <View style={styles.options}>
                <TouchableOpacity
                    style={[
                        styles.option,
                        selectedRole === 'host' && styles.optionSelected,
                        selectedRole === 'host' && { borderColor: colors.host },
                    ]}
                    onPress={() => setSelectedRole('host')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.optionEmoji}>🏠</Text>
                    <Text style={[
                        styles.optionTitle,
                        selectedRole === 'host' && { color: colors.host },
                    ]}>
                        I'm a Host
                    </Text>
                    <Text style={styles.optionDescription}>
                        I'm a local who wants to meet travelers and share my city with them
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        selectedRole === 'visitor' && styles.optionSelected,
                        selectedRole === 'visitor' && { borderColor: colors.visitor },
                    ]}
                    onPress={() => setSelectedRole('visitor')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.optionEmoji}>✈️</Text>
                    <Text style={[
                        styles.optionTitle,
                        selectedRole === 'visitor' && { color: colors.visitor },
                    ]}>
                        I'm a Visitor
                    </Text>
                    <Text style={styles.optionDescription}>
                        I'm traveling and want to connect with locals to experience the real culture
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <View style={styles.footer}>
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedRole}
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['4xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    options: {
        flex: 1,
        gap: spacing.lg,
    },
    option: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        borderWidth: 3,
        borderColor: 'transparent',
        alignItems: 'center',
        ...shadows.md,
    },
    optionSelected: {
        borderWidth: 3,
    },
    optionEmoji: {
        fontSize: 48,
        marginBottom: spacing.base,
    },
    optionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    optionDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        paddingVertical: spacing['2xl'],
    },
    button: {
        width: '100%',
    },
});
