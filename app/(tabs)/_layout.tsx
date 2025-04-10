import { Tabs } from 'expo-router';
import { Home, PlusIcon, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

function TabLayout() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        backgroundColor: "#fff",
                        borderRadius: 50,
                        marginHorizontal: 20,
                        marginBottom: 36,
                        height: 70,
                        position: "fixed",
                        borderWidth: 1,
                        borderColor: "#0F0D23",
                    },
                    tabBarItemStyle: {
                        width: 80,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <View className='flex-1 justify-center items-center'>
                                <Home color={focused ? "#2563EB" : "#9CA3AF"} size={22} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="create"
                    options={{
                        title: "Create",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <View className='flex-1 justify-center items-center'>
                                <PlusIcon color={focused ? "#2563EB" : "#9CA3AF"} size={22} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        headerShown: false,
                        title: "Profile",
                        tabBarIcon: ({ focused }) => (
                            <View className='flex-1 justify-center items-center'>
                                <User color={focused ? "#2563EB" : "#9CA3AF"} size={22} />
                            </View>
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}

export default TabLayout;