import { ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, useColorScheme, Modal, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import AuthWrapper from '@/components/AuthWrapper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { saveNote } from '@/lib/appwrite'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { appColors } from "@/lib/appColors";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Create = () => {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
    const [newCategory, setNewCategory] = useState('')
    const [userCategories, setUserCategories] = useState<string[]>([])
    const { user } = useAuthStore()
    const colorScheme = useColorScheme() as 'light' | 'dark'
    const colors = appColors[colorScheme || 'light']

    // Default predefined categories
    const defaultCategories = [
        "Personal",
        "Work",
        "Health",
        "Shopping",
        "Ideas"
    ]

    // Load user categories from storage on component mount
    useEffect(() => {
        const loadUserCategories = async () => {
            try {
                const storedCategories = await AsyncStorage.getItem('userCategories');
                if (storedCategories) {
                    setUserCategories(JSON.parse(storedCategories));
                }
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };

        loadUserCategories();
    }, []);

    // Combined categories (default + user created)
    const allCategories = [...defaultCategories, ...userCategories];

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            alert('Please enter a category name');
            return;
        }

        // Check if category already exists
        if (allCategories.includes(newCategory.trim())) {
            alert('This category already exists');
            return;
        }

        const updatedCategories = [...userCategories, newCategory.trim()];

        try {
            // Save to AsyncStorage
            await AsyncStorage.setItem('userCategories', JSON.stringify(updatedCategories));
            setUserCategories(updatedCategories);
            setNewCategory('');
            setShowAddCategoryModal(false);
            // Automatically select the newly created category
            setCategory(newCategory.trim());
        } catch (error) {
            console.error('Failed to save category', error);
            alert('Failed to add category');
        }
    };

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
                                    <TouchableOpacity
                                        style={{
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            backgroundColor: colors.background,
                                            borderRadius: 12,
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onPress={() => setShowCategoryModal(true)}
                                    >
                                        <Text style={{ color: category ? colors.text.primary : colors.text.tertiary }}>
                                            {category || "Select a category"}
                                        </Text>
                                        <Feather name="chevron-down" size={18} color={colors.text.secondary} />
                                    </TouchableOpacity>
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

                {/* Category Selection Modal */}
                <Modal
                    visible={showCategoryModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowCategoryModal(false)}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}>
                        <View style={{
                            backgroundColor: colors.background,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            paddingVertical: 20,
                            maxHeight: '70%'
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingHorizontal: 20,
                                marginBottom: 12,
                                alignItems: 'center'
                            }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                                    Select Category
                                </Text>
                                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                    <Feather name="x" size={24} color={colors.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={allCategories}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            paddingVertical: 14,
                                            paddingHorizontal: 20,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border,
                                            backgroundColor: category === item ? colors.accent.secondary + '20' : 'transparent'
                                        }}
                                        onPress={() => {
                                            setCategory(item);
                                            setShowCategoryModal(false);
                                        }}
                                    >
                                        <Text style={{
                                            color: category === item ? colors.accent.primary : colors.text.primary,
                                            fontWeight: category === item ? '600' : 'normal'
                                        }}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                ListFooterComponent={
                                    <TouchableOpacity
                                        style={{
                                            paddingVertical: 14,
                                            paddingHorizontal: 20,
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}
                                        onPress={() => {
                                            setShowCategoryModal(false);
                                            setShowAddCategoryModal(true);
                                        }}
                                    >
                                        <Feather name="plus-circle" size={18} color={colors.accent.primary} style={{ marginRight: 10 }} />
                                        <Text style={{ color: colors.accent.primary, fontWeight: '600' }}>
                                            Create New Category
                                        </Text>
                                    </TouchableOpacity>
                                }
                            />

                            <TouchableOpacity
                                style={{
                                    margin: 20,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    backgroundColor: colors.accent.primary,
                                    alignItems: 'center'
                                }}
                                onPress={() => setShowCategoryModal(false)}
                            >
                                <Text style={{ color: colors.background, fontWeight: '600' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Add New Category Modal */}
                <Modal
                    visible={showAddCategoryModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowAddCategoryModal(false)}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}>
                        <View style={{
                            backgroundColor: colors.background,
                            borderRadius: 16,
                            padding: 20,
                            width: '85%',
                            shadowColor: colors.shadow.color,
                            shadowOpacity: colors.shadow.opacity,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 8,
                            elevation: 5
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: colors.text.primary,
                                marginBottom: 16
                            }}>
                                Create New Category
                            </Text>

                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    backgroundColor: colors.background,
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    color: colors.text.primary,
                                    marginBottom: 20
                                }}
                                placeholder="Enter category name"
                                value={newCategory}
                                onChangeText={setNewCategory}
                                placeholderTextColor={colors.text.tertiary}
                                autoFocus
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        backgroundColor: colors.card,
                                        alignItems: 'center',
                                        width: '48%'
                                    }}
                                    onPress={() => setShowAddCategoryModal(false)}
                                >
                                    <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        backgroundColor: colors.accent.primary,
                                        alignItems: 'center',
                                        width: '48%'
                                    }}
                                    onPress={handleAddCategory}
                                >
                                    <Text style={{ color: colors.background, fontWeight: '600' }}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </AuthWrapper>
    )
}

export default Create