import { StatusBar } from 'react-native';
import {Slot} from 'expo-router'
import "./globals.css"
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <>
         <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle={'default'} />
            <Slot/>
            </SafeAreaView>
        </>
    );
}
