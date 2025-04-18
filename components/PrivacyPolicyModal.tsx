import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PrivacyPolicyModalProps {
    visible: boolean;
    onClose: () => void;
    colors: any;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
                                                                   visible,
                                                                   onClose,
                                                                   colors
                                                               }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="flex-row justify-between items-center p-4 border-b" style={{ borderColor: colors.border }}>
                    <Text className="text-xl font-rubik-bold" style={{ color: colors.text.primary }}>
                        Privacy Policy
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView className="flex-1 px-4 py-6">
                    <Text className="text-lg font-rubik-bold mb-4" style={{ color: colors.text.primary }}>
                        NoteNest Privacy Policy
                    </Text>
                    <Text className="mb-4" style={{ color: colors.text.secondary }}>
                        Last Updated: April 18, 2025
                    </Text>
                    <Text className="mb-4" style={{ color: colors.text.secondary }}>
                        This Privacy Policy describes how NoteNest handles your information.
                    </Text>

                    <Text className="text-lg font-rubik-medium mb-2" style={{ color: colors.text.primary }}>
                        1. Information We Collect
                    </Text>
                    <Text className="mb-4" style={{ color: colors.text.secondary }}>
                        We collect basic information you provide directly to us when you create an account, such as your name and email address. We do not store or collect your notes data or app interaction information.
                    </Text>

                    <Text className="text-lg font-rubik-medium mb-2" style={{ color: colors.text.primary }}>
                        2. How We Use Your Information
                    </Text>
                    <Text className="mb-4" style={{ color: colors.text.secondary }}>
                        We do not use your information for any purpose beyond providing the basic functionality of the app. We do not collect your email address to send information about our services.
                    </Text>

                    <Text className="text-lg font-rubik-medium mb-2" style={{ color: colors.text.primary }}>
                        3. Data Storage and Security
                    </Text>
                    <Text className="mb-4" style={{ color: colors.text.secondary }}>
                        Your data is stored securely in the cloud. We implement appropriate technical measures to protect your personal information against unauthorized access.
                    </Text>

                    <Text className="text-lg font-rubik-medium mb-2" style={{ color: colors.text.primary }}>
                        4. Your Rights
                    </Text>
                    <Text className="mb-4" style={{ color: colors.text.secondary }}>
                        You have the right to delete your account at any time. Since we don't collect user data beyond basic account information, you cannot request a copy of data collection.
                    </Text>

                    <Text className="text-lg font-rubik-medium mb-2" style={{ color: colors.text.primary }}>
                        5. Changes to This Policy
                    </Text>
                    <Text className="mb-6" style={{ color: colors.text.secondary }}>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

export default PrivacyPolicyModal;