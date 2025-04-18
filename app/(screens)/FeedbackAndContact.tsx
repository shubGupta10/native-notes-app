import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator,
    useColorScheme
} from 'react-native';
import React, { useState } from 'react';
import { FeedbackAndContact } from "@/lib/appwrite";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColors } from "@/lib/appColors";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";

interface FormData {
    name: string;
    email: string;
    message: string;
}

const FeedbackAndContactPage = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? appColors.dark : appColors.light;

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message should be at least 10 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await FeedbackAndContact(
                formData.name.trim(),
                formData.email.trim(),
                formData.message.trim()
            );

            if (result) {
                setSubmitted(true);
                setFormData({
                    name: '',
                    email: '',
                    message: ''
                });

                setTimeout(() => {
                    setSubmitted(false);
                }, 5000);

                Alert.alert(
                    "Thank You!",
                    "Your feedback has been submitted successfully. We'll get back to you soon.",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            Alert.alert(
                "Error",
                "There was a problem submitting your feedback. Please try again later.",
                [{ text: "OK" }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData({ ...formData, [field]: value });

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                        {/* Header */}
                        <View className="flex-row items-center px-4 py-4">
                            <TouchableOpacity
                                className="p-2 rounded-full mr-4"
                                style={{ backgroundColor: colors.card }}
                                onPress={() => router.back()}
                            >
                                <Feather name="arrow-left" size={20} color={colors.text.primary} />
                            </TouchableOpacity>
                            <Text className="text-2xl font-rubik-bold" style={{ color: colors.text.primary }}>
                                Feedback & Contact
                            </Text>
                        </View>

                        {/* Form Container */}
                        <View className="px-4 pt-2">
                            <View className="rounded-xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
                                <Text className="text-lg font-rubik-medium mb-4" style={{ color: colors.text.primary }}>
                                    We'd love to hear from you!
                                </Text>
                                <Text className="mb-6" style={{ color: colors.text.secondary }}>
                                    Please fill out the form below to send us your feedback or questions. We'll get back to you as soon as possible.
                                </Text>

                                {/* Name Input */}
                                <View className="mb-4">
                                    <Text className="font-rubik-medium mb-2" style={{ color: colors.text.secondary }}>
                                        Name
                                    </Text>
                                    <TextInput
                                        className="border rounded-xl p-4"
                                        style={{
                                            borderColor: errors.name ? colors.status.error : colors.border,
                                            backgroundColor: colors.background,
                                            color: colors.text.primary
                                        }}
                                        value={formData.name}
                                        onChangeText={(text) => handleInputChange('name', text)}
                                        placeholder="Your name"
                                        placeholderTextColor={colors.text.tertiary}
                                    />
                                    {errors.name && (
                                        <Text className="text-sm mt-1" style={{ color: colors.status.error }}>
                                            {errors.name}
                                        </Text>
                                    )}
                                </View>

                                {/* Email Input */}
                                <View className="mb-4">
                                    <Text className="font-rubik-medium mb-2" style={{ color: colors.text.secondary }}>
                                        Email
                                    </Text>
                                    <TextInput
                                        className="border rounded-xl p-4"
                                        style={{
                                            borderColor: errors.email ? colors.status.error : colors.border,
                                            backgroundColor: colors.background,
                                            color: colors.text.primary
                                        }}
                                        value={formData.email}
                                        onChangeText={(text) => handleInputChange('email', text)}
                                        placeholder="Your email address"
                                        placeholderTextColor={colors.text.tertiary}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {errors.email && (
                                        <Text className="text-sm mt-1" style={{ color: colors.status.error }}>
                                            {errors.email}
                                        </Text>
                                    )}
                                </View>

                                {/* Message Input */}
                                <View className="mb-6">
                                    <Text className="font-rubik-medium mb-2" style={{ color: colors.text.secondary }}>
                                        Message
                                    </Text>
                                    <TextInput
                                        className="border rounded-xl p-4"
                                        style={{
                                            borderColor: errors.message ? colors.status.error : colors.border,
                                            backgroundColor: colors.background,
                                            color: colors.text.primary,
                                            height: 150,
                                            textAlignVertical: 'top'
                                        }}
                                        value={formData.message}
                                        onChangeText={(text) => handleInputChange('message', text)}
                                        placeholder="Write your message here..."
                                        placeholderTextColor={colors.text.tertiary}
                                        multiline={true}
                                        numberOfLines={6}
                                    />
                                    {errors.message && (
                                        <Text className="text-sm mt-1" style={{ color: colors.status.error }}>
                                            {errors.message}
                                        </Text>
                                    )}
                                </View>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    className="rounded-xl py-4 flex-row justify-center items-center"
                                    style={{
                                        backgroundColor: colors.accent.primary,
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Feather name="send" size={18} color="#FFFFFF" />
                                            <Text className="text-white font-rubik-medium ml-2">
                                                Submit Feedback
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default FeedbackAndContactPage;