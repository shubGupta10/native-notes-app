"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuthStore } from "@/store/useAuthStore"
import { fetchTracker } from "@/lib/appwrite"
import {appColors} from "@/lib/appColors";
import { useColorScheme } from "react-native"
import { Feather } from "@expo/vector-icons"

interface TrackerDocument {
    id: string
    name: string
    userId: string
    createdAt: string
    $id?: string // Appwrite documents have $id
}

const Tracker = () => {
    const { user } = useAuthStore()
    const router = useRouter()
    // Fix the type to match what's coming from the API
    const [trackers, setTrackers] = useState<TrackerDocument[]>([])
    const [loading, setLoading] = useState<boolean>(false)
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
        try {
            const result = await fetchTracker(userId)
            if (result.success) {
                setTrackers(result.trackers as unknown as TrackerDocument[])
            } else {
                console.error(result.message)
            }
        } catch (error) {
            console.error("Error fetching trackers:", error)
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


    return (
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

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.accent.primary} />
                    </View>
                ) : trackers.length > 0 ? (
                    <FlatList
                        data={trackers}
                        renderItem={renderTrackerItem}
                        keyExtractor={(item) => item.$id || item.id} // Use $id from Appwrite or fallback to id
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Feather name="clipboard" size={50} color={colors.text.tertiary} />
                        <Text className="text-center mt-4" style={{ color: colors.text.tertiary }}>
                            You don't have any trackers right now
                        </Text>
                        <Text className="text-center mt-2" style={{ color: colors.text.tertiary }}>
                            Create one to get started!
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

export default Tracker
