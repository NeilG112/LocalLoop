// LocalLoop Design Theme
// Based on spec: Blue primary (#3C82F6), Green secondary (#38D39F)

export const colors = {
    // Primary colors
    primary: '#3C82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',

    // Secondary colors
    secondary: '#38D39F',
    secondaryLight: '#6EE7B7',
    secondaryDark: '#10B981',

    // Neutrals
    white: '#FFFFFF',
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    border: '#E2E8F0',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',

    // Swipe colors
    like: '#22C55E',
    dislike: '#EF4444',
    superlike: '#3B82F6',

    // Role colors
    host: '#8B5CF6',
    visitor: '#F97316',
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
    },
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
};
