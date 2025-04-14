"use client"

import { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { createTracker } from "@/lib/appwrite"
import { ID } from "react-native-appwrite"
import { useAuthStore } from "@/store/useAuthStore"
import {appColors} from "@/lib/appColors";
import { useColorScheme } from "react-native"
import { useRouter } from "expo-router"

const CreateTracker = () => {
    const [id] = useState(ID.unique())
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const { user } = useAuthStore()
    const colorScheme = useColorScheme()
    const colors = colorScheme === "dark" ? appColors.dark : appColors.light
    const router = useRouter()

    const handleCreateTracker = async () => {
        if (!name.trim()) {
            Alert.alert("Missing information", "Please enter a tracker name.")
            return
        }

        if (!user?.$id) {
            Alert.alert("Authentication required", "Please log in to create a tracker.")
            return
        }

        setLoading(true)
        const createdAt = new Date().toISOString()

        try {
            const res = await createTracker(id, user.$id, name, createdAt)
            setLoading(false)

            if ("error" in res) {
                Alert.alert("Error", res.error)
            } else {
                Alert.alert("Success", "Tracker created successfully!", [
                    { text: "OK", onPress: () => router.push("/tracker") },
                ])
            }
        } catch (err) {
            setLoading(false)
            Alert.alert("Error", "Something went wrong while creating the tracker.")
            console.error(err)
        }
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-4">
                    <View className="mt-6">
                        <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                            Create a Tracker
                        </Text>
                        <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                            Create your tracker on what you want to track
                        </Text>
                    </View>

                    <View className="mt-8 space-y-6">
                        <View className="bg-opacity-5 rounded-xl p-4" style={{ backgroundColor: colors.accent.light }}>
                            <Text className="text-sm" style={{ color: colors.text.secondary }}>
                                You are creating this tracker as:
                            </Text>
                            <Text className="font-medium mt-1" style={{ color: colors.text.primary }}>
                                {user?.name || user?.email || "Anonymous User"}
                            </Text>
                        </View>

                        <View>
                            <Text className="text-base font-medium mb-2" style={{ color: colors.text.primary }}>
                                Tracker Name
                            </Text>
                            <TextInput
                                className="border rounded-lg px-4 py-3"
                                style={{
                                    borderColor: colors.border,
                                    backgroundColor: colors.card,
                                    color: colors.text.primary,
                                }}
                                placeholder="e.g., Daily Workout, Water Intake"
                                placeholderTextColor={colors.text.tertiary}
                                value={name}
                                onChangeText={setName}
                            />
                            <Text className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                                Choose a clear name that describes what you're tracking
                            </Text>
                        </View>

                        <View className="mt-4 space-y-3">
                            <TouchableOpacity
                                onPress={handleCreateTracker}
                                disabled={loading}
                                className="rounded-lg py-4 items-center"
                                style={{
                                    backgroundColor: loading ? colors.text.tertiary : colors.accent.primary,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-semibold text-base">Create Tracker</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="rounded-lg py-3 items-center border"
                                style={{ borderColor: colors.border }}
                            >
                                <Text style={{ color: colors.text.secondary }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default CreateTracker
