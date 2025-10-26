import { supabase } from './supabaseClient';
import { RubricContent } from '../types/education';

// --- User Settings (Persona) ---
export const getPersona = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return '';
    
    const { data, error } = await supabase
        .from('user_settings')
        .select('persona')
        .eq('user_id', session.user.id)
        .single();
    if (error && error.code !== 'PGRST116') { // Ignore 'no rows found'
        console.error('Error fetching persona:', error);
        return '';
    }
    return data?.persona || '';
};

export const updatePersona = async (persona: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated");
    
    const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: session.user.id, persona }, { onConflict: 'user_id' });
    if (error) throw error;
};

// --- Collections ---
export const getCollections = async () => {
    const { data, error } = await supabase.from('collections').select('*');
    if (error) throw error;
    return data;
};

export const createCollection = async (name: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated");

    const { data, error } = await supabase.from('collections').insert([{ name, user_id: session.user.id }]).select();
    if (error) throw error;
    return data[0];
};

// --- Content ---
export const getContent = async () => {
    const { data, error } = await supabase.from('content').select('*').order('generatedAt', { ascending: false });
    if (error) throw error;
    // The 'data' column from supabase is the content object. We need to destructure it.
    return data.map(item => ({...item, data: item.data || {}}));
};

export const createContent = async (content: Omit<RubricContent, 'id' | 'generatedAt'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated");

    const newContent = {
        user_id: session.user.id,
        title: content.title,
        type: content.type,
        toolId: content.toolId,
        collectionId: (content as any).collectionId,
        data: content
    };

    const { data, error } = await supabase.from('content').insert([newContent]).select();
    if (error) throw error;
    // Return a format consistent with other data fetches
    const savedItem = data[0];
    return { ...savedItem, data: savedItem.data || {} };
};

export const updateContent = async (id: string, updates: any) => {
    const { data, error } = await supabase.from('content').update({ data: updates, title: updates.title, collectionId: updates.collectionId }).eq('id', id).select();
    if (error) throw error;
    const updatedItem = data[0];
    return { ...updatedItem, data: updatedItem.data || {} };
};

// --- Data Migration ---
export const batchCreateContent = async (contentItems: any[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated");

    const itemsToInsert = contentItems.map(item => ({
        id: item.id, // Preserve original UUID if possible
        user_id: session.user.id,
        title: item.title,
        type: item.type,
        toolId: item.toolId,
        collectionId: item.collectionId,
        generatedAt: item.generatedAt,
        data: item,
    }));

    const { data, error } = await supabase.from('content').upsert(itemsToInsert, { onConflict: 'id' });
    if (error) throw error;
    return data;
};