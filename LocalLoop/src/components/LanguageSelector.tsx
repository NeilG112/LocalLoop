// Language Selector with Proficiency Levels Component

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { LanguageWithLevel, LanguageProficiency } from '../types';
import { Button } from './ui';

const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
    'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
    'Turkish', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian'
];

const PROFICIENCY_LEVELS: LanguageProficiency[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const PROFICIENCY_DESCRIPTIONS: Record<LanguageProficiency, string> = {
    'A1': 'Beginner',
    'A2': 'Elementary',
    'B1': 'Intermediate',
    'B2': 'Upper Intermediate',
    'C1': 'Advanced',
    'C2': 'Proficient/Native',
};

interface LanguageSelectorProps {
    selectedLanguages: LanguageWithLevel[];
    onLanguagesChange: (languages: LanguageWithLevel[]) => void;
    label: string;
    subtitle?: string;
}

export function LanguageSelector({
    selectedLanguages,
    onLanguagesChange,
    label,
    subtitle,
}: LanguageSelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<LanguageProficiency>('A1');

    const handleAddLanguage = () => {
        if (!selectedLanguage) return;

        const newLanguage: LanguageWithLevel = {
            language: selectedLanguage,
            level: selectedLevel,
        };

        onLanguagesChange([...selectedLanguages, newLanguage]);
        setModalVisible(false);
        setSelectedLanguage(null);
        setSelectedLevel('A1');
    };

    const handleRemoveLanguage = (index: number) => {
        onLanguagesChange(selectedLanguages.filter((_, i) => i !== index));
    };

    const availableLanguages = LANGUAGES.filter(
        lang => !selectedLanguages.some(sl => sl.language === lang)
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {/* Selected Languages */}
            <View style={styles.selectedContainer}>
                {selectedLanguages.map((lang, index) => (
                    <View key={index} style={styles.languageChip}>
                        <View style={styles.languageInfo}>
                            <Text style={styles.languageName}>{lang.language}</Text>
                            <Text style={styles.languageLevel}>{lang.level}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleRemoveLanguage(index)}
                            style={styles.removeButton}
                        >
                            <Text style={styles.removeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Add Button */}
                {availableLanguages.length > 0 && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+ Add Language</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Modal for adding language */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Language</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {/* Language Selection */}
                            <Text style={styles.sectionLabel}>Select Language</Text>
                            <View style={styles.languageGrid}>
                                {availableLanguages.map((lang) => (
                                    <TouchableOpacity
                                        key={lang}
                                        style={[
                                            styles.languageOption,
                                            selectedLanguage === lang && styles.languageOptionSelected,
                                        ]}
                                        onPress={() => setSelectedLanguage(lang)}
                                    >
                                        <Text
                                            style={[
                                                styles.languageOptionText,
                                                selectedLanguage === lang && styles.languageOptionTextSelected,
                                            ]}
                                        >
                                            {lang}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Proficiency Level Selection */}
                            {selectedLanguage && (
                                <>
                                    <Text style={styles.sectionLabel}>Proficiency Level</Text>
                                    <View style={styles.levelGrid}>
                                        {PROFICIENCY_LEVELS.map((level) => (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.levelOption,
                                                    selectedLevel === level && styles.levelOptionSelected,
                                                ]}
                                                onPress={() => setSelectedLevel(level)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.levelCode,
                                                        selectedLevel === level && styles.levelCodeSelected,
                                                    ]}
                                                >
                                                    {level}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.levelDescription,
                                                        selectedLevel === level && styles.levelDescriptionSelected,
                                                    ]}
                                                >
                                                    {PROFICIENCY_DESCRIPTIONS[level]}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                title="Add Language"
                                onPress={handleAddLanguage}
                                disabled={!selectedLanguage}
                            />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.base,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    selectedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    languageChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '10',
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    languageName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    languageLevel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.primary,
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    removeButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    addButton: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        backgroundColor: colors.backgroundSecondary,
    },
    addButtonText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
        ...shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    modalClose: {
        fontSize: typography.fontSize.xl,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    modalScroll: {
        padding: spacing.base,
    },
    sectionLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    languageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    languageOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    languageOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    languageOptionText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    languageOptionTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    levelGrid: {
        gap: spacing.sm,
    },
    levelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    levelOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    levelCode: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
        color: colors.textSecondary,
        minWidth: 40,
    },
    levelCodeSelected: {
        color: colors.primary,
    },
    levelDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    levelDescriptionSelected: {
        color: colors.primary,
        fontWeight: '500',
    },
    modalFooter: {
        padding: spacing.base,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
