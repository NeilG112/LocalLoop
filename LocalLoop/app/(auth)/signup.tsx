// Signup Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../src/components/ui';
import { colors, typography, spacing } from '../../src/config/theme';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validate()) return;

        try {
            const userId = await signUp(email.trim(), password);
            // Navigate to role selection with userId
            router.replace({
                pathname: '/(auth)/role-select',
                params: { userId },
            });
        } catch (error: any) {
            Alert.alert(
                'Signup Failed',
                error.message || 'Please try again.'
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>👋</Text>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join the LocalLoop community today
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="your@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={email}
                        onChangeText={setEmail}
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        placeholder="Create a password"
                        secureTextEntry
                        autoComplete="password-new"
                        value={password}
                        onChangeText={setPassword}
                        error={errors.password}
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        secureTextEntry
                        autoComplete="password-new"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Create Account"
                        onPress={handleSignup}
                        loading={isLoading}
                        style={styles.button}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text style={styles.link}>Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing['2xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    logo: {
        fontSize: 64,
        marginBottom: spacing.base,
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
    },
    form: {
        marginBottom: spacing['2xl'],
    },
    button: {
        marginTop: spacing.base,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
    },
    footerText: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    link: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: '600',
    },
});
