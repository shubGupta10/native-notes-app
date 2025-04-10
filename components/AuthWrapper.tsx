import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthWrapperProps {
  children: React.ReactNode;
  redirectToLogin?: boolean;
}

const AuthWrapper = ({ children, redirectToLogin = false }: AuthWrapperProps) => {
  const { user, fetchUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.log('Error checking authentication:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  if (isChecking) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-black">Checking authentication...</Text>
      </View>
    );
  }

  if (!user && redirectToLogin) {
    return (
      <SafeAreaView className="h-full bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-2xl font-rubik-bold text-center mb-3">
            You're not logged in
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            Please log in to access this page.
          </Text>
          <TouchableOpacity
            onPress={handleNavigateToLogin}
            className="bg-black py-4 px-8 rounded-full flex-row items-center"
          >
            <LogIn size={20} color="#fff" />
            <Text className="text-white font-rubik-medium ml-2">Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;