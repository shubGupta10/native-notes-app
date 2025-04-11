import {Alert, Text, View, ScrollView, TouchableOpacity, Platform} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchNoteById } from "@/lib/appwrite";
import AuthWrapper from '@/components/AuthWrapper';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from '@expo/vector-icons';


const ViewNote = () => {
    const { documentId } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

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
        router.push({
            pathname: '/edit/[documentId]',
            params: {documentId}
        });
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <AuthWrapper redirectToLogin={true}>
            <SafeAreaView className="flex-1 bg-white"  style={{ paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-base text-blue-500">Loading note...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center p-5">
                        <Text className="text-base text-red-600 mb-5 text-center">{error}</Text>
                        <TouchableOpacity
                            className="bg-blue-500 py-3 px-5 rounded-lg"
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
                                <Ionicons name="arrow-back" size={24} color="#4285F4" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleEdit}
                                className="bg-blue-500 flex-row items-center py-2 px-4 rounded-full shadow"
                            >
                                <Feather name="edit-2" size={18} color="#FFFFFF" />
                                <Text className="text-white font-semibold ml-2">Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="flex-1"
                            contentContainerClassName="pb-10"
                        >
                            <View className="mb-5">
                                <Text className="text-2xl font-bold text-gray-800 mb-2">{title}</Text>
                                <View className="flex-row items-center bg-blue-50 self-start py-1.5 px-3 rounded-full">
                                    <Feather name="tag" size={14} color="#4285F4" />
                                    <Text className="text-sm text-blue-600 font-medium ml-1.5">{category}</Text>
                                </View>
                            </View>

                            <View className="bg-gray-50 p-4 rounded-xl min-h-[200]">
                                <Text className="text-gray-700 text-base leading-relaxed">{content}</Text>
                            </View>
                        </ScrollView>
                    </View>
                )}
            </SafeAreaView>
        </AuthWrapper>
    );
};

export default ViewNote;