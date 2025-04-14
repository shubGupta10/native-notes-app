import { View, Text, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import FetchNotes from '@/components/FetchNotes'
import { useAuthStore } from '@/store/useAuthStore'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import {appColors} from "@/lib/appColors";


const Index = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark'

  // Get current color scheme
  const colors = isDarkMode ? appColors.dark : appColors.light;

  // Toggle view mode function
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'compact' : 'list')
  }

  // Logged-in state
  if (user) {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style={isDarkMode ? "light" : "dark"} />

          {/* Header bar */}
          <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.background,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
          >
            <View>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text.primary
              }}>
                NoteNest
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text.tertiary
              }}>
                Your personal note collection
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* View toggle button */}
              <TouchableOpacity
                  onPress={toggleViewMode}
                  style={{
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6',
                    padding: 12,
                    borderRadius: 24,
                    marginRight: 12,
                    shadowColor: colors.shadow.color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: colors.shadow.opacity,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
              >
                <Feather
                    name={viewMode === 'list' ? 'grid' : 'list'}
                    size={22}
                    color={colors.text.secondary}
                />
              </TouchableOpacity>

              {/* Create note button */}
              <TouchableOpacity
                  onPress={() => router.push('/create')}
                  style={{
                    backgroundColor: colors.accent.secondary,
                    padding: 12,
                    borderRadius: 24,
                    shadowColor: colors.shadow.color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: colors.shadow.opacity,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Image
                  source={require('@/assets/images/home-image.png')}
                  style={{ width: 96, height: 96, marginBottom: 16 }}
              />
              <Text style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: colors.text.primary
              }}>
                NoteNest
              </Text>
              <Text style={{
                color: colors.text.secondary,
                textAlign: 'center',
                marginTop: 8,
                fontSize: 18
              }}>
                Your thoughts and ideas, organized beautifully
              </Text>
            </View>

            {/* Features */}
            <View style={{ marginBottom: 48 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text.primary,
                marginBottom: 24
              }}>
                Why choose NoteNest?
              </Text>

              {/* Feature 1 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accent.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    fontSize: 18
                  }}>
                    Capture ideas instantly
                  </Text>
                  <Text style={{ color: colors.text.secondary }}>
                    Save your thoughts quickly with our intuitive interface
                  </Text>
                </View>
              </View>

              {/* Feature 2 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accent.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    fontSize: 18
                  }}>
                    Organize with categories
                  </Text>
                  <Text style={{ color: colors.text.secondary }}>
                    Keep your notes structured with custom categories
                  </Text>
                </View>
              </View>

              {/* Feature 3 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accent.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    fontSize: 18
                  }}>
                    Access anywhere
                  </Text>
                  <Text style={{ color: colors.text.secondary }}>
                    Your notes sync across all your devices securely
                  </Text>
                </View>
              </View>

              {/* Feature 4 */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accent.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>4</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    fontSize: 18
                  }}>
                    Beautiful design
                  </Text>
                  <Text style={{ color: colors.text.secondary }}>
                    Enjoy a clean, distraction-free interface
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Link href="/login" asChild>
                <TouchableOpacity
                    style={{
                      backgroundColor: colors.accent.secondary,
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      shadowColor: isDarkMode ? colors.accent.secondary : colors.shadow.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDarkMode ? 0.5 : 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              </Link>
              <Text style={{
                color: colors.text.tertiary,
                textAlign: 'center',
                marginTop: 16,
                fontSize: 14
              }}>
                Your privacy is our priority - all notes are securely encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  )
}

export default Index