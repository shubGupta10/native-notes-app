import {Alert, Text, View, ScrollView, TouchableOpacity, Platform, useColorScheme} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchNoteById } from "@/lib/appwrite";
import AuthWrapper from '@/components/AuthWrapper';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from '@expo/vector-icons';
import { appColors } from "@/lib/appColors";

const ViewNote = () => {
    const { documentId } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = appColors[theme];

    useEffect(() => {
        const fetchSingleNote = async () => {
            setLoading(true);
            try {
                const response = await fetchNoteById(documentId as string);
                if(response){
                    setTitle(response.title || '');
                    setCategory(response.category || '');
                    setContent(response.content || '');
                    setError('');
                } else {
                    setError('Note not found');
                }
            } catch (error) {
                console.error('Error fetching note:', error);
                setError('Failed to load note data');
                Alert.alert('Error', 'Failed to load note data');
            } finally {
                setLoading(false);
            }
        };

        if (documentId) {
            fetchSingleNote();
        }
    }, [documentId]);

    const handleEdit = () => {
        const id = Array.isArray(documentId) ? documentId[0] : documentId;
        router.push({
            pathname: '/edit/[documentId]',
            params: {documentId: id}
        });
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <AuthWrapper redirectToLogin={true}>
            <SafeAreaView
                className="flex-1"
                style={{
                    backgroundColor: colors.background,
                    paddingTop: Platform.OS === 'android' ? 25 : 0
                }}
            >
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <Text style={{ color: colors.accent.primary }} className="text-base">
                            Loading note...
                        </Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center p-5">
                        <Text
                            className="text-base mb-5 text-center"
                            style={{ color: colors.status.error }}
                        >
                            {error}
                        </Text>
                        <TouchableOpacity
                            className="py-3 px-5 rounded-lg"
                            style={{ backgroundColor: colors.accent.primary }}
                            onPress={handleBack}
                        >
                            <Text className="text-white font-semibold text-base">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-1 p-4">
                        <View className="flex-row justify-between items-center mb-5">
                            <TouchableOpacity
                                onPress={handleBack}
                                className="p-2"
                            >
                                <Ionicons name="arrow-back" size={24} color={colors.accent.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleEdit}
                                className="flex-row items-center py-2 px-4 rounded-full"
                                style={{
                                    backgroundColor: colors.accent.primary,
                                    shadowColor: colors.shadow.color,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: colors.shadow.opacity,
                                    shadowRadius: 3,
                                    elevation: 3
                                }}
                            >
                                <Feather name="edit-2" size={18} color="#FFFFFF" />
                                <Text className="text-white font-semibold ml-2">Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="flex-1"
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            <View className="mb-5">
                                <Text
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: colors.text.primary }}
                                >
                                    {title}
                                </Text>
                                <View
                                    className="flex-row items-center self-start py-1.5 px-3 rounded-full"
                                    style={{ backgroundColor: colors.accent.light }}
                                >
                                    <Feather name="tag" size={14} color={colors.accent.primary} />
                                    <Text
                                        className="text-sm font-medium ml-1.5"
                                        style={{ color: colors.accent.primary }}
                                    >
                                        {category}
                                    </Text>
                                </View>
                            </View>

                            <View
                                className="p-4 rounded-xl min-h-[200]"
                                style={{ backgroundColor: colors.card }}
                            >
                                <Text
                                    className="text-base leading-relaxed"
                                    style={{ color: colors.text.secondary }}
                                >
                                    {content}
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                )}
            </SafeAreaView>
        </AuthWrapper>
    );
};

export default ViewNote;