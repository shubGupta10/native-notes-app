import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View,  Platform, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';

const { width } = Dimensions.get('window');

function TabLayout() {
    const getTabBarIcon = (iconLibrary: any, iconName: string, focused: boolean) => (
        <View className="flex items-center justify-center">
            <Animated.View className={`${focused ? 'bg-white' : ''} rounded-full`}>
                {React.createElement(iconLibrary, {
                    name: iconName,
                    color: focused ? "#2563EB" : "#64748B",
                    size: focused ? 24 : 22,
                })}
            </Animated.View>
        </View>
    );

    // Calculate tab width based on screen width
    const tabWidth = Math.min(width / 3, 120);

    return (
        <View style={{ flex: 1 }} className="bg-gray-50">
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: "#2563EB",
                    tabBarInactiveTintColor: "#64748B",
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginTop: 0,
                        marginBottom: Platform.OS === 'ios' ? 5 : 5,
                    },
                    tabBarStyle: {
                        backgroundColor: "#FFFFFF",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: Platform.OS === 'ios' ? 90 : 80,
                        paddingTop: 12,
                        paddingBottom: 0, // Removed bottom padding
                        borderTopWidth: 0,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: -3,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    },
                    tabBarItemStyle: {
                        width: tabWidth,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Adjusted for iOS safe area
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
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ focused }) =>  getTabBarIcon(Feather, "user", focused),
                    }}
                />
            </Tabs>
        </View>
    );
}

export default TabLayout;