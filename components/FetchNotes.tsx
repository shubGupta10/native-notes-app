import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, FlatList, useColorScheme } from 'react-native'
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
    const colorScheme = useColorScheme()
    const isDarkMode = colorScheme === 'dark'

    // Enhanced color palette for better visibility
    const colors = {
        background: isDarkMode ? "#121212" : "#FFFFFF",
        cardBackground: isDarkMode ? "#1E1E1E" : "#FFFFFF",
        cardBorder: isDarkMode ? "#333333" : "#E5E7EB",
        text: {
            primary: isDarkMode ? "#F3F4F6" : "#1F2937",
            secondary: isDarkMode ? "#D1D5DB" : "#4B5563",
            tertiary: isDarkMode ? "#9CA3AF" : "#6B7280",
        },
        accent: {
            primary: isDarkMode ? "#60A5FA" : "#3B82F6",
            secondary: isDarkMode ? "#3B82F6" : "#2563EB",
            light: isDarkMode ? "rgba(96, 165, 250, 0.2)" : "rgba(59, 130, 246, 0.1)",
        }
    }

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
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.accent.primary} />
                <Text className="mt-4" style={{ color: colors.text.tertiary }}>Loading notes...</Text>
            </View>
        )
    }

    // Render a note item - used in both list and compact views
    const renderNoteItem = ({ item: note }: { item: Note }) => (
        <View
            className={`rounded-lg overflow-hidden shadow-sm ${viewMode === 'compact' ? 'w-60 mr-3' : 'mb-4'}`}
            style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            <TouchableOpacity
                onPress={() => handleViewNote(note.$id)}
                activeOpacity={0.7}
                className="p-4"
            >
                <Text
                    className="text-lg font-semibold mb-1"
                    numberOfLines={viewMode === 'compact' ? 1 : 2}
                    style={{ color: colors.text.primary }}
                >
                    {note.title}
                </Text>

                <Text
                    className="mt-2"
                    numberOfLines={viewMode === 'compact' ? 2 : 3}
                    style={{ color: colors.text.secondary }}
                >
                    {truncateContent(note.content, viewMode === 'compact' ? 60 : 80)}
                </Text>
            </TouchableOpacity>

            <View className={`flex-row justify-between items-start px-4 pb-3 ${viewMode === 'compact' ? 'pt-0' : 'pt-0'}`}>
                <TouchableOpacity
                    onPress={() => setSelectedTag(note.category)}
                    className="flex-row items-center px-3 py-1 rounded-full mr-2"
                    style={{ backgroundColor: colors.accent.light }}
                >
                    <Feather name="tag" size={12} color={colors.accent.primary} />
                    <Text
                        className="text-xs font-medium ml-1"
                        numberOfLines={1}
                        style={{ color: colors.accent.primary }}
                    >
                        {note.category}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row items-center space-x-1">
                    <TouchableOpacity
                        onPress={() => handleEdit(note.$id)}
                        className="p-2 rounded-full"
                        style={{ backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6' }}
                        activeOpacity={0.7}
                    >
                        <Feather name="edit-2" size={14} color={colors.accent.primary} />
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
            <View className="p-4 rounded-full mb-4" style={{ backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6' }}>
                <Feather name="search" size={24} color={colors.text.tertiary} />
            </View>
            <Text
                className="text-center mb-2 text-lg font-medium"
                style={{ color: colors.text.secondary }}
            >
                {searchQuery
                    ? "No matching notes found"
                    : selectedTag
                        ? `No notes in "${selectedTag}" category`
                        : 'No notes yet'
                }
            </Text>
            <Text
                className="text-center mb-6 max-w-xs"
                style={{ color: colors.text.tertiary }}
            >
                {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first note to get started"
                }
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/create')}
                className="px-6 py-3 rounded-lg"
                style={{ backgroundColor: colors.accent.secondary }}
            >
                <Text className="text-white font-medium">Create Note</Text>
            </TouchableOpacity>
        </View>
    );

    // Create category sections for compact view
    const categorySections = [...new Set([...filteredNotes.map(note => note.category), 'Uncategorized'])].filter(Boolean);

    return (
        <View className="flex-1 px-4 pt-4" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="mb-4">
                <SearchInNotes searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </View>

            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                    <Text
                        className="text-2xl font-bold"
                        style={{ color: colors.text.primary }}
                    >
                        {selectedTag ? `${selectedTag}` : 'All Notes'}
                    </Text>
                    {selectedTag && (
                        <TouchableOpacity
                            onPress={() => setSelectedTag(null)}
                            className="ml-2"
                        >
                            <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-row items-center">
                    <Text
                        className="mr-3"
                        style={{ color: colors.text.tertiary }}
                    >
                        {filteredNotes.length} notes
                    </Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        disabled={refreshing}
                        className={`${refreshing ? 'opacity-50' : ''} p-2 rounded-full`}
                        style={{ backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6' }}
                    >
                        <Feather
                            name="refresh-cw"
                            size={18}
                            color={colors.accent.primary}
                            style={refreshing ? { transform: [{ rotate: '45deg' }] } : {}}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notes list */}
            {refreshing && (
                <ActivityIndicator
                    size="small"
                    color={colors.accent.primary}
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
                    contentContainerStyle={{ paddingBottom: 100 }}
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
                                <Text
                                    className="text-base font-semibold mb-3"
                                    style={{ color: colors.text.secondary }}
                                >
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
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    )
}

export default FetchNotes