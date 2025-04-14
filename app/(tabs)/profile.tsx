import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import AuthWrapper from "@/components/AuthWrapper";
import { appColors } from "@/lib/appColors";


interface SettingsItemProp {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
}

const Profile = () => {
    const { user, logout: storeLogout, loading, fetchUser } = useAuthStore();
    const router = useRouter();
    const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = appColors[theme];

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
            className="flex flex-row items-center justify-between py-4 border-b"
            style={{ borderBottomColor: colors.border }}
        >
            <View className="flex flex-row items-center gap-4">
                <View className="p-2 rounded-full" style={{ backgroundColor: colors.card }}>
                    {icon}
                </View>
                <View>
                    <Text
                        className="text-lg font-rubik-medium"
                        style={{
                            color: textStyle?.includes('text-red-500') ? colors.status.error : colors.text.primary
                        }}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={{ color: colors.text.tertiary }} className="text-sm">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            {showArrow && <Feather name="chevron-right" size={16} color={colors.text.tertiary} />}
        </TouchableOpacity>
    );

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
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.accent.primary} />
                <Text className="mt-2" style={{ color: colors.text.primary }}>Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <AuthWrapper redirectToLogin={true}>
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                    <Text className="text-xl font-rubik-bold mb-4" style={{ color: colors.text.primary }}>
                        Please log in to view your profile
                    </Text>
                    <TouchableOpacity
                        onPress={handleNavigateToLogin}
                        className="flex-row items-center py-3 px-6 rounded-full"
                        style={{ backgroundColor: colors.accent.primary }}
                    >
                        <Feather name="log-in" size={20} color="#FFFFFF" />
                        <Text className="ml-2 font-rubik-medium text-white">Log In</Text>
                    </TouchableOpacity>
                </View>
            </AuthWrapper>
        );
    }

    // Show profile if user is logged in
    return (
        <SafeAreaView className="h-full" style={{ backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="flex flex-row items-center justify-between px-4 py-4">
                    <Text className="text-2xl font-rubik-bold" style={{ color: colors.text.primary }}>
                        My Profile
                    </Text>
                    <TouchableOpacity className="p-2 rounded-full" style={{ backgroundColor: colors.card }}>
                        <Feather name="bell" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View className="rounded-3xl mx-4 p-6 mb-6" style={{ backgroundColor: colors.card }}>
                    <View className="flex flex-row items-center">
                        <View className="relative">
                            <Image
                                source={{ uri: user.avatar }}
                                className="w-24 h-24 rounded-full"
                            />
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 p-1 rounded-full border"
                                style={{
                                    backgroundColor: colors.background,
                                    borderColor: colors.border
                                }}
                            >
                                <Feather name="edit-2" size={16} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-2xl font-rubik-bold" style={{ color: colors.text.primary }}>
                                {user.name}
                            </Text>
                            <Text style={{ color: colors.text.secondary }}>{user.email}</Text>
                            <View className="flex-row items-center mt-1">
                                <Feather
                                    name={user?.emailVerification ? "check-circle" : "x-circle"}
                                    size={14}
                                    color={user?.emailVerification ? colors.status.success : colors.status.error}
                                />
                                <Text className="text-xs ml-1" style={{ color: colors.text.tertiary }}>
                                    {user?.emailVerification ? "Verified" : "Not Verified"}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View
                        className="mt-4 pt-4 border-t"
                        style={{ borderTopColor: colors.border }}
                    >
                        <Text className="text-sm" style={{ color: colors.text.tertiary }}>
                            Member since {user.registration ? formatDate(user.registration) : "N/A"}
                        </Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <View className="px-4">
                    <Text className="text-lg font-rubik-medium mb-2" style={{ color: colors.text.secondary }}>
                        Activities
                    </Text>
                    <View className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: colors.card }}>
                        <SettingsItem
                            icon={<Feather name="calendar" size={20} color={colors.accent.primary} />}
                            title="My Notes"
                            subtitle="Create and view your notes"
                            onPress={() => router.push('/')}
                        />

                        <SettingsItem
                            icon={<Feather name="plus" size={20} color={colors.accent.primary} />}
                            title="Create"
                            subtitle="Create new note"
                            onPress={() => router.push('/create')}
                        />

                        <SettingsItem
                            icon={<Feather name="log-out" size={20} color={colors.status.error} />}
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