import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { fetchNotesByUserId } from '@/lib/appwrite'
import { useRouter } from 'expo-router'
import { Edit2Icon, Tag } from 'lucide-react-native'
import DeleteNote from '@/components/DeleteNote' 

type Note = {
    $id: string
    title: string
    category: string
    content: string
}

const FetchNotes = () => {
    const { user } = useAuthStore()
    const router = useRouter()
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    const handleFetchNotes = async () => {
        if (user?.$id) {
            setLoading(true)
            try {
                const response = await fetchNotesByUserId(user.$id)
                setNotes(response.map(doc => ({
                    $id: doc.$id,
                    title: doc.title,
                    category: doc.category,
                    content: doc.content,
                })))
            } catch (error) {
                console.error('Error fetching notes:', error)
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        handleFetchNotes()
    }, [user])

    const categories = Array.from(new Set(notes.map(note => note.category)))

    const filteredNotes = selectedTag
        ? notes.filter(note => note.category === selectedTag)
        : notes

    const truncateContent = (content: string, maxLength = 80) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    const handleDeleteSuccess = () => {
        handleFetchNotes()
    }

    const handleEdit = (documentId: string) => {
        router.push({
            pathname: '/edit/[documentId]',
            params: {documentId}
        })
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4285F4" />
                <Text className="mt-4 text-gray-500">Loading notes...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-white px-4 pt-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">
                    {selectedTag ? `${selectedTag}` : 'All Notes'}
                </Text>
                <Text className="text-gray-500">{filteredNotes.length} notes</Text>
            </View>


            {/* Notes list */}
            <ScrollView className="space-y-5">
                {filteredNotes.map((note) => (
                    <TouchableOpacity
                        key={note.$id}
                        className="border mb-3 rounded-lg p-4 border-gray-400 bg-white"
                        activeOpacity={0.9}
                    >
                        <View className="flex-row justify-between items-start">
                            <Text className="text-lg font-semibold text-gray-800 flex-1 mb-1">{note.title}</Text>
                            <View className="flex-row items-center">
                                <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded mr-2">
                                    <Tag size={12} color="#4285F4" />
                                    <Text className="text-xs text-gray-600 ml-1">{note.category}</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => handleEdit(note.$id)}
                                    className="p-2 rounded-full mr-1"
                                    activeOpacity={0.7}
                                >
                                    <Edit2Icon size={20} color="#3B82F6" />
                                </TouchableOpacity>
                                <DeleteNote 
                                    userId={user?.$id || ''} 
                                    documentId={note.$id}
                                    onDeleteSuccess={handleDeleteSuccess}
                                />
                            </View>
                        </View>
                        <Text className="text-gray-600">{truncateContent(note.content)}</Text>
                    </TouchableOpacity>
                ))}

                {filteredNotes.length === 0 && (
                    <View className="items-center justify-center py-16">
                        <Text className="text-center text-gray-500 mb-4">
                            {selectedTag
                                ? `No notes in "${selectedTag}" category`
                                : 'No notes yet'
                            }
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/create')}
                            className="bg-blue-500 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium">Create Note</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default FetchNotes