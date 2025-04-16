"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList, 
  Modal, 
  TextInput, 
  Alert,
  RefreshControl,
  Animated
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuthStore } from "@/store/useAuthStore"
import { fetchTracker, deleteTracker, editTracker } from "@/lib/appwrite"
import { appColors } from "@/lib/appColors"
import { useColorScheme } from "react-native"
import { Feather } from "@expo/vector-icons"
import AuthWrapper from "@/components/AuthWrapper"
import { BlurView } from "expo-blur"

interface TrackerDocument {
  id: string
  name: string
  userId: string
  createdAt: string
  $id?: string
}

const Tracker = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const [trackers, setTrackers] = useState<TrackerDocument[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const colorScheme = useColorScheme()
  const colors = colorScheme === "dark" ? appColors.dark : appColors.light
  
  // Animation value for new item highlight
  const [fadeAnim] = useState(new Animated.Value(0))

  // Edit modal states
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentTracker, setCurrentTracker] = useState<TrackerDocument | null>(null)
  const [newTrackerName, setNewTrackerName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const handleNavigate = () => {
    router.push("/create-tracker")
  }

  const handleNavigateToTracker = (id: string) => {
    router.push({
      pathname: "/(screens)/displayTracker/[id]",
      params: {id}
    })
  }

  const handleFetchTrackers = async (userId: string) => {
    if (!userId) return

    setLoading(true)
    setError(false)

    try {
      const result = await fetchTracker(userId)
      if (result.success) {
        setTrackers(result.trackers as unknown as TrackerDocument[])
        
        // Animate new items fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start()
      } else {
        console.error(result.message)
        // We're treating "no trackers" as a valid empty state, not an error
        if (result.message !== 'No trackers found or not authorized.') {
          setError(true)
        }
      }
    } catch (error) {
      console.error("Error fetching trackers:", error)
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = useCallback(() => {
    if (user?.$id) {
      setRefreshing(true)
      handleFetchTrackers(user.$id)
    }
  }, [user])

  useEffect(() => {
    if (user?.$id) {
      handleFetchTrackers(user.$id)
    }
  }, [user])

  const handleEdit = (tracker: TrackerDocument) => {
    setCurrentTracker(tracker)
    setNewTrackerName(tracker.name)
    setEditModalVisible(true)
  }

  const handleConfirmEdit = async () => {
    if (!currentTracker || !user?.$id || !newTrackerName.trim()) return

    setIsEditing(true)
    try {
      const result = await editTracker(currentTracker.id, user.$id, newTrackerName.trim())

      if (result.success) {
        // Update the tracker in the local state
        setTrackers(prevTrackers =>
          prevTrackers.map(tracker =>
            tracker.id === currentTracker.id
              ? { ...tracker, name: newTrackerName.trim() }
              : tracker
          )
        )
        setEditModalVisible(false)
        // Show success message
        Alert.alert("Success", "Tracker updated successfully")
      } else {
        Alert.alert("Error", result.message || "Failed to update tracker")
      }
    } catch (error) {
      console.error("Error updating tracker:", error)
      Alert.alert("Error", "Something went wrong while updating the tracker")
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async (tracker: TrackerDocument) => {
    if (!user?.$id) return

    // Confirm deletion
    Alert.alert(
      "Delete Tracker",
      `Are you sure you want to delete "${tracker.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true)
            try {
              const result = await deleteTracker(tracker.id, user.$id)

              if (result.success) {
                // Remove the tracker from the local state
                setTrackers(prevTrackers =>
                  prevTrackers.filter(t => t.id !== tracker.id)
                )
                Alert.alert("Success", "Tracker deleted successfully")
              } else {
                Alert.alert("Error", result.message || "Failed to delete tracker")
              }
            } catch (error) {
              console.error("Error deleting tracker:", error)
              Alert.alert("Error", "Something went wrong while deleting the tracker")
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString(undefined, options)
  }

  const renderTrackerItem = ({ item, index }: { item: TrackerDocument, index: number }) => {
    // Staggered animation delay based on index
    const animationDelay = index * 100
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ 
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }}
      >
        <TouchableOpacity
          onPress={() => handleNavigateToTracker(item.$id || item.id)}
          activeOpacity={0.7}
          className="mb-4 rounded-2xl p-4 border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow.color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: colors.shadow.opacity,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text 
              className="text-lg font-semibold flex-1 pr-2"
              style={{ color: colors.text.primary }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => handleEdit(item)}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
              >
                <Feather name="edit-2" size={18} color={colors.accent.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDelete(item)}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
              >
                <Feather name="trash-2" size={18} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-px w-full my-2" style={{ backgroundColor: colors.border }} />

          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center">
              <Feather name="calendar" size={14} color={colors.text.secondary} className="mr-1" />
              <Text 
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text 
                className="text-sm font-medium mr-1"
                style={{ color: colors.accent.primary }}
              >
                View Details
              </Text>
              <Feather name="chevron-right" size={16} color={colors.accent.primary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text 
            className="text-base mt-4"
            style={{ color: colors.text.secondary }}
          >
            Loading your trackers...
          </Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center">
          <View 
            className="items-center p-6 rounded-xl mb-6"
            style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(248, 113, 113, 0.05)' }}
          >
            <Feather name="alert-circle" size={40} color={colors.status.error} />
            <Text 
              className="text-xl font-bold mt-4 mb-2"
              style={{ color: colors.text.primary }}
            >
              Oops! Something went wrong
            </Text>
            <Text 
              className="text-center text-base"
              style={{ color: colors.text.secondary }}
            >
              We couldn't load your trackers. Please try again.
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center py-3 px-6 rounded-xl"
            style={{ backgroundColor: colors.accent.primary }}
            onPress={() => user?.$id && handleFetchTrackers(user.$id)}
          >
            <Feather name="refresh-cw" size={16} color="#fff" className="mr-2" />
            <Text className="text-white font-medium text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (trackers && trackers.length > 0) {
      return (
        <FlatList
          data={trackers}
          renderItem={renderTrackerItem}
          keyExtractor={(item) => item.$id || item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
              colors={[colors.accent.primary]}
            />
          }
        />
      )
    }

    // Empty state - no trackers yet
    return (
      <View className="flex-1 items-center justify-center pb-16">
        <View className="items-center px-5">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: colors.accent.light }}
          >
            <Feather name="clipboard" size={50} color={colors.accent.primary} />
          </View>
          <Text 
            className="text-xl font-bold mb-3"
            style={{ color: colors.text.primary }}
          >
            No trackers yet
          </Text>
          <Text 
            className="text-center text-base mb-8 leading-6"
            style={{ color: colors.text.tertiary }}
          >
            Create your first tracker to start monitoring your habits and goals
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center py-4 px-8 rounded-xl"
          style={{ backgroundColor: colors.accent.primary }}
          onPress={handleNavigate}
        >
          <Feather name="plus" size={20} color="#fff" className="mr-2" />
          <Text className="text-white font-semibold text-base">Create First Tracker</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <AuthWrapper redirectToLogin={true}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View className="px-4 pt-6 pb-2">
          <Text 
            className="text-3xl font-bold tracking-tight"
            style={{ color: colors.text.primary }}
          >
            Your Trackers
          </Text>
          <Text 
            className="text-base mt-1 mb-2"
            style={{ color: colors.text.secondary }}
          >
            Monitor your habits and goals with custom trackers
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          onPress={handleNavigate}
          className="mx-4 my-4 rounded-xl py-3.5 flex-row items-center justify-center"
          style={{ 
            backgroundColor: colors.accent.primary,
            shadowColor: colors.shadow.color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: colors.shadow.opacity,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Feather name="plus-circle" size={20} color="#fff" className="mr-2" />
          <Text className="text-white text-base font-semibold">Create New Tracker</Text>
        </TouchableOpacity>

        {/* Content */}
        <View className="flex-1 px-4 pt-4">
          {trackers.length > 0 && (
            <Text 
              className="text-lg font-semibold mb-3"
              style={{ color: colors.text.primary }}
            >
              {trackers.length} {trackers.length === 1 ? 'Tracker' : 'Trackers'}
            </Text>
          )}

          {renderContent()}
        </View>

        {/* Edit Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <BlurView 
            intensity={colorScheme === 'dark' ? 40 : 60} 
            className="flex-1 items-center justify-center px-5"
          >
            <View 
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ 
                backgroundColor: colors.card,
                shadowColor: colors.shadow.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-between items-center p-5 border-b" style={{ borderColor: colors.border }}>
                <Text 
                  className="text-xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Edit Tracker
                </Text>
                <TouchableOpacity 
                  onPress={() => setEditModalVisible(false)}
                  disabled={isEditing}
                  className="p-1"
                >
                  <Feather name="x" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              
              <View className="p-5">
                <Text 
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Tracker Name
                </Text>
                <TextInput
                  className="border rounded-lg px-4 py-3 mb-6"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.text.primary,
                    backgroundColor: colors.background
                  }}
                  value={newTrackerName}
                  onChangeText={setNewTrackerName}
                  placeholder="Enter tracker name"
                  placeholderTextColor={colors.text.tertiary}
                  autoFocus
                />

                <View className="flex-row justify-end space-x-3 gap-3">
                  <TouchableOpacity
                    className="py-3 px-5 rounded-lg border"
                    style={{ borderColor: colors.border }}
                    onPress={() => setEditModalVisible(false)}
                    disabled={isEditing}
                  >
                    <Text style={{ color: colors.text.secondary }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="py-3 px-5 rounded-lg flex-row items-center"
                    style={{ 
                      backgroundColor: colors.accent.primary,
                      opacity: isEditing || !newTrackerName.trim() ? 0.6 : 1 
                    }}
                    onPress={handleConfirmEdit}
                    disabled={isEditing || !newTrackerName.trim()}
                  >
                    {isEditing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Feather name="check" size={16} color="#fff" className="mr-2" />
                        <Text className="text-white font-medium">Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </AuthWrapper>
  )
}

export default Tracker