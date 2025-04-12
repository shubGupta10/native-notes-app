import { ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import AuthWrapper from '@/components/AuthWrapper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { saveNote } from '@/lib/appwrite'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'

const Create = () => {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user } = useAuthStore()

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
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar style="dark" />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 px-4">
                        <View className="flex-row items-center justify-between py-4">
                            <Text className="text-2xl font-bold text-gray-800">Create Note</Text>
                            <TouchableOpacity 
                                className="p-2 rounded-full bg-gray-100"
                                onPress={() => {/* Add navigation or dismiss action */}}
                            >
                                <Feather name="x" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            <View className="space-y-5 bg-white p-4 rounded-xl shadow-sm mb-4">
                                <View className="space-y-2">
                                    <Text className="text-base font-medium text-gray-700">Title</Text>
                                    <TextInput
                                        className="border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-800 shadow-sm"
                                        placeholder="Enter note title"
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                <View className="space-y-2">
                                    <Text className="text-base font-medium text-gray-700">Category</Text>
                                    <TextInput
                                        className="border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-800 shadow-sm"
                                        placeholder="E.g. Hooks, Navigation"
                                        value={category}
                                        onChangeText={setCategory}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>

                            <View className="space-y-4 bg-white p-4 rounded-xl shadow-sm mb-4">
                                <Text className="text-base font-medium text-gray-700">Content</Text>
                                
                                <TextInput
                                    className="border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Write your note here..."
                                    value={content}
                                    onChangeText={setContent}
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    textAlignVertical="top"
                                    style={{ minHeight: 200 }}
                                />
                            </View>

                            <View className="mt-4 mb-6">
                                <TouchableOpacity
                                    className={`py-4 rounded-xl flex-row justify-center items-center space-x-2 ${
                                        isSubmitting ? 'bg-blue-400' : 'bg-blue-600'
                                    } shadow-sm`}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="save" size={20} color="white" />
                                    <Text className="text-white text-center font-bold text-lg">
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