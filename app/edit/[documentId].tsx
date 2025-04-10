import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { editNoteByUserIdAndDocumentId, fetchNoteById } from '@/lib/appwrite'

type UpdatedField = {
  title?: string
  category?: string
  content?: string
}

const Edit = () => {
    const { documentId } = useLocalSearchParams()
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        const fetchNoteData = async () => {
            if (!documentId || !user?.$id) return
            
            try {
                setIsLoading(true)
                const noteData = await fetchNoteById(documentId as string)
                
                if (noteData) {
                    setTitle(noteData.title || '')
                    setCategory(noteData.category || '')
                    setContent(noteData.content || '')
                }
            } catch (error) {
                console.error('Error fetching note:', error)
                Alert.alert('Error', 'Failed to load note data')
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchNoteData()
    }, [documentId, user])

    const handleEdit = async () => {
        if (!title.trim() || !category.trim() || !content.trim()) {
            Alert.alert('Error', 'Please fill all the fields')
            return
        }

        if (!user?.$id || !documentId) {
            Alert.alert('Error', 'Authentication or note information missing')
            return
        }

        setIsSubmitting(true)
        
        try {
            // Create the updated fields object
            const updatedField: UpdatedField = {
                title,
                category,
                content
            }
            
            // Call the edit function with all required parameters
            await editNoteByUserIdAndDocumentId(
                user.$id,
                documentId as string,
                updatedField
            )
            
            Alert.alert(
                'Success', 
                'Note updated successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            )
        } catch (error) {
            console.error('Error updating note:', error)
            Alert.alert('Error', 'Failed to update note')
        } finally {
            setIsSubmitting(false)
        }
    }
    
    return (
        <AuthWrapper redirectToLogin={true}>
            <StatusBar style="dark" />
            
            <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
                <View className="flex-1 px-6">
                    <ScrollView 
                        className="flex-1" 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 50 }}
                    >
                        <View className="mt-6 mb-4 flex-row items-center">
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                className="p-2"
                            >
                                <Text className="text-blue-600 font-semibold">Back</Text>
                            </TouchableOpacity>
                            <Text className="text-3xl font-bold text-gray-800 ml-2">Edit Note</Text>
                        </View>
                        
                        {isLoading ? (
                            <View className="flex-1 justify-center items-center py-16">
                                <Text className="text-center py-4 text-gray-600">Loading note data...</Text>
                            </View>
                        ) : (
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
                        )}

                        <View className="mt-8 mb-4">
                            <TouchableOpacity 
                                className={`py-4 rounded-xl ${isSubmitting || isLoading ? 'bg-blue-400' : 'bg-blue-600'} shadow-sm`}
                                onPress={handleEdit}
                                disabled={isSubmitting || isLoading}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    {isSubmitting ? 'Updating...' : 'Update Note'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </AuthWrapper>
    )
}

export default Edit