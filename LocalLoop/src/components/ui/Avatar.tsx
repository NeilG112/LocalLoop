// Avatar Component

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors } from '../../config/theme';

interface AvatarProps {
    source?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    style?: ViewStyle;
}

const SIZES = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
};

const FONT_SIZES = {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 36,
};

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
    const dimension = SIZES[size];
    const fontSize = FONT_SIZES[size];

    const sizeStyle = {
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2
    };

    if (source) {
        return (
            <Image
                source={{ uri: source }}
                style={[styles.image, sizeStyle]}
                resizeMode="cover"
            />
        );
    }

    // Fallback to initials
    const initials = name
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    return (
        <View style={[styles.placeholder, sizeStyle, style]}>
            <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        overflow: 'hidden',
        backgroundColor: colors.backgroundSecondary,
    },
    placeholder: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    initials: {
        color: colors.white,
        fontWeight: '600',
    },
});

export default Avatar;
