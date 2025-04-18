import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    useColorScheme,
    Modal,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {ReactNode, useEffect, useState} from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import AuthWrapper from "@/components/AuthWrapper";
import { appColors } from "@/lib/appColors";
import { StatusBar } from "expo-status-bar";
import EditProfileModal from "@/components/EditProfileModal";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";

interface SettingsItemProp {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
    iconBgColor?: string;
}

const Profile = () => {
    const { user, logout: storeLogout, loading, fetchUser } = useAuthStore();
    const router = useRouter();
    const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? appColors.dark : appColors.light;

    // Modal states
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);

    // Stats for display
    const [stats, setStats] = useState({
        totalNotes: 0,
        activeHabits: 0,
        streakDays: 0
    });

    // Fetch initial data
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

    const SettingsItem = ({
                              icon,
                              title,
                              subtitle,
                              onPress,
                              textStyle,
                              showArrow = true,
                              iconBgColor
                          }: SettingsItemProp) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex flex-row items-center justify-between py-4 px-4 border-b"
            style={{ borderBottomColor: colors.border }}
        >
            <View className="flex flex-row items-center gap-4">
                <View
                    className="p-2 rounded-full"
                    style={{
                        backgroundColor: iconBgColor || colors.card,
                        opacity: iconBgColor ? 0.2 : 1
                    }}
                >
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
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
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
                    }
                }
            ]
        );
    };

    const handleNavigateToLogin = () => {
        router.push('/login');
    };

    const handleEditProfile = () => {
        setIsEditModalVisible(true);
    };

    const handleProfileUpdate = async () => {
        try {
            await fetchUser();
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        }
    };

    // Show a loading indicator while initially checking authentication
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
                    <StatusBar style={isDark ? "light" : "dark"} />
                    <Image
                        source={require('@/assets/images/home-image.png')}
                        className="w-32 h-32 mb-4"
                    />
                    <Text className="text-xl font-rubik-bold mb-2" style={{ color: colors.text.primary }}>
                        Not Logged In
                    </Text>
                    <Text className="text-center mb-6 px-8" style={{ color: colors.text.secondary }}>
                        Please log in to view your profile and access all features
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
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="flex flex-row items-center justify-between px-5 py-4">
                    <Text className="text-2xl font-rubik-bold" style={{ color: colors.text.primary }}>
                        My Profile
                    </Text>
                    <View className="flex-row">
                        <TouchableOpacity
                            className="p-2 rounded-full mr-2"
                            style={{ backgroundColor: colors.card }}
                            onPress={() => Alert.alert("Settings", "Settings page coming soon!")}
                        >
                            <Feather name="settings" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2 rounded-full"
                            style={{ backgroundColor: colors.card }}
                            onPress={() => Alert.alert("Notifications", "No new notifications")}
                        >
                            <Feather name="bell" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Card */}
                <View className="rounded-3xl mx-4 overflow-hidden mb-6" style={{ backgroundColor: colors.card }}>
                    {/* Header Banner */}
                    <View className="h-24" style={{ backgroundColor: colors.accent.light }}>
                        <TouchableOpacity
                            className="absolute top-3 right-3 p-2 rounded-full"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            onPress={handleEditProfile}
                        >
                            <Feather name="edit" size={16} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Info */}
                    <View className="px-6 pb-6">
                        <View className="flex flex-row items-end relative -top-12 mb-2">
                            <View className="relative">
                                <Image
                                    source={{ uri: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) }}
                                    className="w-24 h-24 rounded-full border-4"
                                    style={{ borderColor: colors.background }}
                                />
                                <TouchableOpacity
                                    className="absolute bottom-0 right-0 p-1 rounded-full border"
                                    style={{
                                        backgroundColor: colors.background,
                                        borderColor: colors.border
                                    }}
                                    onPress={() => Alert.alert("Change Photo", "This feature is coming soon")}
                                >
                                    <Feather name="camera" size={16} color={colors.text.primary} />
                                </TouchableOpacity>
                            </View>

                            <View className="ml-3 flex-1 relative -top-6">
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
                                        {user?.emailVerification ? "Verified Account" : "Email Not Verified"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            className="border-t"
                            style={{ borderTopColor: colors.border }}
                        >
                            <Text className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
                                Member since {user.registration ? formatDate(user.registration) : "N/A"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Settings Sections */}
                <View className="px-4">
                    <Text className="text-base font-rubik-medium mb-3" style={{ color: colors.text.secondary }}>
                        Apps & Activities
                    </Text>
                    <View className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: colors.card }}>
                        <SettingsItem
                            icon={<Feather name="file-text" size={20} color="#3498db" />}
                            iconBgColor="#3498db"
                            title="My Notes"
                            subtitle="View and manage all your notes"
                            onPress={() => router.push('/')}
                        />

                        <SettingsItem
                            icon={<Feather name="calendar" size={20} color="#2ecc71" />}
                            iconBgColor="#2ecc71"
                            title="Habit Tracker"
                            subtitle="Track your daily habits and routines"
                            onPress={() => router.push('/tracker')}
                        />

                        <SettingsItem
                            icon={<Feather name="edit-3" size={20} color="#9b59b6" />}
                            iconBgColor="#9b59b6"
                            title="Create Note"
                            subtitle="Add a new note to your collection"
                            onPress={() => router.push('/create')}
                        />
                    </View>

                    <Text className="text-base font-rubik-medium mb-3" style={{ color: colors.text.secondary }}>
                        Account Settings
                    </Text>
                    <View className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: colors.card }}>
                        <SettingsItem
                            icon={<Feather name="user" size={20} color="#e67e22" />}
                            iconBgColor="#e67e22"
                            title="Edit Profile"
                            subtitle="Update your personal information"
                            onPress={handleEditProfile}
                        />


                        <SettingsItem
                            icon={<Feather name="message-circle" size={20} color="#7f8c8d" />}
                            iconBgColor="#7f8c8d"
                            title="Feedback & Contact"
                            subtitle="Tell us what you think or get in touch"
                            onPress={() => router.push("/(screens)/FeedbackAndContact")}
                        />

                        <SettingsItem
                            icon={<Feather name="log-out" size={20} color="#e74c3c" />}
                            iconBgColor="#e74c3c"
                            title="Logout"
                            subtitle="Sign out from your account"
                            textStyle="text-red-500"
                            showArrow={false}
                            onPress={handleLogout}
                        />
                    </View>

                    <Text className="text-base font-rubik-medium mb-3" style={{ color: colors.text.secondary }}>
                        Legal
                    </Text>
                    <View className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: colors.card }}>
                        <SettingsItem
                            icon={<Feather name="lock" size={20} color="#2ecc71" />}
                            iconBgColor="#2ecc71"
                            title="Privacy Policy"
                            subtitle="How we handle your data"
                            onPress={() => setIsPrivacyModalVisible(true)}
                        />
                    </View>
                </View>

                {/* App info */}
                <View className="px-4 items-center mt-2">
                    <Text className="text-xs" style={{ color: colors.text.tertiary }}>
                        NoteNest v1.0.0
                    </Text>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                user={user}
                colors={colors}
                onSuccess={handleProfileUpdate}
            />

            {/* Privacy Policy Modal */}
            <PrivacyPolicyModal
                visible={isPrivacyModalVisible}
                onClose={() => setIsPrivacyModalVisible(false)}
                colors={colors}
            />
        </SafeAreaView>
    );
};

export default Profile;