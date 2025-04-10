import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AuthWrapper from '@/components/AuthWrapper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { saveNote } from '@/lib/appwrite'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'

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
                <View className="flex-1 px-6">
                    <ScrollView 
                        className="flex-1" 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <Text className="text-3xl font-bold text-gray-800 mt-6 mb-8">Create Note</Text>
                        
                        <View className="space-y-5">
                            <View className="space-y-2">
                                <Text className="text-base font-medium text-gray-700">Title</Text>
                                <TextInput
                                    className="border border-gray-300 bg-white rounded-xl px-4 py-3 text-black shadow-sm"
                                    placeholder="Enter note title"
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View className="space-y-2">
                                <Text className="text-base font-medium text-gray-700">Category</Text>
                                <TextInput
                                    className="border border-gray-300 bg-white rounded-xl px-4 py-3 text-black shadow-sm"
                                    placeholder="E.g. Hooks, Navigation"
                                    value={category}
                                    onChangeText={setCategory}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View className="space-y-2">
                                <Text className="text-base font-medium text-gray-700">Content</Text>
                                <TextInput
                                    className="border border-gray-300 bg-white rounded-xl p-4 h-64 text-black shadow-sm"
                                    placeholder="Write your note here..."
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>

                        <View className="mt-8 mb-4">
                            <TouchableOpacity 
                                className={`py-4 rounded-xl ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'} shadow-sm`}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    {isSubmitting ? 'Saving...' : 'Save Note'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </AuthWrapper>
    )
}

export default Create