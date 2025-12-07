// Chat Screen

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMessages, useUserProfile } from '../../src/hooks/useFirestore';
import { ChatBubble } from '../../src/components/ChatBubble';
import { Avatar } from '../../src/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/config/theme';
import { Message } from '../../src/types';

export default function ChatScreen() {
    const { matchId } = useLocalSearchParams<{ matchId: string }>();
    const { user } = useAuth();
    const { messages, loading, sendMessage } = useMessages(matchId);

    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Get the other user's ID from messages or match
    const otherUserId = messages.length > 0
        ? messages.find(m => m.senderId !== user?.id)?.senderId
        : undefined;
    const { user: otherUser } = useUserProfile(otherUserId);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSend = async () => {
        if (!inputText.trim() || !user?.id || !matchId) return;

        const text = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            await sendMessage(text, user.id);
        } catch (error) {
            console.error('Failed to send message:', error);
            setInputText(text); // Restore the text if sending failed
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <ChatBubble
            message={item}
            isOwnMessage={item.senderId === user?.id}
        />
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: () => (
                        <View style={styles.headerTitle}>
                            <Avatar
                                source={otherUser?.photos[0]}
                                name={otherUser?.name}
                                size="sm"
                            />
                            <Text style={styles.headerName}>{otherUser?.name || 'Chat'}</Text>
                        </View>
                    ),
                    headerTintColor: colors.primary,
                }}
            />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>👋</Text>
                        <Text style={styles.emptyTitle}>Start the conversation!</Text>
                        <Text style={styles.emptySubtitle}>
                            Say hello to {otherUser?.name || 'your new match'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || sending) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                    >
                        <Text style={styles.sendButtonText}>
                            {sending ? '...' : '➤'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
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
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerName: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    messagesList: {
        padding: spacing.base,
        paddingBottom: spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.base,
        paddingBottom: spacing.lg,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.border,
    },
    sendButtonText: {
        fontSize: 18,
        color: colors.white,
    },
});
