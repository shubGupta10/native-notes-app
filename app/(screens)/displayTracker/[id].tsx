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
import {MarkedDates, TrackerData, EntryStatus} from "@/types/trackerTypes";



const DisplayTracker = () => {
    const { id } = useLocalSearchParams()
    const { user } = useAuthStore()
    const userId = user?.$id || ''
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'

    const [markedDates, setMarkedDates] = useState<MarkedDates>({})
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [currentStatus, setCurrentStatus] = useState<EntryStatus | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [trackerData, setTrackerData] = useState<TrackerData | null>(null)
    const [totalCompleted, setTotalCompleted] = useState(0)
    const [totalMissed, setTotalMissed] = useState(0)

    const colors = isDark ? appColors.dark : appColors.light
    const successColor = isDark ? colors.status.success : '#10B981'
    const errorColor = isDark ? colors.status.error : '#EF4444'
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

            // @ts-ignore
            entries.documents.forEach((entry: { date: string, status: boolean }) => {
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
            setIsLoading(false)
        } catch (error) {
            console.error("Fetch All Entries Error:", error)
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

            setModalVisible(false)
            setIsLoading(false)

            // Update completed/missed counts
            if (currentStatus?.status !== status) {
                if (status) {
                    setTotalCompleted(prev => prev + 1)
                    if (currentStatus?.entryId) setTotalMissed(prev => prev - 1)
                } else {
                    setTotalMissed(prev => prev + 1)
                    if (currentStatus?.entryId) setTotalCompleted(prev => prev - 1)
                }
            } else if (!currentStatus?.entryId) {
                if (status) {
                    setTotalCompleted(prev => prev + 1)
                } else {
                    setTotalMissed(prev => prev + 1)
                }
            }

        } catch (error) {
            console.error("Status Update Error:", error)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (id && userId) {
            fetchTrackerData()
            fetchAllEntries()
        }
    }, [id, userId, colorScheme])

    const formattedDate = trackerData?.createdAt
        ? format(new Date(trackerData.createdAt), 'MMMM dd, yyyy')
        : null

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <ScrollView>
                {/* Header with back button */}
                <View className="px-4 pt-2 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className={`p-2 rounded-full ${isDark ? 'bg-[#333333]' : 'bg-gray-100'}`}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={isDark ? colors.text.primary : colors.text.primary}
                        />
                    </TouchableOpacity>

                    <Text className={`text-xl font-bold ml-4 flex-1 ${isDark ? 'text-white' : 'text-black'}`}>
                        Habit Tracker
                    </Text>
                </View>

                {/* Tracker Info Card */}
                <View className={`mx-4 mt-4 p-4 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                    {isLoading && !trackerData ? (
                        <ActivityIndicator color={colors.accent.primary} />
                    ) : (
                        <>
                            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                {trackerData?.name || 'Loading tracker...'}
                            </Text>

                            {trackerData?.description && (
                                <Text className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {trackerData.description}
                                </Text>
                            )}

                            <View className="flex-row items-center mt-3">
                                <Ionicons
                                    name="person-outline"
                                    size={16}
                                    color={isDark ? colors.text.secondary : colors.text.secondary}
                                />
                                <Text className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {user?.name || 'User'}
                                </Text>

                                {formattedDate && (
                                    <>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color={isDark ? colors.text.secondary : colors.text.secondary}
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

                {/* Stats Card */}
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

                {/* Calendar Card */}
                <View className={`mx-4 mb-6 p-4 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                    <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                        Tracking Calendar
                    </Text>

                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        theme={{
                            calendarBackground: isDark ? '#1E1E1E' : '#F9FAFB',
                            textSectionTitleColor: isDark ? colors.text.primary : colors.text.primary,
                            textSectionTitleDisabledColor: isDark ? colors.text.tertiary : colors.text.tertiary,
                            selectedDayBackgroundColor: isDark ? colors.accent.primary : colors.accent.primary,
                            selectedDayTextColor: textColor,
                            todayTextColor: isDark ? colors.accent.primary : colors.accent.primary,
                            dayTextColor: isDark ? colors.text.primary : colors.text.primary,
                            textDisabledColor: isDark ? colors.text.tertiary : colors.text.tertiary,
                            dotColor: isDark ? colors.accent.primary : colors.accent.primary,
                            selectedDotColor: textColor,
                            arrowColor: isDark ? colors.accent.primary : colors.accent.primary,
                            disabledArrowColor: isDark ? colors.text.tertiary : colors.text.tertiary,
                            monthTextColor: isDark ? colors.text.primary : colors.text.primary,
                            indicatorColor: isDark ? colors.accent.primary : colors.accent.primary,
                        }}
                    />

                    <View className="flex-row mt-4 justify-center">
                        <View className="flex-row items-center mr-4">
                            <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Completed
                            </Text>
                        </View>

                        <View className="flex-row items-center ml-4">
                            <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Missed
                            </Text>
                        </View>
                    </View>
                </View>

                {/* How It Works Section */}
                <View className={`mx-4 mb-8 p-4 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} shadow`}>
                    <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                        How It Works
                    </Text>

                    <View className="ml-1 mb-2">
                        <View className="flex-row items-center mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>1.</Text>
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Tap any date on the calendar to log your progress
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>2.</Text>
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Select "Completed" if you succeeded with your habit
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>3.</Text>
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Select "Missed" if you didn't complete your habit
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>4.</Text>
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Green dates show successful days, red dates show missed days
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Text className={`mr-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}>5.</Text>
                            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Track your progress with the completion stats above
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Status Update Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black bg-opacity-50">
                    <View className={`${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} rounded-t-3xl p-6 shadow-lg`}>
                        <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                            Update Status
                        </Text>

                        <Text className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedDate ? `How did you do on ${format(new Date(selectedDate), 'MMMM dd, yyyy')}?` : 'Select a date'}
                        </Text>

                        <View className="flex-row justify-between mb-6">
                            <TouchableOpacity
                                className="py-4 px-6 rounded-xl bg-red-500 flex-1 mr-2 items-center shadow"
                                onPress={() => handleStatusUpdate(false)}
                                disabled={isLoading}
                            >
                                <Ionicons name="close-circle" size={28} color="white" />
                                <Text className="text-white font-semibold mt-2">Missed</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="py-4 px-6 rounded-xl bg-green-500 flex-1 ml-2 items-center shadow"
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
                <View className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                </View>
            )}
        </SafeAreaView>
    )
}

export default DisplayTracker