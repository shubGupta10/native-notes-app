import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync } from './helpers';

export async function scheduleDailyNotification() {
    try {
        const hasPermission = await registerForPushNotificationsAsync();
        if (!hasPermission) return false;

        await Notifications.cancelAllScheduledNotificationsAsync();

        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(19, 0, 0, 0); // 7:00 PM

        // If it's already past 7 PM, schedule for tomorrow
        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        // Schedule the notification using proper type casting
        if (Platform.OS === 'ios') {
            await Notifications.scheduleNotificationAsync({
                content : {
                    title: "🔔 Task Reminder",
                    body: "Have you completed your tasks today?",
                    sound: true,
                },
                trigger: {
                    hour: 19,
                    minute: 0,
                    repeats: true,
                } as Notifications.CalendarTriggerInput,
            });
        } else {
            // For Android use seconds (86400 seconds = 24 hours)
            await Notifications.scheduleNotificationAsync({
                content : {
                    title: "🔔 Task Reminder",
                    body: "Have you completed your tasks today?",
                    sound: true,
                },
                trigger: {
                    seconds: 86400,
                    repeats: true,
                } as Notifications.TimeIntervalTriggerInput,
            });
        }

        return true;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return false;
    }
}