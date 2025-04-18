import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { updateUserProfile } from '@/lib/appwrite';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    colors: any;
    onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
                                                               visible,
                                                               onClose,
                                                               user,
                                                               colors,
                                                               onSuccess
                                                           }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user, visible]);

    const handleUpdateProfile = async () => {
        if (!user || !user.$id) {
            Alert.alert("Error", "User information not available");
            return;
        }

        if (!formData.name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        if (!formData.email.trim() || !formData.email.includes('@')) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        try {
            setIsUpdating(true);
            await updateUserProfile(user.$id, {
                name: formData.name.trim(),
                email: formData.email.trim()
            });

            onClose();
            onSuccess();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 justify-end">
                        <View
                            className="rounded-t-3xl p-6"
                            style={{ backgroundColor: colors.card }}
                        >
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-rubik-bold" style={{ color: colors.text.primary }}>
                                    Edit Profile
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Feather name="x" size={24} color={colors.text.primary} />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="mb-2 font-rubik-medium" style={{ color: colors.text.secondary }}>
                                    Name
                                </Text>
                                <TextInput
                                    className="border rounded-xl p-4 mb-2"
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text.primary
                                    }}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({...formData, name: text})}
                                    placeholder="Your name"
                                    placeholderTextColor={colors.text.tertiary}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="mb-2 font-rubik-medium" style={{ color: colors.text.secondary }}>
                                    Email
                                </Text>
                                <TextInput
                                    className="border rounded-xl p-4 mb-2"
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text.primary
                                    }}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({...formData, email: text})}
                                    placeholder="Your email"
                                    placeholderTextColor={colors.text.tertiary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className="flex-1 py-4 rounded-xl mr-2"
                                    style={{ backgroundColor: colors.background }}
                                    onPress={onClose}
                                >
                                    <Text
                                        className="text-center font-rubik-medium"
                                        style={{ color: colors.text.primary }}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 py-4 rounded-xl ml-2 flex-row justify-center items-center"
                                    style={{ backgroundColor: colors.accent.primary }}
                                    onPress={handleUpdateProfile}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text className="text-center font-rubik-medium text-white">Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default EditProfileModal;