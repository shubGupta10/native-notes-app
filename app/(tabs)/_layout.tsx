import React from "react"
import { Tabs } from "expo-router"
import { Ionicons, Feather } from "@expo/vector-icons"
import { View, Platform, Dimensions, useColorScheme } from "react-native"
import Animated from "react-native-reanimated"
import {appColors} from "@/lib/appColors";

const { width } = Dimensions.get("window")

function TabLayout() {
    const colorScheme = useColorScheme()
    const isDarkMode = colorScheme === "dark"
    const colors = isDarkMode ? appColors.dark : appColors.light

    const getTabBarIcon = (iconLibrary: any, iconName: string, focused: boolean) => (
        <View className="flex items-center justify-center">
            <Animated.View className={`${focused ? "bg-white dark:bg-gray-800" : ""} rounded-full p-1`}>
                {React.createElement(iconLibrary, {
                    name: iconName,
                    color: focused ? colors.accent.secondary : colors.text.tertiary,
                    size: focused ? 24 : 22,
                })}
            </Animated.View>
        </View>
    )

    // Calculate tab width based on screen width - corrected for 4 tabs
    const tabWidth = Math.min(width / 4, 100)

    return (
        <View style={{ flex: 1 }} className="bg-gray-50 dark:bg-black">
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: colors.accent.secondary,
                    tabBarInactiveTintColor: colors.text.tertiary,
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: "500",
                        marginTop: 0,
                        marginBottom: Platform.OS === "ios" ? 5 : 5,
                    },
                    tabBarStyle: {
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: Platform.OS === "ios" ? 90 : 80,
                        paddingTop: 12,
                        paddingBottom: 0,
                        borderTopWidth: 1,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border,
                        shadowColor: colors.shadow.color,
                        shadowOffset: {
                            width: 0,
                            height: -3,
                        },
                        shadowOpacity: colors.shadow.opacity,
                        shadowRadius: 8,
                        elevation: 8,
                    },
                    tabBarItemStyle: {
                        width: tabWidth,
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingBottom: Platform.OS === "ios" ? 20 : 0,
                        borderRightWidth: 0.5,
                        borderRightColor: colors.border,
                    },
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ focused }) => getTabBarIcon(Ionicons, "home", focused),
                    }}
                />
                <Tabs.Screen
                    name="create"
                    options={{
                        title: "Create",
                        tabBarIcon: ({ focused }) => getTabBarIcon(Feather, "plus-circle", focused),
                        tabBarItemStyle: {
                            width: tabWidth,
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingBottom: Platform.OS === "ios" ? 20 : 0,
                            borderRightWidth: 0.5,
                            borderRightColor: colors.border,
                            borderLeftWidth: 0.5,
                            borderLeftColor: colors.border,
                        },
                    }}
                />
                <Tabs.Screen
                    name="tracker"
                    options={{
                        title: "Tracker",
                        tabBarIcon: ({ focused }) => getTabBarIcon(Feather, "target", focused),
                        tabBarItemStyle: {
                            width: tabWidth,
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingBottom: Platform.OS === "ios" ? 20 : 0,
                            borderRightWidth: 0.5,
                            borderRightColor: colors.border,
                        },
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ focused }) => getTabBarIcon(Feather, "user", focused),
                        tabBarItemStyle: {
                            width: tabWidth,
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingBottom: Platform.OS === "ios" ? 20 : 0,
                            borderRightWidth: 0,
                        },
                    }}
                />
            </Tabs>
        </View>
    )
}

export default TabLayout
