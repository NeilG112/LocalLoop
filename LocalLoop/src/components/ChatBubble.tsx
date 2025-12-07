// ChatBubble Component - Message bubble for chat

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { colors, typography, spacing, borderRadius } from '../config/theme';

interface ChatBubbleProps {
    message: Message;
    isOwnMessage: boolean;
}

export function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <View style={[
            styles.container,
            isOwnMessage ? styles.containerOwn : styles.containerOther
        ]}>
            <View style={[
                styles.bubble,
                isOwnMessage ? styles.bubbleOwn : styles.bubbleOther
            ]}>
                <Text style={[
                    styles.text,
                    isOwnMessage ? styles.textOwn : styles.textOther
                ]}>
                    {message.text}
                </Text>
            </View>
            <Text style={[
                styles.time,
                isOwnMessage ? styles.timeOwn : styles.timeOther
            ]}>
                {formatTime(message.createdAt)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        maxWidth: '80%',
        marginBottom: spacing.sm,
    },
    containerOwn: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    containerOther: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    bubble: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
    },
    bubbleOwn: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: spacing.xs,
    },
    bubbleOther: {
        backgroundColor: colors.backgroundSecondary,
        borderBottomLeftRadius: spacing.xs,
    },
    text: {
        fontSize: typography.fontSize.base,
        lineHeight: 22,
    },
    textOwn: {
        color: colors.white,
    },
    textOther: {
        color: colors.textPrimary,
    },
    time: {
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
    },
    timeOwn: {
        color: colors.textMuted,
    },
    timeOther: {
        color: colors.textMuted,
    },
});

export default ChatBubble;
