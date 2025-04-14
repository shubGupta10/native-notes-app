"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuthStore } from "@/store/useAuthStore"
import { fetchTracker } from "@/lib/appwrite"
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

    const renderTrackerItem = ({ item }: { item: TrackerDocument }) => (
        <TouchableOpacity
            onPress={() => handleNavigateToTracker(item.$id || item.id)}
            className="p-4 mb-3 rounded-xl"
            style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        >
            <Text className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                {item.name}
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    )

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
            </SafeAreaView>
        </AuthWrapper>
    )
}

export default Tracker