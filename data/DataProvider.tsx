import React, { createContext, useContext, useEffect, PropsWithChildren } from 'react';
import { createStore, useStore } from 'zustand';
import * as api from '../api/apiService';
import { useAuth } from '../auth/AuthContext';

// Define the shape of our state
interface DataState {
  content: any[];
  collections: any[];
  persona: string;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  addContent: (contentData: any) => Promise<any>;
  updateContent: (id: string, updates: any) => Promise<void>;
  addCollection: (name: string) => Promise<any>;
  updatePersona: (persona: string) => Promise<void>;
}

// Create the Zustand store
const dataStore = createStore<DataState>((set, get) => ({
  content: [],
  collections: [],
  persona: '',
  loading: true,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [content, collections, persona] = await Promise.all([
        api.getContent(),
        api.getCollections(),
        api.getPersona(),
      ]);
      set({ content, collections, persona, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addContent: async (contentData) => {
    try {
      const newContent = await api.createContent(contentData);
      set(state => ({ content: [newContent, ...state.content] }));
      return newContent;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateContent: async (id, updates) => {
    try {
      const updatedContent = await api.updateContent(id, updates);
      set(state => ({
        content: state.content.map(c => c.id === id ? updatedContent : c),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addCollection: async (name) => {
    try {
      const newCollection = await api.createCollection(name);
      set(state => ({ collections: [...state.collections, newCollection] }));
      return newCollection;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updatePersona: async (persona) => {
    try {
      await api.updatePersona(persona);
      set({ persona });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));

// Create a hook to use the store
export const useData = () => useStore(dataStore);

const DataContext = createContext(null);

export const DataProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { session } = useAuth();
  const fetchData = useData().fetchData;

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  return <DataContext.Provider value={null}>{children}</DataContext.Provider>;
};