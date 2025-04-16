import { StatusBar, useColorScheme, Platform } from 'react-native';
import { Slot } from 'expo-router';
import './globals.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColors } from '@/lib/appColors';



export default function RootLayout() {
    const colorScheme = useColorScheme();
    const themeColors = appColors[colorScheme === 'dark' ? 'dark' : 'light'];

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