import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, getMe, clearToken } from '../services/api';
import type { UserDto } from '../services/api';

interface AuthStore {
  isAuthenticated: boolean;
  user: UserDto | null;
  showAuthModal: boolean;
  authMode: 'signin' | 'signup';
  loading: boolean;
  error: string | null;
  googleInitialized: boolean;

  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  initGoogle: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  user: null,
  showAuthModal: false,
  authMode: 'signin',
  loading: false,
  error: null,
  googleInitialized: false,

  openSignIn: () => set({ showAuthModal: true, authMode: 'signin', error: null }),
  openSignUp: () => set({ showAuthModal: true, authMode: 'signup', error: null }),
  closeAuthModal: () => set({ showAuthModal: false, error: null }),
  clearError: () => set({ error: null }),

  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(email, password);
      set({
        isAuthenticated: true,
        user: data.user,
        showAuthModal: false,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false });
    }
  },

  registerWithEmail: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRegister(name, email, password);
      set({
        isAuthenticated: true,
        user: data.user,
        showAuthModal: false,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', loading: false });
    }
  },

  // Real Google OAuth via Google Identity Services
  initGoogle: () => {
    const { googleInitialized } = get() as any;
    if (googleInitialized) return;

    const google = (window as any).google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          const { googleLogin } = await import('../services/api');
          const data = await googleLogin(response.credential);
          set({
            isAuthenticated: true,
            user: data.user,
            showAuthModal: false,
            loading: false,
          });
        } catch (err: any) {
          set({ error: err.message || 'Google login failed', loading: false });
        }
      },
    });

    set({ googleInitialized: true });
  },

  loginWithGoogle: () => {
    set({ loading: true, error: null });
    
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      set({ error: 'Google SDK not loaded. Please refresh.', loading: false });
      return;
    }

    google.accounts.id.prompt((notification: any) => {
      // Clear loading state if user dismisses the prompt
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        set({ loading: false });
        // If it was skipped/closed, maybe show a hint or just let them click again
        console.warn('[Google] Prompt was not displayed or skipped', notification.getMomentType());
      }
    });
  },

  logout: () => {
    clearToken();
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  // Check stored JWT on app load
  checkAuth: async () => {
    const user = await getMe();
    if (user) {
      set({ isAuthenticated: true, user });
    }
  },
}));
