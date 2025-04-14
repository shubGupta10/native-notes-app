import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColors } from '@/lib/appColors';

interface AuthWrapperProps {
  children: React.ReactNode;
  redirectToLogin?: boolean;
}

const AuthWrapper = ({ children, redirectToLogin = false }: AuthWrapperProps) => {
  const { user, fetchUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = appColors[theme];

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
        <View
            className="flex-1 justify-center items-center"
            style={{ backgroundColor: colors.background }}
        >
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text
              className="mt-2"
              style={{ color: colors.text.primary }}
          >
            Checking authentication...
          </Text>
        </View>
    );
  }

  if (!user && redirectToLogin) {
    return (
        <SafeAreaView
            className="h-full"
            style={{ backgroundColor: colors.background }}
        >
          <View className="flex-1 justify-center items-center px-4">
            <Text
                className="text-2xl font-rubik-bold text-center mb-3"
                style={{ color: colors.text.primary }}
            >
              You're not logged in
            </Text>
            <Text
                className="text-center mb-8"
                style={{ color: colors.text.tertiary }}
            >
              Please log in to access this page.
            </Text>
            <TouchableOpacity
                onPress={handleNavigateToLogin}
                className="py-4 px-8 rounded-full flex-row items-center"
                style={{ backgroundColor: theme === 'dark' ? colors.accent.primary : '#000' }}
            >
              <Feather
                  name="log-in"
                  size={20}
                  color="#fff"
              />
              <Text className="text-white font-rubik-medium ml-2">Log In</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;