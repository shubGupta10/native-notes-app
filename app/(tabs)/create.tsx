import { ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import AuthWrapper from '@/components/AuthWrapper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { saveNote } from '@/lib/appwrite'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import {appColors} from "@/lib/appColors";

const Create = () => {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user } = useAuthStore()
    const colorScheme = useColorScheme() as 'light' | 'dark'
    const colors = appColors[colorScheme || 'light']

    const handleSubmit = async () => {
        if (!title || !content) {
            alert("Title and content are required!");
            return;
        }

        setIsSubmitting(true);

        try {
            await saveNote({ title, category, content, userId: user?.$id as string });
            alert("Note saved successfully!");

            // Clear form
            setTitle('');
            setCategory('');
            setContent('');
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save the note.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthWrapper redirectToLogin={true}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary }}>Create Note</Text>
                            <TouchableOpacity
                                style={{ padding: 8, borderRadius: 9999, backgroundColor: colors.card }}
                                onPress={() => {/* Add navigation or dismiss action */}}
                            >
                                <Feather name="x" size={20} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ flex: 1 }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            <View style={{
                                marginBottom: 16,
                                padding: 16,
                                backgroundColor: colors.card,
                                borderRadius: 12,
                                shadowColor: colors.shadow.color,
                                shadowOpacity: colors.shadow.opacity,
                                shadowOffset: { width: 0, height: 2 },
                                shadowRadius: 4,
                                elevation: 2
                            }}>
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.secondary, marginBottom: 8 }}>Title</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            backgroundColor: colors.background,
                                            borderRadius: 12,
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            color: colors.text.primary
                                        }}
                                        placeholder="Enter note title"
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholderTextColor={colors.text.tertiary}
                                    />
                                </View>

                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.secondary, marginBottom: 8 }}>Category</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            backgroundColor: colors.background,
                                            borderRadius: 12,
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            color: colors.text.primary
                                        }}
                                        placeholder="E.g. Hooks, Navigation"
                                        value={category}
                                        onChangeText={setCategory}
                                        placeholderTextColor={colors.text.tertiary}
                                    />
                                </View>
                            </View>

                            <View style={{
                                marginBottom: 16,
                                padding: 16,
                                backgroundColor: colors.card,
                                borderRadius: 12,
                                shadowColor: colors.shadow.color,
                                shadowOpacity: colors.shadow.opacity,
                                shadowOffset: { width: 0, height: 2 },
                                shadowRadius: 4,
                                elevation: 2
                            }}>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.secondary, marginBottom: 16 }}>Content</Text>

                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        color: colors.text.primary,
                                        minHeight: 200
                                    }}
                                    placeholder="Write your note here..."
                                    value={content}
                                    onChangeText={setContent}
                                    placeholderTextColor={colors.text.tertiary}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={{ marginTop: 16, marginBottom: 24 }}>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 16,
                                        borderRadius: 12,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: isSubmitting ? colors.accent.secondary : colors.accent.primary,
                                        shadowColor: colors.shadow.color,
                                        shadowOpacity: colors.shadow.opacity,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowRadius: 4,
                                        elevation: 2
                                    }}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="save" size={20} color={colors.background} style={{ marginRight: 8 }} />
                                    <Text style={{ color: colors.background, textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                                        {isSubmitting ? 'Saving...' : 'Save Note'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AuthWrapper>
    )
}

export default Create