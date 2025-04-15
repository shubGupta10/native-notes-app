// app/layout.tsx
import { useEffect, useRef, useState } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { Slot } from 'expo-router';
import './globals.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColors } from '@/lib/appColors';
import * as Notifications from 'expo-notifications';
import { scheduleDailyNotification } from '@/lib/notifications/scheduleNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const themeColors = appColors[colorScheme === 'dark' ? 'dark' : 'light'];
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const notificationSetupDone = useRef(false);

    useEffect(() => {
        // Setup notifications only once per app session
        const setupNotifications = async () => {
            try {
                // Check if we've already set up notifications this session
                if (notificationSetupDone.current) {
                    return;
                }

                // Check if notifications were set up today
                const lastSetupTime = await AsyncStorage.getItem('notificationLastSetupTime');
                const today = new Date().toDateString();

                if (lastSetupTime !== today) {
                    await scheduleDailyNotification();
                    await AsyncStorage.setItem('notificationLastSetupTime', today);
                    console.log('Daily notifications scheduled at:', new Date().toString());
                }

                notificationSetupDone.current = true;
            } catch (error) {
                console.error('Failed to set up notifications:', error);
            }
        };

        setupNotifications();

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(true);
            console.log('Notification received!', notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
        });

        // Clean up listeners on unmount
        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={themeColors.background}
            />
            <Slot />
        </SafeAreaView>
    );
}