"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuthStore } from "@/store/useAuthStore"
import { fetchTracker, deleteTracker, editTracker } from "@/lib/appwrite"
import { appColors } from "@/lib/appColors"
import { useColorScheme } from "react-native"
import { Feather } from "@expo/vector-icons"
import AuthWrapper from "@/components/AuthWrapper"

interface TrackerDocument {
    id: string
    name: string
    userId: string
    createdAt: string
    $id?: string
}

const Tracker = () => {
    const { user } = useAuthStore()
    const router = useRouter()
    const [trackers, setTrackers] = useState<TrackerDocument[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const colorScheme = useColorScheme()
    const colors = colorScheme === "dark" ? appColors.dark : appColors.light

    // Edit modal states
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [currentTracker, setCurrentTracker] = useState<TrackerDocument | null>(null)
    const [newTrackerName, setNewTrackerName] = useState("")
    const [isEditing, setIsEditing] = useState(false)

    const handleNavigate = () => {
        router.push("/create-tracker")
    }

    const handleNavigateToTracker = (id: string) => {
        router.push({
            pathname: "/(screens)/displayTracker/[id]",
            params: {id}
        })
    }

    const handleFetchTrackers = async (userId: string) => {
        if (!userId) return

        setLoading(true)
        setError(false)

        try {
            const result = await fetchTracker(userId)
            if (result.success) {
                setTrackers(result.trackers as unknown as TrackerDocument[])
            } else {
                console.error(result.message)
                // We're treating "no trackers" as a valid empty state, not an error
                if (result.message !== 'No trackers found or not authorized.') {
                    setError(true)
                }
            }
        } catch (error) {
            console.error("Error fetching trackers:", error)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.$id) {
            handleFetchTrackers(user.$id)
        }
    }, [user])

    const handleEdit = (tracker: TrackerDocument) => {
        setCurrentTracker(tracker)
        setNewTrackerName(tracker.name)
        setEditModalVisible(true)
    }

    const handleConfirmEdit = async () => {
        if (!currentTracker || !user?.$id || !newTrackerName.trim()) return

        setIsEditing(true)
        try {
            const result = await editTracker(currentTracker.id, user.$id, newTrackerName.trim())

            if (result.success) {
                // Update the tracker in the local state
                setTrackers(prevTrackers =>
                    prevTrackers.map(tracker =>
                        tracker.id === currentTracker.id
                            ? { ...tracker, name: newTrackerName.trim() }
                            : tracker
                    )
                )
                setEditModalVisible(false)
                // Show success message
                Alert.alert("Success", "Tracker updated successfully")
            } else {
                Alert.alert("Error", result.message || "Failed to update tracker")
            }
        } catch (error) {
            console.error("Error updating tracker:", error)
            Alert.alert("Error", "Something went wrong while updating the tracker")
        } finally {
            setIsEditing(false)
        }
    }

    const handleDelete = async (tracker: TrackerDocument) => {
        if (!user?.$id) return

        // Confirm deletion
        Alert.alert(
            "Delete Tracker",
            `Are you sure you want to delete "${tracker.name}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true)
                        try {
                            const result = await deleteTracker(tracker.id, user.$id)

                            if (result.success) {
                                // Remove the tracker from the local state
                                setTrackers(prevTrackers =>
                                    prevTrackers.filter(t => t.id !== tracker.id)
                                )
                                Alert.alert("Success", "Tracker deleted successfully")
                            } else {
                                Alert.alert("Error", result.message || "Failed to delete tracker")
                            }
                        } catch (error) {
                            console.error("Error deleting tracker:", error)
                            Alert.alert("Error", "Something went wrong while deleting the tracker")
                        } finally {
                            setLoading(false)
                        }
                    }
                }
            ]
        )
    }

    const renderTrackerItem = ({ item }: { item: TrackerDocument }) => (
        <TouchableOpacity
            onPress={() => handleNavigateToTracker(item.$id || item.id)}
            className="p-4 mb-3 rounded-xl"
            style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
            }}
        >
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                    {item.name}
                </Text>
                <View className="flex-row space-x-5 gap-5">
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={22} color={colors.accent.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)}>
                        <Feather name="trash" size={22} color={colors.status.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <Text className="text-sm" style={{ color: colors.text.secondary }}>
                Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                </View>
            )
        }

        if (error) {
            return (
                <View className="flex-1 items-center justify-center">
                    <Feather name="alert-circle" size={50} color={colors.text.tertiary} />
                    <Text className="text-center mt-4" style={{ color: colors.text.tertiary }}>
                        Something went wrong while loading your trackers
                    </Text>
                    <TouchableOpacity
                        className="mt-4 py-2 px-4 rounded-lg"
                        style={{ backgroundColor: colors.accent.primary }}
                        onPress={() => user?.$id && handleFetchTrackers(user.$id)}
                    >
                        <Text className="text-white">Try Again</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        if (trackers && trackers.length > 0) {
            return (
                <FlatList
                    data={trackers}
                    renderItem={renderTrackerItem}
                    keyExtractor={(item) => item.$id || item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )
        }

        // Empty state - no trackers yet
        return (
            <View className="flex-1 items-center justify-center">
                <Feather name="clipboard" size={50} color={colors.text.tertiary} />
                <Text className="text-center mt-4 text-lg font-medium" style={{ color: colors.text.tertiary }}>
                    No trackers yet
                </Text>
                <Text className="text-center mt-2 px-8" style={{ color: colors.text.tertiary }}>
                    Create your first tracker to start monitoring your habits and goals
                </Text>
                <TouchableOpacity
                    className="mt-6 py-3 px-6 rounded-lg"
                    style={{ backgroundColor: colors.accent.primary }}
                    onPress={handleNavigate}
                >
                    <Text className="text-white font-medium">Create Tracker</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <AuthWrapper redirectToLogin={true}>
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="px-4 pt-6">
                    <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        Manage your trackers
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                        Create and use trackers to stay on top of your habits or goals.
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleNavigate}
                    className="mx-4 mt-6 rounded-lg py-3 px-4 items-center flex-row justify-center"
                    style={{ backgroundColor: colors.accent.primary }}
                >
                    <Feather name="plus-circle" size={20} color="#fff" />
                    <Text className="text-white text-base font-semibold ml-2">Create New Tracker</Text>
                </TouchableOpacity>

                <View className="mt-8 px-4 flex-1">
                    <Text className="text-lg font-semibold mb-3" style={{ color: colors.text.primary }}>
                        Your Trackers
                    </Text>

                    {renderContent()}
                </View>

                {/* Edit Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={editModalVisible}
                    onRequestClose={() => setEditModalVisible(false)}>
                    <View className="flex-1 justify-center items-center bg-black/50">
                        <View
                            className="w-4/5 p-6 rounded-xl"
                            style={{ backgroundColor: colors.card }}
                        >
                            <Text
                                className="text-xl font-bold mb-4"
                                style={{ color: colors.text.primary }}
                            >
                                Edit Tracker
                            </Text>

                            <TextInput
                                className="border rounded-lg px-4 py-3 mb-4"
                                style={{
                                    borderColor: colors.border,
                                    color: colors.text.primary,
                                    backgroundColor: colors.background
                                }}
                                value={newTrackerName}
                                onChangeText={setNewTrackerName}
                                placeholder="Tracker name"
                                placeholderTextColor={colors.text.tertiary}
                            />

                            <View className="flex-row justify-end space-x-3">
                                <TouchableOpacity
                                    className="py-2 px-4 rounded-lg border"
                                    style={{ borderColor: colors.border }}
                                    onPress={() => setEditModalVisible(false)}
                                    disabled={isEditing}
                                >
                                    <Text style={{ color: colors.text.secondary }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="py-2 px-4 rounded-lg"
                                    style={{ backgroundColor: colors.accent.primary }}
                                    onPress={handleConfirmEdit}
                                    disabled={isEditing || !newTrackerName.trim()}
                                >
                                    {isEditing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text className="text-white">Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </AuthWrapper>
    )
}

export default Tracker