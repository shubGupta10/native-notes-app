import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, SafeAreaView, useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { appColors } from '@/lib/appColors';

const Login = () => {
    const { loading, user, login, fetchUser } = useAuthStore();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? appColors.dark : appColors.light;
    
    // Initial check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            if (!user) {
                await fetchUser();
            }
        };
        
        checkUser();
    }, []);
    
    // Redirect to home if user is logged in
    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user]);
    
    const handleLogin = async () => {
        const success = await login();
        
        if (success) {
            Alert.alert('Success', 'You are now logged in!');
            router.replace("/");
        } else {
            Alert.alert('Error', 'Login failed. Please try again.');
        }
    };
    
    if (loading) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                    <Text className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                        Connecting to your account...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
            <StatusBar style={isDark ? "light" : "dark"} />
            
            {/* Header with back button */}
            <View className="flex-row items-center px-6 pt-4 pb-2">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className={`p-2 rounded-full ${isDark ? 'bg-[#333333]' : 'bg-gray-100'}`}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.accent.primary} />
                </TouchableOpacity>
            </View>
            
            <View className="flex-1 px-6 justify-center">
                {/* App Logo */}
                <View className="items-center mb-10">
                    <Image
                        source={require('@/assets/images/home-image.png')}
                        className="w-24 h-24 mb-4"
                    />
                    <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Welcome Back
                    </Text>
                    <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-center mt-2`}>
                        Sign in to access your trackers
                    </Text>
                </View>
                
                {/* Login section */}
                <View className={`${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} p-6 rounded-2xl ${isDark ? 'border-[#333333]' : 'border-gray-200'} border shadow-sm`}>
                    <Text className={`text-lg font-semibold text-center ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>
                        Sign in with your Google account
                    </Text>
                    
                    <TouchableOpacity
                        className={`${isDark ? 'bg-[#333333]' : 'bg-white'} flex-row items-center justify-center py-4 px-6 rounded-xl ${isDark ? 'border-[#444444]' : 'border-gray-300'} border shadow-sm`}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <View className="w-6 h-6 mr-3 items-center justify-center">
                            <FontAwesome name="google" size={20} color={isDark ? "#FFFFFF" : "#4285F4"} />
                        </View>
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'} text-lg`}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {/* Terms */}
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mt-8 text-sm px-4`}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default Login;