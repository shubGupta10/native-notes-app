import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import FetchNotes from '@/components/FetchNotes'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'

const Index = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list') 

  // Toggle view mode function
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'compact' : 'list')
  }

  // Logged-in state
  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-200">
          <View>
            <Text className="text-2xl font-bold text-gray-800">NoteNest</Text>
            <Text className="text-sm text-gray-500">Your personal note collection</Text>
          </View>
          <View className="flex-row items-center">
            {/* View toggle button */}
            <TouchableOpacity
              onPress={toggleViewMode}
              className="bg-gray-100 p-3 rounded-full mr-3"
            >
              <Feather 
                name={viewMode === 'list' ? 'grid' : 'list'} 
                size={22} 
                color="#4B5563"
              />
            </TouchableOpacity>
            {/* Create note button */}
            <TouchableOpacity
              onPress={() => router.push('/create')}
              className="bg-blue-600 p-3 rounded-full shadow-sm"
            >
              <Feather name="plus" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <FetchNotes viewMode={viewMode} />
      </SafeAreaView>
    )
  }

  // Not logged-in welcome screen
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-2 pb-2">
          {/* Header */}
          <View className="items-center mb-8">
            <Image
                source={require('@/assets/images/home-image.png')}
                className="w-24 h-24 mb-4"
            />
            <Text className="text-4xl font-bold text-gray-800">NoteNest</Text>
            <Text className="text-gray-500 text-center mt-2 text-lg">
              Your thoughts and ideas, organized beautifully
            </Text>
          </View>
          
          {/* Features */}
          <View className="mb-12">
            <Text className="text-xl font-bold text-gray-800 mb-6">Why choose NoteNest?</Text>
            
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">Capture ideas instantly</Text>
                <Text className="text-gray-600">Save your thoughts quickly with our intuitive interface</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">Organize with categories</Text>
                <Text className="text-gray-600">Keep your notes structured with custom categories</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">Access anywhere</Text>
                <Text className="text-gray-600">Your notes sync across all your devices securely</Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold">4</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">Beautiful design</Text>
                <Text className="text-gray-600">Enjoy a clean, distraction-free interface</Text>
              </View>
            </View>
          </View>
          
          {/* Action Button */}
          <View className="mt-2 mb-4">
            <Link href="/login" asChild>
              <TouchableOpacity className="bg-blue-600 py-4 rounded-xl items-center shadow-sm">
                <Text className="text-white font-bold text-lg">Get Started</Text>
              </TouchableOpacity>
            </Link>
            <Text className="text-gray-500 text-center mt-4 text-sm">
              Your privacy is our priority - all notes are securely encrypted
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Index