import { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AppState {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoadingAuth: boolean;
    setIsLoadingAuth: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    isLoadingAuth: true,
    setIsLoadingAuth: (isLoadingAuth) => set({ isLoadingAuth }),
}));
