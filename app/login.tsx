import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const Login = () => {
    const { loading, user, login, fetchUser } = useAuthStore();
    const router = useRouter();
    
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
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar style="dark" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text className="mt-4 text-gray-600 font-medium">Connecting to your account...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            
            {/* Header with back button */}
            <View className="flex-row items-center px-6 pt-4 pb-2">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="p-2"
                >
                    <Ionicons name="arrow-back" size={24} color="#4285F4" />
                </TouchableOpacity>
            </View>
            
            <View className="flex-1 px-6 justify-center">
                {/* App Logo */}
                <View className="items-center mb-10">
                    <Image
                        source={require('@/assets/images/home-image.png')}
                        className="w-24 h-24 mb-4"
                    />
                    <Text className="text-3xl font-bold text-gray-800">Welcome Back</Text>
                    <Text className="text-gray-500 text-center mt-2">Sign in to access your notes</Text>
                </View>
                
                {/* Login section */}
                <View className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <Text className="text-lg font-semibold text-center text-gray-800 mb-6">
                        Sign in with your Google account
                    </Text>
                    
                    <TouchableOpacity
                        className="bg-white flex-row items-center justify-center py-4 px-6 rounded-xl border border-gray-300 shadow-sm"
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <Image 
                            source={{ uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" }}
                            className="w-6 h-6 mr-3"
                        />
                        <Text className="font-bold text-gray-800 text-lg">Continue with Google</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Terms */}
                <Text className="text-gray-500 text-center mt-8 text-sm px-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default Login;