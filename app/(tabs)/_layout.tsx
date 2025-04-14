import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View, Platform, Dimensions, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';

const { width } = Dimensions.get('window');

function TabLayout() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const getTabBarIcon = (iconLibrary: any, iconName: string, focused: boolean) => (
        <View className="flex items-center justify-center">
            <Animated.View className={`${focused ? 'bg-white dark:bg-gray-800' : ''} rounded-full p-1`}>
                {React.createElement(iconLibrary, {
                    name: iconName,
                    color: focused ? (isDarkMode ? "#60A5FA" : "#2563EB") : (isDarkMode ? "#9CA3AF" : "#64748B"),
                    size: focused ? 24 : 22,
                })}
            </Animated.View>
        </View>
    );

    // Calculate tab width based on screen width
    const tabWidth = Math.min(width / 3, 120);

    return (
        <View style={{ flex: 1 }} className="bg-gray-50 dark:bg-black">
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: isDarkMode ? "#60A5FA" : "#2563EB",
                    tabBarInactiveTintColor: isDarkMode ? "#9CA3AF" : "#64748B",
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginTop: 0,
                        marginBottom: Platform.OS === 'ios' ? 5 : 5,
                    },
                    tabBarStyle: {
                        backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: Platform.OS === 'ios' ? 90 : 80,
                        paddingTop: 12,
                        paddingBottom: 0,
                        // Enhanced border styling
                        borderTopWidth: 1,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderColor: isDarkMode ? "#333333" : "#E5E7EB",
                        shadowColor: isDarkMode ? "#000" : "#000",
                        shadowOffset: {
                            width: 0,
                            height: -3,
                        },
                        shadowOpacity: isDarkMode ? 0.3 : 0.1,
                        shadowRadius: 8,
                        elevation: 8, // Added for Android shadow
                    },
                    tabBarItemStyle: {
                        width: tabWidth,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                        // Add subtle division between tabs
                        borderRightWidth: 0.5,
                        borderRightColor: isDarkMode ? "#333333" : "#E5E7EB",
                    },
                    headerShown: false,
                }}
                screenListeners={{
                    tabPress: (e) => {
                        // Add haptic feedback here if needed
                    },
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
                        // Remove right border for middle tab
                        tabBarItemStyle: {
                            width: tabWidth,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                            borderRightWidth: 0.5,
                            borderRightColor: isDarkMode ? "#333333" : "#E5E7EB",
                            borderLeftWidth: 0.5,
                            borderLeftColor: isDarkMode ? "#333333" : "#E5E7EB",
                        }
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ focused }) => getTabBarIcon(Feather, "user", focused),
                        // Remove right border for last tab
                        tabBarItemStyle: {
                            width: tabWidth,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                            borderRightWidth: 0,
                        }
                    }}
                />
            </Tabs>
        </View>
    );
}

export default TabLayout;