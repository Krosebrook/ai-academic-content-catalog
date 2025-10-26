import React, { createContext, useContext, useEffect, PropsWithChildren } from 'react';
import { createStore, useStore } from 'zustand';
import { supabase } from '../api/supabaseClient';
import { Session, AuthError, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  setSession: (session: Session | null) => void;
  setError: (error: AuthError | null) => void;
  setLoading: (loading: boolean) => void;
}

const authStore = createStore<AuthState>((set) => ({
  session: null,
  loading: true,
  error: null,
  setSession: (session) => set({ session, error: null, loading: false }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));

export const useAuth = () => {
  const state = useStore(authStore);

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    authStore.getState().setLoading(true);
    authStore.getState().setError(null);
    const result = await supabase.auth.signUp(credentials);
    if (result.error) {
      authStore.getState().setError(result.error);
    }
    authStore.getState().setLoading(false);
    return result;
  };

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    authStore.getState().setLoading(true);
    authStore.getState().setError(null);
    const result = await supabase.auth.signInWithPassword(credentials);
    if (result.error) {
      authStore.getState().setError(result.error);
    }
    authStore.getState().setLoading(false);
    return result;
  };

  const signOut = async () => {
    authStore.getState().setLoading(true);
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle setting the session to null
    authStore.getState().setLoading(false);
  };

  return { ...state, signUp, signIn, signOut };
};

// Allow static access to actions
useAuth.getState = authStore.getState;

const AuthContext = createContext(null);

export const AuthContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      authStore.getState().setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authStore.getState().setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};