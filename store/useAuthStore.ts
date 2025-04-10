import {create} from 'zustand'
import {login as appWriteLogin, logout as appWriteLogout, getUser as appwriteCurrentUser} from '@/lib/appwrite'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {persist, createJSONStorage, type StateStorage} from "zustand/middleware";

type User = {
    $id: string,
    name: string,
    email: string,
    avatar?: string,
    emailVerification?: boolean,
    registration?: string,
}

type AuthStore = {
    user: User | null
    setUser: (user: User | null) => void
    loading: boolean
    login: () => Promise<boolean>
    logout: () => Promise<boolean>
    fetchUser: () => Promise<User | null>
}

const asyncStorage: StateStorage = {
    getItem: async (name: string) => {
        return await AsyncStorage.getItem(name);
    },
    setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
        await AsyncStorage.removeItem(name);
    }
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            setUser: (user: User | null) => set({ user }),
            
            login: async () => {
                set({ loading: true });
                try {
                    const session = await appWriteLogin();
                    if (session) {
                        const user = await appwriteCurrentUser();
                        if (user) {
                            set({ user });
                            return true;
                        }
                    }
                    return false;
                } catch (err) {
                    console.error('Login Error:', err);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },
            
            logout: async () => {
                set({ loading: true });
                try {
                    const success = await appWriteLogout();
                    if (success) {
                        set({ user: null });
                        return true;
                    }
                    return false;
                } catch (err) {
                    console.error('Logout Error:', err);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },
            
            fetchUser: async () => {
                set({ loading: true });
                try {
                    const user = await appwriteCurrentUser();
                    if (user) {
                        set({ user });
                        return user;
                    }
                    return null;
                } catch (err) {
                    console.error('Fetch User Error:', err);
                    set({ user: null });
                    return null;
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => asyncStorage),
        }
    )
);