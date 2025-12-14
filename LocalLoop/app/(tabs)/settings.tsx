// Settings Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';
import { UserRole } from '../../src/types';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, updateUserProfile, signOut, isLoading } = useAuth();

    const [savingRole, setSavingRole] = useState(false);

    const handleRoleSwitch = async () => {
        if (!user) return;

        const newRole: UserRole = user.role === 'host' ? 'visitor' : 'host';

        Alert.alert(
            'Switch Role',
            `Switch from ${user.role === 'host' ? 'Host' : 'Visitor'} to ${newRole === 'host' ? 'Host' : 'Visitor'}?\n\nYou'll see different profiles based on your role.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Switch',
                    onPress: async () => {
                        setSavingRole(true);
                        try {
                            await updateUserProfile({ role: newRole });
                            Alert.alert('Success', `You are now a ${newRole === 'host' ? 'Host' : 'Visitor'}!`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to switch role.');
                        } finally {
                            setSavingRole(false);
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement actual account deletion
                        Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
                    },
                },
            ]
        );
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* Role Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Role</Text>
                <View style={styles.roleCard}>
                    <View style={styles.roleInfo}>
                        <Text style={styles.roleEmoji}>
                            {user.role === 'host' ? '🏠' : '✈️'}
                        </Text>
                        <View>
                            <Text style={styles.roleTitle}>
                                {user.role === 'host' ? "You're a Host" : "You're a Visitor"}
                            </Text>
                            <Text style={styles.roleDescription}>
                                {user.role === 'host'
                                    ? 'You see travelers looking for locals'
                                    : 'You see locals ready to show you around'}
                            </Text>
                        </View>
                    </View>
                    <Button
                        title={`Switch to ${user.role === 'host' ? 'Visitor' : 'Host'}`}
                        variant="outline"
                        size="sm"
                        onPress={handleRoleSwitch}
                        loading={savingRole}
                    />
                </View>
            </View>

            {/* Discovery Settings Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Discovery Settings</Text>
                    <TouchableOpacity onPress={() => router.push('/edit-preferences')}>
                        <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/edit-preferences')}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Age Range</Text>
                        <Text style={styles.settingValue}>
                            {user.preferences.agePreference.min} - {user.preferences.agePreference.max}
                        </Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/edit-preferences')}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Show Me</Text>
                        <Text style={styles.settingValue}>
                            {user.preferences.genderPreference === 'any' ? 'Everyone' :
                                user.preferences.genderPreference.charAt(0).toUpperCase() + user.preferences.genderPreference.slice(1)}
                        </Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/edit-preferences')}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Maximum Distance</Text>
                        <Text style={styles.settingValue}>{user.preferences.radiusPreference}km</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile</Text>

                <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/edit-profile')}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Edit Profile</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Blocked Users</Text>
                        <Text style={styles.settingValue}>{user.blockedUsers?.length || 0} blocked</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
                    <Text style={styles.settingLabelDanger}>Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
                    <Text style={styles.settingLabelDanger}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>LocalLoop v1.0.0</Text>
                <Text style={styles.footerText}>Made with ❤️</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    section: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    editLink: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    roleCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        ...shadows.sm,
    },
    roleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.base,
    },
    roleEmoji: {
        fontSize: 40,
    },
    roleTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    roleDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
    },
    settingValue: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    settingArrow: {
        fontSize: typography.fontSize.xl,
        color: colors.textMuted,
    },
    settingLabelDanger: {
        fontSize: typography.fontSize.base,
        color: colors.error,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
});
