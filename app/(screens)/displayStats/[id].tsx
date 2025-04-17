import { Text, View, TouchableOpacity, ScrollView, useColorScheme, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchStats } from "@/lib/appwrite";
import { appColors } from "@/lib/appColors";
import { Picker } from '@react-native-picker/picker';
import AuthWrapper from '@/components/AuthWrapper';

interface StatsData {
    total: number;
    success: number;
    missed: number;
    successPercentage: number;
    missedPercentage: number;
}

function DisplayStats() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? appColors.dark : appColors.light;

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

            if (result && result.success === true && result.data) {
                setStats(result.data);
            } else {
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

    // Create styles with the current theme colors
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background
        },
        card: {
            backgroundColor: colors.card,
            borderColor: colors.border
        },
        primaryText: {
            color: colors.text.primary
        },
        secondaryText: {
            color: colors.text.secondary
        },
        tertiaryText: {
            color: colors.text.tertiary
        },
        accentButton: {
            backgroundColor: colors.accent.primary
        },
        successText: {
            color: colors.status.success
        },
        warningText: {
            color: colors.status.warning
        },
        errorText: {
            color: colors.status.error
        },
        successBg: {
            backgroundColor: colors.status.success
        },
        successBgLight: {
            backgroundColor: `${colors.status.success}20` // 20 is hex for 12% opacity
        },
        errorBgLight: {
            backgroundColor: `${colors.status.error}20`
        },
        border: {
            borderColor: colors.border
        },
        progressBg: {
            backgroundColor: colors.border
        }
    });

    return (
        <AuthWrapper redirectToLogin={true}>
            <SafeAreaView style={styles.container}>
                <ScrollView className="flex-1 px-4 py-4">
                    <View className="mb-6">
                        <Text style={styles.primaryText} className="text-2xl font-bold">
                            Stats for Tracker
                        </Text>
                        <Text style={styles.tertiaryText} className="text-sm mt-1">
                            ID: {id}
                        </Text>
                    </View>

                    <View style={styles.card} className="rounded-xl p-4 mb-4 border shadow">
                        <Text style={styles.primaryText} className="text-base font-medium mb-2">
                            Select Month
                        </Text>
                        <View style={[styles.card, styles.border]} className="rounded-lg mb-4 border">
                            <Picker
                                selectedValue={selectedMonth}
                                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                                dropdownIconColor={colors.text.primary}
                                style={{ color: colors.text.primary }}
                            >
                                {months.map((month, index) => (
                                    <Picker.Item 
                                        key={index} 
                                        label={month} 
                                        value={index} 
                                        color={colors.text.primary}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <TouchableOpacity
                            style={styles.accentButton}
                            className="rounded-lg py-3 items-center"
                            onPress={getStats}
                        >
                            <Text className="text-white text-base font-semibold">
                                Refresh Stats
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <View className="items-center justify-center py-4 mb-4">
                            <Text style={styles.secondaryText} className="text-base">
                                Loading stats...
                            </Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorBgLight} className="items-center justify-center py-4 mb-4 rounded-lg">
                            <Text style={styles.errorText} className="text-base">
                                {error}
                            </Text>
                        </View>
                    )}

                    {stats && !loading && !error && (
                        <>
                            <View style={styles.card} className="rounded-xl p-4 mb-4 border shadow">
                                <Text style={styles.primaryText} className="text-lg font-bold mb-4">
                                    Monthly Summary
                                </Text>

                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="items-center flex-1 py-3">
                                        <Text style={styles.primaryText} className="text-2xl font-bold">
                                            {stats.total}
                                        </Text>
                                        <Text style={styles.tertiaryText} className="text-sm mt-1">
                                            Total
                                        </Text>
                                    </View>

                                    <View style={styles.border} className="items-center flex-1 py-3 border-x">
                                        <Text style={styles.successText} className="text-2xl font-bold">
                                            {stats.success}
                                        </Text>
                                        <Text style={styles.tertiaryText} className="text-sm mt-1">
                                            Success
                                        </Text>
                                    </View>

                                    <View className="items-center flex-1 py-3">
                                        <Text style={styles.errorText} className="text-2xl font-bold">
                                            {stats.missed}
                                        </Text>
                                        <Text style={styles.tertiaryText} className="text-sm mt-1">
                                            Missed
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {stats.total > 0 && (
                                <>
                                    <View style={styles.card} className="rounded-xl p-4 mb-4 border shadow">
                                        <Text style={styles.primaryText} className="text-lg font-bold mb-4">
                                            Success Rate
                                        </Text>

                                        <View className="flex-row justify-around mb-4">
                                            <View style={styles.successBgLight} className="w-5/12 p-4 rounded-xl">
                                                <Text style={styles.successText} className="text-3xl font-bold text-center">
                                                    {stats.successPercentage.toFixed(1)}%
                                                </Text>
                                                <Text style={styles.secondaryText} className="text-sm mt-1 text-center">
                                                    Success
                                                </Text>
                                            </View>

                                            <View style={styles.errorBgLight} className="w-5/12 p-4 rounded-xl">
                                                <Text style={styles.errorText} className="text-3xl font-bold text-center">
                                                    {stats.missedPercentage.toFixed(1)}%
                                                </Text>
                                                <Text style={styles.secondaryText} className="text-sm mt-1 text-center">
                                                    Missed
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mt-4 mb-2">
                                            <Text style={styles.secondaryText} className="text-sm font-medium mb-1">
                                                Success Progress
                                            </Text>
                                            <View style={styles.progressBg} className="h-4 w-full rounded-full overflow-hidden">
                                                <View
                                                    style={[styles.successBg, { width: `${stats.successPercentage}%` }]}
                                                    className="h-full"
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.card} className="rounded-xl p-4 mb-4 border shadow">
                                        <Text style={styles.primaryText} className="text-lg font-bold mb-4">
                                            Performance Score
                                        </Text>

                                        <View className="items-center">
                                            <View 
                                                style={{
                                                    borderColor: stats.successPercentage >= 80
                                                        ? colors.status.success
                                                        : stats.successPercentage >= 50
                                                            ? colors.status.warning
                                                            : colors.status.error,
                                                    borderWidth: 4
                                                }}
                                                className="w-32 h-32 rounded-full items-center justify-center"
                                            >
                                                <Text 
                                                    style={{
                                                        color: stats.successPercentage >= 80
                                                            ? colors.status.success
                                                            : stats.successPercentage >= 50
                                                                ? colors.status.warning
                                                                : colors.status.error
                                                    }}
                                                    className="text-4xl font-bold"
                                                >
                                                    {Math.round(stats.successPercentage)}%
                                                </Text>
                                            </View>

                                            <Text 
                                                style={{
                                                    color: stats.successPercentage >= 80
                                                        ? colors.status.success
                                                        : stats.successPercentage >= 50
                                                            ? colors.status.warning
                                                            : colors.status.error
                                                }}
                                                className="text-base mt-4 font-medium"
                                            >
                                                {stats.successPercentage >= 80
                                                    ? 'Excellent'
                                                    : stats.successPercentage >= 50
                                                        ? 'Good Progress'
                                                        : 'Needs Improvement'}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}

                            {stats.total === 0 && (
                                <View style={styles.card} className="rounded-xl p-4 mb-4 border shadow">
                                    <Text style={styles.secondaryText} className="text-center text-base py-5">
                                        No data available for {months[selectedMonth]}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.card} className="rounded-xl p-4 mb-4 border shadow">
                                <Text style={styles.primaryText} className="text-lg font-bold mb-4">
                                    Performance Insight
                                </Text>
                                <Text style={styles.secondaryText} className="text-base leading-6">
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
        </AuthWrapper>
    );
};

export default DisplayStats;