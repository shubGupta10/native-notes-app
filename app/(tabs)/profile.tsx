import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { 
    ArrowRight, 
    Bell, 
    Calendar, 
    Edit2, 
    LogOut, 
    Wallet, 
    UserCheck
} from 'lucide-react-native';
import { useRouter } from "expo-router";
import AuthWrapper from "@/components/AuthWrapper";

interface SettingsItemProp {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
}

const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    textStyle,
    showArrow = true,
}: SettingsItemProp) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex flex-row items-center justify-between py-4 border-b border-gray-100"
    >
        <View className="flex flex-row items-center gap-4">
            <View className="bg-gray-50 p-2 rounded-full">
                {icon}
            </View>
            <View>
                <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-sm text-gray-500">{subtitle}</Text>
                )}
            </View>
        </View>

        {showArrow && <ArrowRight size={20} color="#718096" />}
    </TouchableOpacity>
);

const Profile = () => {
    const { user, logout: storeLogout, loading, fetchUser } = useAuthStore();
    const router = useRouter();
    const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                await fetchUser();
            } catch (error) {
                console.log("Error fetching user:", error);
            } finally {
                setIsInitiallyLoading(false);
            }
        };

        checkUserStatus();
    }, []);

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            
            return `${month} ${day}, ${year}`;
        } catch (error) {
            return dateString;
        }
    };

    const handleLogout = async () => {
        try {
            const success = await storeLogout();
            if (success) {
                Alert.alert("Success", "Logged out successfully");
            } else {
                Alert.alert("Error", "Failed to logout");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to logout");
        }
    };

    const handleNavigateToLogin = () => {
        router.push('/login');
    };

    // Show loading indicator while initially checking authentication
    if (isInitiallyLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#000" />
                <Text className="mt-2 text-black">Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <AuthWrapper redirectToLogin={true}>
                <View className="flex-1 justify-center items-center bg-white">
                    <Text className="text-xl font-rubik-bold mb-4">Please log in to view your profile</Text>
                    <TouchableOpacity 
                        onPress={handleNavigateToLogin}
                        className="flex-row items-center bg-black py-3 px-6 rounded-full"
                    >
                        <LogOut size={20} color="#FFF" />
                        <Text className="text-white ml-2 font-rubik-medium">Log In</Text>
                    </TouchableOpacity>
                </View>
            </AuthWrapper>
        );
    }

    // Show profile if user is logged in
    return (
        <SafeAreaView className="h-full bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="flex flex-row items-center justify-between px-4 py-4">
                    <Text className="text-2xl font-rubik-bold">My Profile</Text>
                    <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
                        <Bell size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View className="bg-gray-50 rounded-3xl mx-4 p-6 mb-6">
                    <View className="flex flex-row items-center">
                        <View className="relative">
                            <Image
                                source={{ uri: user.avatar }}
                                className="w-24 h-24 rounded-full"
                            />
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-200">
                                <Edit2 size={16} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-2xl font-rubik-bold">{user.name}</Text>
                            <Text className="text-gray-500">{user.email}</Text>
                            <View className="flex-row items-center mt-1">
                                <UserCheck size={14} color={user?.emailVerification ? "#10B981" : "#EF4444"} />
                                <Text className="text-xs ml-1 text-gray-500">
                                    {user?.emailVerification ? "Verified" : "Not Verified"}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="mt-4 pt-4 border-t border-gray-200">
                        <Text className="text-gray-500 text-sm">
                            Member since {user.registration ? formatDate(user.registration) : "N/A"}
                        </Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <View className="px-4">
                    <Text className="text-lg font-rubik-medium mb-2 text-gray-600">Activities</Text>
                    <View className="bg-white rounded-xl overflow-hidden mb-6">
                        <SettingsItem
                            icon={<Calendar size={20} color="#4F46E5" />}
                            title="My Notes"
                            subtitle="Create and view your notes"
                            onPress={() => router.push('/create')}
                        />
                        <SettingsItem
                            icon={<Wallet size={20} color="#4F46E5" />}
                            title="Home"
                            subtitle="Return to home screen"
                            onPress={() => router.push('/')}
                        />
                        <SettingsItem
                            icon={<LogOut size={20} color="#EF4444" />}
                            title="Logout"
                            subtitle="Sign out from your account"
                            textStyle="text-red-500"
                            showArrow={false}
                            onPress={handleLogout}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;