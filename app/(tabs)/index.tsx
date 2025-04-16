import { View, Text, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import FetchNotes from '@/components/FetchNotes'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { Feather, Ionicons } from '@expo/vector-icons'
import { appColors } from "@/lib/appColors"

const Index = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const colors = isDark ? appColors.dark : appColors.light

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'compact' : 'list')
  }

  // Logged-in state
  if (user) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header bar */}
        <View className={`px-4 py-4 flex-row justify-between items-center ${isDark ? 'border-[#333333]' : 'border-gray-200'} border-b`}>
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              NoteNest
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Notes & habits in one place
            </Text>
          </View>

          <View className="flex-row items-center">
            {/* View toggle button */}
            <TouchableOpacity
              onPress={toggleViewMode}
              className={`p-3 rounded-full mr-3 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-100'}`}
            >
              <Feather
                name={viewMode === 'list' ? 'grid' : 'list'}
                size={20}
                color={isDark ? colors.text.secondary : colors.text.secondary}
              />
            </TouchableOpacity>

            {/* Create button */}
            <TouchableOpacity
              onPress={() => router.push('/create')}
              className="p-3 rounded-full"
              style={{ backgroundColor: colors.accent.secondary }}
            >
              <Feather name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View className="flex-1">
          <FetchNotes viewMode={viewMode} />
        </View>

        {/* Space for bottom tab navigation */}
        <View className="h-4" />
      </SafeAreaView>
    )
  }

  // Not logged-in welcome screen
  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 pt-2 pb-16">
          {/* Header */}
          <View className="items-center mb-8">
            <Image
              source={require('@/assets/images/home-image.png')}
              className="w-24 h-24 mb-4"
            />
            <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              LifeTrack
            </Text>
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-center mt-2 text-lg`}>
              Note-taking & habit tracking in one app
            </Text>
          </View>

          {/* App Features */}
          <View className="mb-8">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
              All your productivity needs in one place
            </Text>

            {/* Note Taking Feature */}
            <View className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} border ${isDark ? 'border-[#333333]' : 'border-gray-200'}`}>
              <View className="flex-row items-center mb-2">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: colors.accent.light }}>
                  <Feather name="file-text" size={20} color={colors.accent.primary} />
                </View>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Smart Note Taking
                </Text>
              </View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} ml-13`}>
                Capture ideas instantly with our beautiful editor. Organize with tags and categories.
              </Text>
            </View>

            {/* Habit Tracking Feature */}
            <View className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} border ${isDark ? 'border-[#333333]' : 'border-gray-200'}`}>
              <View className="flex-row items-center mb-2">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: colors.accent.light }}>
                  <Feather name="calendar" size={20} color={colors.accent.primary} />
                </View>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Habit Tracking
                </Text>
              </View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} ml-13`}>
                Build better routines by tracking daily habits. See your progress visually with streaks.
              </Text>
            </View>

            {/* Dark Mode Feature */}
            <View className={`p-4 rounded-xl ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50'} border ${isDark ? 'border-[#333333]' : 'border-gray-200'}`}>
              <View className="flex-row items-center mb-2">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: colors.accent.light }}>
                  <Feather name="moon" size={20} color={colors.accent.primary} />
                </View>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Beautiful Interface
                </Text>
              </View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} ml-13`}>
                Enjoy a clean, distraction-free design with light and dark mode support.
              </Text>
            </View>
          </View>

          {/* Call to Action */}
          <View className="mt-2 mb-6">
            <Link href="/login" asChild>
              <TouchableOpacity
                className="py-4 rounded-xl flex-row justify-center items-center shadow"
                style={{ backgroundColor: colors.accent.secondary }}
              >
                <Text className="text-white font-bold text-lg">Get Started Now</Text>
                <Feather name="arrow-right" size={20} color="white" className="ml-2" />
              </TouchableOpacity>
            </Link>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mt-4 text-sm px-4`}>
              Your data is securely encrypted and never shared with third parties
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Index