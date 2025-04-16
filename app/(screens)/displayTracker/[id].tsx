import { Text, View, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar } from 'react-native-calendars'
import { appColors } from "@/lib/appColors"
import { createEntry, fetchStatus, updateEntry, fetchSingleTracker } from '@/lib/appwrite'
import { useAuthStore } from "@/store/useAuthStore"
import { databases } from "@/lib/appwrite"
import { Query } from "react-native-appwrite"
import { useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { MarkedDates, TrackerData, EntryStatus } from "@/types/trackerTypes"

const DisplayTracker = () => {
    const { id } = useLocalSearchParams()
    const { user } = useAuthStore()
    const userId = user?.$id || ''
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const colors = isDark ? appColors.dark : appColors.light

    const [markedDates, setMarkedDates] = useState<MarkedDates>({})
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [currentStatus, setCurrentStatus] = useState<EntryStatus | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [trackerData, setTrackerData] = useState<TrackerData | null>(null)
    const [totalCompleted, setTotalCompleted] = useState(0)
    const [totalMissed, setTotalMissed] = useState(0)

    const successColor = colors.status.success
    const errorColor = colors.status.error
    const textColor = '#FFFFFF'

    const fetchTrackerData = async () => {
        try {
            const result = await fetchSingleTracker(id as string, userId)
            if (result?.success && result.tracker.length > 0) {
                setTrackerData(result.tracker[0] as unknown as TrackerData)
            }
        } catch (error) {
            console.error("Fetch Tracker Error:", error)
        }
    }

    const fetchAllEntries = async () => {
        try {
            setIsLoading(true)
            const entries = await databases.listDocuments(
                process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
                [
                    Query.equal("userId", userId),
                    Query.equal("trackerId", id)
                ]
            )

            const newMarkedDates: MarkedDates = {}
            let completed = 0
            let missed = 0

            entries.documents.forEach((entry: any) => {
                newMarkedDates[entry.date] = {
                    selected: true,
                    selectedColor: entry.status ? successColor : errorColor,
                    selectedTextColor: textColor
                }

                if (entry.status) {
                    completed++
                } else {
                    missed++
                }
            })

            setTotalCompleted(completed)
            setTotalMissed(missed)
            setMarkedDates(newMarkedDates)
        } catch (error) {
            console.error("Fetch All Entries Error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDayPress = async (day: any) => {
        setSelectedDate(day.dateString)
        const status = await fetchStatus(userId, id as string, day.dateString)
        setCurrentStatus(status)
        setModalVisible(true)
    }

    const handleStatusUpdate = async (status: boolean) => {
        if (!selectedDate) return

        try {
            setIsLoading(true)

            if (currentStatus?.entryId) {
                await updateEntry(currentStatus.entryId, status, userId)
            } else {
                await createEntry(userId, id as string, selectedDate, status)
            }

            setMarkedDates(prev => ({
                ...prev,
                [selectedDate]: {
                    selected: true,
                    selectedColor: status ? successColor : errorColor,
                    selectedTextColor: textColor
                }
            }))

            if (currentStatus?.status !== undefined) {
                if (status && !currentStatus.status) {
                    setTotalCompleted(prev => prev + 1)
                    setTotalMissed(prev => prev - 1)
                } else if (!status && currentStatus.status) {
                    setTotalMissed(prev => prev + 1)
                    setTotalCompleted(prev => prev - 1)
                }
            } else {
                if (status) {
                    setTotalCompleted(prev => prev + 1)
                } else {
                    setTotalMissed(prev => prev + 1)
                }
            }

            setModalVisible(false)
        } catch (error) {
            console.error("Status Update Error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (id && userId) {
            fetchTrackerData()
            fetchAllEntries()
        }
    }, [id, userId])

    const formattedDate = trackerData?.createdAt
        ? format(new Date(trackerData.createdAt), 'MMMM dd, yyyy')
        : null

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-4 pt-2 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className={`p-2 rounded-full ${isDark ? 'bg-[#333333]' : 'bg-gray-100'}`}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={colors.text.primary}
                        />
                    </TouchableOpacity>

                    <Text className={`text-xl font-bold ml-4 flex-1 ${isDark ? 'text-white' : 'text-black'}`}>
                        Habit Tracker
                    </Text>
                </View>

                <View className={`mx-4 mt-4 p-5 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                    {isLoading && !trackerData ? (
                        <ActivityIndicator color={colors.accent.primary} />
                    ) : (
                        <>
                            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                {trackerData?.name || 'Loading tracker...'}
                            </Text>

                            {trackerData?.description && (
                                <Text className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {trackerData.description}
                                </Text>
                            )}

                            <View className="flex-row items-center mt-4">
                                <Ionicons
                                    name="person-outline"
                                    size={16}
                                    color={colors.text.secondary}
                                />
                                <Text className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {user?.name || 'User'}
                                </Text>

                                {formattedDate && (
                                    <>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color={colors.text.secondary}
                                            style={{ marginLeft: 12 }}
                                        />
                                        <Text className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Started {formattedDate}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </View>

                <View className="flex-row mx-4 mt-4 mb-4">
                    <View className={`flex-1 p-4 rounded-xl mr-2 ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                        <Text className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            {totalCompleted}
                        </Text>
                        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Completed
                        </Text>
                    </View>

                    <View className={`flex-1 p-4 rounded-xl ml-2 ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                        <Text className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            {totalMissed}
                        </Text>
                        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Missed
                        </Text>
                    </View>
                </View>

                <View className={`mx-4 mb-6 p-5 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                    <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                        Tracking Calendar
                    </Text>

                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        theme={{
                            calendarBackground: isDark ? colors.card : colors.card,
                            textSectionTitleColor: colors.text.primary,
                            textSectionTitleDisabledColor: colors.text.tertiary,
                            selectedDayBackgroundColor: colors.accent.primary,
                            selectedDayTextColor: textColor,
                            todayTextColor: colors.accent.primary,
                            dayTextColor: colors.text.primary,
                            textDisabledColor: colors.text.tertiary,
                            dotColor: colors.accent.primary,
                            selectedDotColor: textColor,
                            arrowColor: colors.accent.primary,
                            disabledArrowColor: colors.text.tertiary,
                            monthTextColor: colors.text.primary,
                            indicatorColor: colors.accent.primary,
                        }}
                    />

                    <View className="flex-row mt-5 justify-center">
                        <View className="flex-row items-center mr-6">
                            <View className="w-4 h-4 rounded-full" style={{ backgroundColor: successColor }} />
                            <Text className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Completed
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-4 h-4 rounded-full" style={{ backgroundColor: errorColor }} />
                            <Text className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Missed
                            </Text>
                        </View>
                    </View>
                </View>

                <View className={`mx-4 mb-8 p-5 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                    <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                        How It Works
                    </Text>

                    <View className="ml-1">
                        <View className="flex-row mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>1.</Text>
                            <Text className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Tap any date on the calendar to log your progress
                            </Text>
                        </View>

                        <View className="flex-row mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>2.</Text>
                            <Text className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Select "Completed" if you succeeded with your habit
                            </Text>
                        </View>

                        <View className="flex-row mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>3.</Text>
                            <Text className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Select "Missed" if you didn't complete your habit
                            </Text>
                        </View>

                        <View className="flex-row mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>4.</Text>
                            <Text className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Green dates show successful days, red dates show missed days
                            </Text>
                        </View>

                        <View className="flex-row">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>5.</Text>
                            <Text className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Track your progress with the completion stats above
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className={`${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} rounded-t-3xl p-6 shadow-lg`}>
                        <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                            Update Status
                        </Text>

                        <Text className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedDate ? `How did you do on ${format(new Date(selectedDate), 'MMMM dd, yyyy')}?` : 'Select a date'}
                        </Text>

                        <View className="flex-row justify-between mb-6">
                            <TouchableOpacity
                                className="py-4 px-6 rounded-xl flex-1 mr-2 items-center shadow"
                                style={{ backgroundColor: errorColor }}
                                onPress={() => handleStatusUpdate(false)}
                                disabled={isLoading}
                            >
                                <Ionicons name="close-circle" size={28} color="white" />
                                <Text className="text-white font-semibold mt-2">Missed</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="py-4 px-6 rounded-xl flex-1 ml-2 items-center shadow"
                                style={{ backgroundColor: successColor }}
                                onPress={() => handleStatusUpdate(true)}
                                disabled={isLoading}
                            >
                                <Ionicons name="checkmark-circle" size={28} color="white" />
                                <Text className="text-white font-semibold mt-2">Completed</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className={`py-4 rounded-xl ${isDark ? 'bg-[#333333]' : 'bg-gray-100'}`}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {isLoading && (
                <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                </View>
            )}
        </SafeAreaView>
    )
}

export default DisplayTracker