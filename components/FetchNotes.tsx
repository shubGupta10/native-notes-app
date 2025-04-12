import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { fetchNotesByUserId } from '@/lib/appwrite'
import { useRouter } from 'expo-router'
import { FontAwesome, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons'
import DeleteNote from '@/components/DeleteNote'
import SearchInNotes from "@/components/SearchInNotes";

type Note = {
    $id: string
    title: string
    category: string
    content: string
}

type FetchNotesProps = {
    viewMode?: 'list' | 'compact'
}

const FetchNotes = ({ viewMode = 'list' }: FetchNotesProps) => {
    const { user } = useAuthStore()
    const router = useRouter()
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [categories, setCategories] = useState<string[]>([])

    const handleFetchNotes = useCallback(async () => {
        if (user?.$id) {
            setLoading(true)
            try {
                const response = await fetchNotesByUserId(user.$id)
                const fetchedNotes = response.map(doc => ({
                    $id: doc.$id,
                    title: doc.title,
                    category: doc.category,
                    content: doc.content,
                }))
                setNotes(fetchedNotes)

                // Extract unique categories
                const uniqueCategories = Array.from(new Set(fetchedNotes.map(note => note.category)))
                setCategories(uniqueCategories)
            } catch (error) {
                console.error('Error fetching notes:', error)
            } finally {
                setLoading(false)
                setRefreshing(false)
            }
        }
    }, [user?.$id])

    useEffect(() => {
        if (user?.$id) {
            handleFetchNotes();
        }
    }, [user, handleFetchNotes]);

    const handleRefresh = () => {
        setRefreshing(true)
        handleFetchNotes()
    }

    // Filter notes based on category and search
    const filteredNotes = notes.filter(note => {
        const matchCategory = selectedTag ? note.category === selectedTag : true;
        const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    })

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

    const handleViewNote = (documentId: string) => {
        router.push({
            pathname: "/view/[documentId]",
            params: {documentId}
        })
    }

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4285F4" />
                <Text className="mt-4 text-gray-500">Loading notes...</Text>
            </View>
        )
    }

    // Render a note item - used in both list and compact views
    const renderNoteItem = ({ item: note }: { item: Note }) => (
        <View className={`border rounded-lg border-gray-200 bg-white shadow-sm overflow-hidden
                       ${viewMode === 'compact' ? 'w-60 mr-3' : 'mb-3'}`}>
            <TouchableOpacity 
                onPress={() => handleViewNote(note.$id)} 
                activeOpacity={0.7}
                className="p-4"
            >
                <Text 
                    className="text-lg font-semibold text-gray-800 flex-1 mb-1"
                    numberOfLines={viewMode === 'compact' ? 1 : 2}
                >
                    {note.title}
                </Text>

                <Text 
                    className="text-gray-600 mt-2"
                    numberOfLines={viewMode === 'compact' ? 2 : 3}
                >
                    {truncateContent(note.content, viewMode === 'compact' ? 60 : 80)}
                </Text>
            </TouchableOpacity>

            <View className={`flex-row justify-between items-start px-4 pb-3 ${viewMode === 'compact' ? 'pt-0' : 'pt-0'}`}>
                <TouchableOpacity
                    onPress={() => setSelectedTag(note.category)}
                    className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full mr-2"
                >
                    <Feather name="tag" size={12} color="#4285F4" />
                    <Text className="text-xs text-blue-600 font-medium ml-1" numberOfLines={1}>
                        {note.category}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row items-center space-x-1">
                    <TouchableOpacity
                        onPress={() => handleEdit(note.$id)}
                        className="p-2 rounded-full bg-gray-100"
                        activeOpacity={0.7}
                    >
                        <Feather name="edit-2" size={14} color="#3B82F6" />
                    </TouchableOpacity>

                    <DeleteNote
                        userId={user?.$id || ''}
                        documentId={note.$id}
                        onDeleteSuccess={handleDeleteSuccess}
                    />
                </View>
            </View>
        </View>
    );

    const EmptyListComponent = () => (
        <View className="items-center justify-center py-16">
            <View className="bg-gray-100 p-4 rounded-full mb-4">
                <Feather name="search" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-center text-gray-500 mb-2 text-lg font-medium">
                {searchQuery
                    ? "No matching notes found"
                    : selectedTag
                        ? `No notes in "${selectedTag}" category`
                        : 'No notes yet'
                }
            </Text>
            <Text className="text-center text-gray-400 mb-6 max-w-xs">
                {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first note to get started"
                }
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/create')}
                className="bg-blue-500 px-6 py-3 rounded-lg"
            >
                <Text className="text-white font-medium">Create Note</Text>
            </TouchableOpacity>
        </View>
    );

    // Create category sections for compact view
    const categorySections = [...new Set([...filteredNotes.map(note => note.category), 'Uncategorized'])].filter(Boolean);

    return (
        <View className="flex-1 bg-white px-4 pt-4">
            {/* Header */}
            <View className="mb-4">
                <SearchInNotes searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </View>

            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl font-bold text-gray-800">
                        {selectedTag ? `${selectedTag}` : 'All Notes'}
                    </Text>
                    {selectedTag && (
                        <TouchableOpacity
                            onPress={() => setSelectedTag(null)}
                            className="ml-2"
                        >
                            <Ionicons name="close" size={16} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-row items-center">
                    <Text className="text-gray-500 mr-3">{filteredNotes.length} notes</Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        disabled={refreshing}
                        className={`${refreshing ? 'opacity-50' : ''} p-2 bg-gray-100 rounded-full`}
                    >
                        <Feather name="refresh-cw" size={18} color="#4285F4" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notes list */}
            {refreshing && (
                <ActivityIndicator
                    size="small"
                    color="#4285F4"
                    style={{ marginVertical: 10 }}
                />
            )}

            {filteredNotes.length === 0 ? (
                <EmptyListComponent />
            ) : viewMode === 'list' ? (
                // Standard list view
                <FlatList
                    data={filteredNotes}
                    keyExtractor={item => item.$id}
                    renderItem={renderNoteItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            ) : (
                // Compact view with horizontal scrolling sections
                <FlatList
                    data={
                        selectedTag 
                            ? [selectedTag] 
                            : categorySections
                    }
                    keyExtractor={(item) => `section-${item}`}
                    renderItem={({ item: category }) => {
                        const categoryNotes = filteredNotes.filter(note => 
                            category === 'Uncategorized' 
                                ? !note.category 
                                : note.category === category
                        );
                        
                        if (categoryNotes.length === 0) return null;
                        
                        return (
                            <View className="mb-6">
                                <Text className="text-base font-semibold text-gray-700 mb-3">
                                    {category}
                                </Text>
                                <FlatList
                                    horizontal
                                    data={categoryNotes}
                                    keyExtractor={item => `compact-${item.$id}`}
                                    renderItem={renderNoteItem}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingRight: 16 }}
                                />
                            </View>
                        );
                    }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    )
}

export default FetchNotes