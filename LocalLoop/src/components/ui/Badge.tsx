// Badge Component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../config/theme';

interface BadgeProps {
    label: string;
    variant?: 'default' | 'primary' | 'secondary' | 'host' | 'visitor' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

export function Badge({
    label,
    variant = 'default',
    size = 'md',
    style
}: BadgeProps) {
    return (
        <View style={[styles.container, styles[variant], styles[`size_${size}`], style]}>
            <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        borderRadius: borderRadius.full,
    },

    // Sizes
    size_sm: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    size_md: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    // Variants
    default: {
        backgroundColor: colors.backgroundSecondary,
    },
    primary: {
        backgroundColor: colors.primaryLight + '30',
    },
    secondary: {
        backgroundColor: colors.secondaryLight + '30',
    },
    host: {
        backgroundColor: colors.host + '20',
    },
    visitor: {
        backgroundColor: colors.visitor + '20',
    },
    success: {
        backgroundColor: colors.success + '20',
    },
    warning: {
        backgroundColor: colors.warning + '20',
    },
    error: {
        backgroundColor: colors.error + '20',
    },

    // Text
    text: {
        fontWeight: '600',
    },
    text_default: {
        color: colors.textSecondary,
    },
    text_primary: {
        color: colors.primary,
    },
    text_secondary: {
        color: colors.secondary,
    },
    text_host: {
        color: colors.host,
    },
    text_visitor: {
        color: colors.visitor,
    },
    text_success: {
        color: colors.success,
    },
    text_warning: {
        color: colors.warning,
    },
    text_error: {
        color: colors.error,
    },

    // Text sizes
    textSize_sm: {
        fontSize: typography.fontSize.xs,
    },
    textSize_md: {
        fontSize: typography.fontSize.sm,
    },
});

export default Badge;
