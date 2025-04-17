import { Text, View, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchStats } from "@/lib/appwrite";
import { appColors } from "@/lib/appColors";
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Define the StatsData interface to match the expected data structure
interface StatsData {
    total: number;
    success: number;
    missed: number;
    successPercentage: number;
    missedPercentage: number;
}

const DisplayStats = () => {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getStats = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await fetchStats(id.toString(), selectedMonth);

            // Check if a result exists and has the success property
            if (result && result.success === true && result.data) {
                setStats(result.data);
            } else {
                // Handle the error case
                setError(result && 'message' in result ? result.message : 'Failed to fetch statistics');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStats();
    }, [id, selectedMonth]);

    const chartData = stats ? [
        {
            name: 'Success',
            population: stats.success,
            color: isDark ? appColors.dark.status.success : appColors.light.status.success,
            legendFontColor: isDark ? appColors.dark.text.primary : appColors.light.text.primary,
        },
        {
            name: 'Missed',
            population: stats.missed,
            color: isDark ? appColors.dark.status.error : appColors.light.status.error,
            legendFontColor: isDark ? appColors.dark.text.primary : appColors.light.text.primary,
        }
    ] : [];

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <ScrollView className="flex-1 px-4 py-4">
                <View className="mb-6">
                    <Text className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        Stats for Tracker
                    </Text>
                    <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        ID: {id}
                    </Text>
                </View>

                <View
                    className={`rounded-xl p-4 mb-4 border shadow
                    ${isDark ? 'bg-[#1E1E1E] border-[#333333]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                >
                    <Text className={`text-base font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        Select Month
                    </Text>
                    <View
                        className={`rounded-lg mb-4 border
                        ${isDark ? 'border-[#333333]' : 'border-[#E5E7EB]'}`}
                    >
                        <Picker
                            selectedValue={selectedMonth}
                            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                            style={{
                                color: isDark ? appColors.dark.text.primary : appColors.light.text.primary,
                                height: 60
                            }}
                            dropdownIconColor={isDark ? appColors.dark.accent.primary : appColors.light.accent.primary}
                        >
                            {months.map((month, index) => (
                                <Picker.Item key={index} label={month} value={index} />
                            ))}
                        </Picker>
                    </View>

                    <TouchableOpacity
                        className={`rounded-lg py-3 items-center
                        ${isDark ? 'bg-[#60A5FA]' : 'bg-[#3B82F6]'}`}
                        onPress={getStats}
                    >
                        <Text className="text-white text-base font-semibold">
                            Refresh Stats
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View className="items-center justify-center py-4 mb-4">
                        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            Loading stats...
                        </Text>
                    </View>
                )}

                {error && (
                    <View
                        className={`items-center justify-center py-4 mb-4 rounded-lg
                        ${isDark ? 'bg-opacity-20 bg-red-500' : 'bg-opacity-10 bg-red-500'}`}
                    >
                        <Text className={`text-base ${isDark ? 'text-red-300' : 'text-red-500'}`}>
                            {error}
                        </Text>
                    </View>
                )}

                {stats && !loading && !error && (
                    <>
                        <View
                            className={`rounded-xl p-4 mb-4 border shadow
                            ${isDark ? 'bg-[#1E1E1E] border-[#333333]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                        >
                            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                Monthly Summary
                            </Text>

                            <View className="flex-row justify-between mt-2">
                                <View className="items-center flex-1">
                                    <Text className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {stats.total}
                                    </Text>
                                    <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Total Entries
                                    </Text>
                                </View>

                                <View className="items-center flex-1">
                                    <Text className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        {stats.success}
                                    </Text>
                                    <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Successful
                                    </Text>
                                </View>

                                <View className="items-center flex-1">
                                    <Text className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                        {stats.missed}
                                    </Text>
                                    <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Missed
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            className={`rounded-xl p-4 mb-4 border shadow
                            ${isDark ? 'bg-[#1E1E1E] border-[#333333]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                        >
                            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                Success Rate
                            </Text>

                            {stats.total > 0 ? (
                                <>
                                    <View className="flex-row justify-around mb-4">
                                        <View className="items-center">
                                            <Text className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                                {stats.successPercentage.toFixed(1)}%
                                            </Text>
                                            <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                                Success Rate
                                            </Text>
                                        </View>

                                        <View className="items-center">
                                            <Text className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                                {stats.missedPercentage.toFixed(1)}%
                                            </Text>
                                            <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                                Missed Rate
                                            </Text>
                                        </View>
                                    </View>

                                    {stats.total >= 2 && (
                                        <View className="items-center mt-4">
                                            <PieChart
                                                data={chartData}
                                                width={Dimensions.get('window').width - 60}
                                                height={180}
                                                chartConfig={{
                                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                                    labelColor: (opacity = 1) => isDark ?
                                                        appColors.dark.text.primary :
                                                        appColors.light.text.primary,
                                                }}
                                                accessor="population"
                                                backgroundColor="transparent"
                                                paddingLeft="15"
                                                absolute
                                            />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <Text
                                    className={`text-center text-base py-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                    No data available for {months[selectedMonth]}
                                </Text>
                            )}
                        </View>

                        <View
                            className={`rounded-xl p-4 mb-4 border shadow
                            ${isDark ? 'bg-[#1E1E1E] border-[#333333]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                        >
                            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                Performance Insight
                            </Text>
                            <Text className={`text-base leading-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {stats.total === 0 ?
                                    `You don't have any recorded entries for ${months[selectedMonth]}.` :
                                    stats.successPercentage >= 80 ?
                                        `Great job! You've maintained a ${stats.successPercentage.toFixed(1)}% success rate in ${months[selectedMonth]}.` :
                                        stats.successPercentage >= 50 ?
                                            `You're doing well with a ${stats.successPercentage.toFixed(1)}% success rate in ${months[selectedMonth]}. Keep improving!` :
                                            `You've had some challenges in ${months[selectedMonth]} with a ${stats.successPercentage.toFixed(1)}% success rate. Let's work on improving!`
                                }
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default DisplayStats;