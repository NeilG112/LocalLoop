// Auth Stack Layout

import { Stack } from 'expo-router';
import { colors } from '../../src/config/theme';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="role-select" />
            <Stack.Screen name="create-profile" />
        </Stack>
    );
}
